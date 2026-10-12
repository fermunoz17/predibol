"""
Offline ML pipeline for UCL match predictions.

Steps:
  1. Download historical results from football-data.co.uk (top-5 leagues, last 4 seasons)
  2. Compute Elo ratings for each team from those results
  3. Train a logistic regression on elo_diff -> H/D/A outcome
  4. Predict outcomes for all scheduled UCL matches in the DB
  5. Write a ModelRun + ModelPredictions row to the DB

Usage:
  DATABASE_URL=<url> FOOTBALL_DATA_API_KEY=<key> python ml/train.py
"""

import io
import json
import os
import uuid
import datetime
from difflib import SequenceMatcher
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the project root (one level up from ml/)
load_dotenv(Path(__file__).parent.parent / ".env")

import numpy as np
import pandas as pd
import psycopg2
import requests
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler

# ── Config ────────────────────────────────────────────────────────────────────

SEASONS = ["2122", "2223", "2324", "2425"]
LEAGUES = ["E0", "SP1", "I1", "D1", "F1"]
BASE_URL = "https://www.football-data.co.uk/mmz4281"

ELO_K = 32
ELO_BASE = 1500
HOME_ADV = 100  # added to home Elo before computing expected score

MODEL_VERSION = "v1-elo-logreg"

# ── Data loading ──────────────────────────────────────────────────────────────

def download_csvs(seasons: list[str], leagues: list[str]) -> pd.DataFrame:
    frames = []
    for season in seasons:
        for league in leagues:
            url = f"{BASE_URL}/{season}/{league}.csv"
            try:
                resp = requests.get(url, timeout=15)
                resp.raise_for_status()
                df = pd.read_csv(
                    io.StringIO(resp.text),
                    usecols=["Date", "HomeTeam", "AwayTeam", "FTHG", "FTAG", "FTR"],
                )
                df = df.dropna(subset=["FTR"])
                df["Date"] = pd.to_datetime(df["Date"], dayfirst=True)
                frames.append(df)
                print(f"  ✓ {league} {season}: {len(df)} matches")
            except Exception as exc:
                print(f"  ✗ {league} {season}: {exc}")

    if not frames:
        raise RuntimeError("No CSV data could be downloaded — check connectivity")

    return pd.concat(frames, ignore_index=True).sort_values("Date").reset_index(drop=True)


# ── Elo ───────────────────────────────────────────────────────────────────────

def _expected(elo_a: float, elo_b: float) -> float:
    return 1 / (1 + 10 ** ((elo_b - elo_a) / 400))


def build_dataset(matches: pd.DataFrame):
    """
    Iterate matches chronologically, recording pre-match Elo features then
    updating ratings.  Returns (X, y, final_elo_dict).
    """
    ratings: dict[str, float] = {}
    X_rows: list[list[float]] = []
    y_rows: list[int] = []

    for _, row in matches.iterrows():
        home, away, result = row["HomeTeam"], row["AwayTeam"], row["FTR"]

        r_home = ratings.get(home, ELO_BASE)
        r_away = ratings.get(away, ELO_BASE)

        elo_diff = (r_home + HOME_ADV) - r_away
        X_rows.append([elo_diff])
        y_rows.append({"H": 0, "D": 1, "A": 2}[result])

        # Update Elo AFTER recording features (prevents leakage)
        e_home = _expected(r_home + HOME_ADV, r_away)
        s_home = 1.0 if result == "H" else 0.0 if result == "A" else 0.5
        ratings[home] = r_home + ELO_K * (s_home - e_home)
        ratings[away] = r_away + ELO_K * ((1 - s_home) - (1 - e_home))

    return np.array(X_rows), np.array(y_rows), ratings


# ── Team name matching ────────────────────────────────────────────────────────

def fuzzy_match(name: str, candidates: list[str], threshold: float = 0.55) -> str | None:
    name_lower = name.lower()
    best_score, best = 0.0, None
    for c in candidates:
        score = SequenceMatcher(None, name_lower, c.lower()).ratio()
        if score > best_score:
            best_score, best = score, c
    return best if best_score >= threshold else None


# ── DB helpers ────────────────────────────────────────────────────────────────

def get_connection():
    db_url = os.environ["DATABASE_URL"].replace("?pgbouncer=true", "")
    return psycopg2.connect(db_url)


def get_scheduled_ucl_matches(conn) -> list[dict]:
    with conn.cursor() as cur:
        cur.execute("""
            SELECT m.id, m.match_date, m.stage,
                   ht.name AS home_team_name,
                   at.name AS away_team_name
              FROM matches m
              JOIN teams ht ON ht.id = m.home_team_id
              JOIN teams at ON at.id = m.away_team_id
             WHERE m.competition = 'UCL'
               AND m.status = 'scheduled'
             ORDER BY m.match_date
        """)
        cols = ["id", "match_date", "stage", "home_team_name", "away_team_name"]
        return [dict(zip(cols, row)) for row in cur.fetchall()]


def write_predictions(conn, metrics: dict, predictions: list[dict]) -> str:
    run_id = str(uuid.uuid4())
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO model_runs (id, model_version, trained_at, metrics)
            VALUES (%s, %s, %s, %s)
            """,
            (run_id, MODEL_VERSION, datetime.datetime.utcnow(), json.dumps(metrics)),
        )
        for pred in predictions:
            cur.execute(
                """
                INSERT INTO model_predictions
                  (id, match_id, model_run_id, home_win_prob, draw_prob, away_win_prob, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (match_id, model_run_id) DO UPDATE
                  SET home_win_prob = EXCLUDED.home_win_prob,
                      draw_prob     = EXCLUDED.draw_prob,
                      away_win_prob = EXCLUDED.away_win_prob
                """,
                (
                    str(uuid.uuid4()),
                    pred["match_id"],
                    run_id,
                    pred["home_win_prob"],
                    pred["draw_prob"],
                    pred["away_win_prob"],
                    datetime.datetime.utcnow(),
                ),
            )
    conn.commit()
    return run_id


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=== Predibol ML Pipeline ===\n")

    # 1. Download historical data
    print("Downloading historical match data...")
    matches = download_csvs(SEASONS, LEAGUES)
    print(f"\nTotal training matches: {len(matches)}\n")

    # 2. Build features + train
    print("Building features and training model...")
    X, y, final_elo = build_dataset(matches)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = LogisticRegression(max_iter=1000, C=1.0)
    cv_scores = cross_val_score(model, X_scaled, y, cv=5, scoring="accuracy")
    model.fit(X_scaled, y)

    metrics = {
        "cv_accuracy_mean": round(float(cv_scores.mean()), 4),
        "cv_accuracy_std": round(float(cv_scores.std()), 4),
        "training_samples": int(len(y)),
    }
    print(f"CV accuracy: {metrics['cv_accuracy_mean']:.4f} ± {metrics['cv_accuracy_std']:.4f}\n")

    # 3. Fetch scheduled UCL matches
    print("Fetching scheduled UCL matches from DB...")
    conn = get_connection()
    scheduled = get_scheduled_ucl_matches(conn)
    print(f"Found {len(scheduled)} scheduled matches\n")

    # 4. Predict
    elo_teams = list(final_elo.keys())
    avg_elo = float(np.mean(list(final_elo.values())))
    unmatched: set[str] = set()
    predictions = []

    for match in scheduled:
        home_key = fuzzy_match(match["home_team_name"], elo_teams)
        away_key = fuzzy_match(match["away_team_name"], elo_teams)

        home_elo = final_elo[home_key] if home_key else avg_elo
        away_elo = final_elo[away_key] if away_key else avg_elo

        if not home_key:
            unmatched.add(match["home_team_name"])
        if not away_key:
            unmatched.add(match["away_team_name"])

        elo_diff = (home_elo + HOME_ADV) - away_elo
        probs = model.predict_proba(scaler.transform([[elo_diff]]))[0]  # [H, D, A]

        predictions.append({
            "match_id": match["id"],
            "home_win_prob": round(float(probs[0]), 4),
            "draw_prob": round(float(probs[1]), 4),
            "away_win_prob": round(float(probs[2]), 4),
        })

    if unmatched:
        print(f"Teams using average Elo (no league data found): {sorted(unmatched)}\n")

    # 5. Write to DB
    print(f"Writing {len(predictions)} predictions to DB...")
    run_id = write_predictions(conn, metrics, predictions)
    conn.close()

    print(f"\n✓ Done")
    print(f"  Model run : {run_id}")
    print(f"  Version   : {MODEL_VERSION}")
    print(f"  Accuracy  : {metrics['cv_accuracy_mean']:.4f} ± {metrics['cv_accuracy_std']:.4f}")
    print(f"  Predicted : {len(predictions)} matches")


if __name__ == "__main__":
    main()
