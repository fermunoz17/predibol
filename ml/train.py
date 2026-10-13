"""
Offline ML pipeline for UCL match predictions — v3.

Features used:
  1. Elo difference (goal-diff weighted, with UCL history adjustment pass)
  2. Home team rolling form: avg goals scored / conceded (last 5 matches)
  3. Away team rolling form: avg goals scored / conceded (last 5 matches)
  4. Scoring edges: home_scored_avg - away_conceded_avg (and vice versa)

UCL Elo adjustment:
  - Fetches multiple historical UCL seasons from football-data.org API
  - Runs a second Elo pass over those results with UCL_K_MULT (1.5×)
  - UCL wins against elite opposition now meaningfully boost a team's Elo

Usage:
  python ml/train.py
"""

import io
import json
import os
import uuid
import datetime
from difflib import SequenceMatcher
from pathlib import Path

from dotenv import load_dotenv

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
HOME_ADV = 100
UCL_K_MULT = 2.0   # UCL matches weighted 2× domestic — knockout competition
UCL_BLEND  = 0.25  # how much UCL adjustment bleeds into prediction Elo
             # 0 = pure domestic, 1 = pure UCL-adjusted
             # 0.25 means UCL nudges ratings without dominating them
FORM_WINDOW = 5    # rolling window for recent form

# Historical UCL seasons to pull from football-data.org for Elo adjustment.
# Season value = year the season starts (2023 → 2023/24).
UCL_HISTORY_SEASONS = [2021, 2022, 2023, 2024, 2025]

FOOTBALL_DATA_API_KEY = os.environ.get("FOOTBALL_DATA_API_KEY", "")
FOOTBALL_DATA_BASE = "https://api.football-data.org/v4"

# Average goals per team per match across top-5 leagues — used when no form data
DEFAULT_SCORED = 1.35
DEFAULT_CONCEDED = 1.35

MODEL_VERSION = "v5-elo-ucl-blend-logreg"

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
                df = df.dropna(subset=["FTR", "FTHG", "FTAG"])
                df["Date"] = pd.to_datetime(df["Date"], dayfirst=True)
                df["FTHG"] = df["FTHG"].astype(int)
                df["FTAG"] = df["FTAG"].astype(int)
                frames.append(df)
                print(f"  ✓ {league} {season}: {len(df)} matches")
            except Exception as exc:
                print(f"  ✗ {league} {season}: {exc}")

    if not frames:
        raise RuntimeError("No CSV data downloaded — check connectivity")

    return pd.concat(frames, ignore_index=True).sort_values("Date").reset_index(drop=True)


# ── Elo ───────────────────────────────────────────────────────────────────────

def _expected(elo_a: float, elo_b: float) -> float:
    return 1 / (1 + 10 ** ((elo_b - elo_a) / 400))


def _gd_multiplier(gd: int) -> float:
    """Goal-difference Elo K multiplier (FiveThirtyEight-style)."""
    if gd <= 1:
        return 1.0
    elif gd == 2:
        return 1.5
    else:
        return 1.75


def _update_elo(ratings: dict, home: str, away: str,
                hg: int, ag: int, k_base: float = ELO_K) -> None:
    r_home = ratings.get(home, ELO_BASE)
    r_away = ratings.get(away, ELO_BASE)

    result = "H" if hg > ag else "A" if ag > hg else "D"
    gd = abs(hg - ag)
    k = k_base * _gd_multiplier(gd)

    e_home = _expected(r_home + HOME_ADV, r_away)
    s_home = 1.0 if result == "H" else 0.0 if result == "A" else 0.5

    ratings[home] = r_home + k * (s_home - e_home)
    ratings[away] = r_away + k * ((1 - s_home) - (1 - e_home))


def _update_form(team_form: dict, home: str, away: str, hg: int, ag: int) -> None:
    for team, scored, conceded in [(home, hg, ag), (away, ag, hg)]:
        history = team_form.get(team, [])
        history = (history + [{"s": scored, "c": conceded}])[-FORM_WINDOW:]
        team_form[team] = history


# ── Dataset builder ───────────────────────────────────────────────────────────

def build_dataset(matches: pd.DataFrame):
    """
    Iterate chronologically: record pre-match features, then update Elo + form.
    Features per match:
      [elo_diff, home_scored_avg, home_conceded_avg,
       away_scored_avg, away_conceded_avg,
       home_scoring_edge, away_scoring_edge]
    """
    ratings: dict[str, float] = {}
    team_form: dict[str, list] = {}
    X_rows, y_rows = [], []

    for _, row in matches.iterrows():
        home, away = row["HomeTeam"], row["AwayTeam"]
        result = row["FTR"]
        hg, ag = int(row["FTHG"]), int(row["FTAG"])

        r_home = ratings.get(home, ELO_BASE)
        r_away = ratings.get(away, ELO_BASE)
        elo_diff = (r_home + HOME_ADV) - r_away

        h_form = team_form.get(home, [])
        a_form = team_form.get(away, [])

        h_scored  = np.mean([f["s"] for f in h_form]) if h_form else DEFAULT_SCORED
        h_conceded = np.mean([f["c"] for f in h_form]) if h_form else DEFAULT_CONCEDED
        a_scored  = np.mean([f["s"] for f in a_form]) if a_form else DEFAULT_SCORED
        a_conceded = np.mean([f["c"] for f in a_form]) if a_form else DEFAULT_CONCEDED

        # Scoring edges: how much more/less a team scores vs what the opponent concedes
        home_scoring_edge = h_scored - a_conceded
        away_scoring_edge = a_scored - h_conceded

        X_rows.append([elo_diff, h_scored, h_conceded,
                        a_scored, a_conceded,
                        home_scoring_edge, away_scoring_edge])
        y_rows.append({"H": 0, "D": 1, "A": 2}[result])

        _update_elo(ratings, home, away, hg, ag)
        _update_form(team_form, home, away, hg, ag)

    return np.array(X_rows), np.array(y_rows), ratings, team_form


# ── UCL adjustment ────────────────────────────────────────────────────────────

def _fetch_ucl_season_results(season: int) -> list[tuple[str, str, int, int]]:
    """
    Fetch finished UCL matches for a given season year from football-data.org.
    Returns list of (home_name, away_name, home_goals, away_goals).
    """
    url = f"{FOOTBALL_DATA_BASE}/competitions/CL/matches?season={season}&status=FINISHED"
    headers = {"X-Auth-Token": FOOTBALL_DATA_API_KEY}
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
        matches = resp.json().get("matches", [])
        results = []
        for m in matches:
            ft = m.get("score", {}).get("fullTime", {})
            hg = ft.get("home")
            ag = ft.get("away")
            if hg is None or ag is None:
                continue
            results.append((
                m["homeTeam"]["name"],
                m["awayTeam"]["name"],
                int(hg),
                int(ag),
            ))
        print(f"  ✓ UCL {season}/{str(season + 1)[-2:]}: {len(results)} finished matches")
        return results
    except Exception as exc:
        print(f"  ✗ UCL {season}: {exc}")
        return []


def ucl_elo_adjustment(ratings: dict, team_form: dict, conn) -> tuple[dict, list]:
    """
    Second Elo pass (UCL_K_MULT × K) over historical UCL results.

    Sources (applied chronologically):
      1. Historical seasons from football-data.org API (UCL_HISTORY_SEASONS)
      2. Current-season finished UCL matches from the DB

    For each match, records pre-match features BEFORE updating Elo so those
    rows can be added to the training dataset.

    Returns:
      - counts dict for metrics
      - list of (X_row, y_label) training examples from UCL matches
    """
    candidates = list(ratings.keys())
    ucl_training: list[tuple[list, int]] = []

    def _process_result(home_name: str, away_name: str, hg: int, ag: int) -> bool:
        home_key = fuzzy_match(home_name, candidates)
        away_key = fuzzy_match(away_name, candidates)
        if not home_key or not away_key:
            return False

        # Capture pre-match features for training
        r_home = ratings.get(home_key, ELO_BASE)
        r_away = ratings.get(away_key, ELO_BASE)
        elo_diff = (r_home + HOME_ADV) - r_away

        h_form = team_form.get(home_key, [])
        a_form = team_form.get(away_key, [])
        h_scored   = np.mean([f["s"] for f in h_form]) if h_form else DEFAULT_SCORED
        h_conceded = np.mean([f["c"] for f in h_form]) if h_form else DEFAULT_CONCEDED
        a_scored   = np.mean([f["s"] for f in a_form]) if a_form else DEFAULT_SCORED
        a_conceded = np.mean([f["c"] for f in a_form]) if a_form else DEFAULT_CONCEDED

        result = "H" if hg > ag else "A" if ag > hg else "D"
        x_row = [elo_diff, h_scored, h_conceded, a_scored, a_conceded,
                 h_scored - a_conceded, a_scored - h_conceded]
        ucl_training.append((x_row, {"H": 0, "D": 1, "A": 2}[result]))

        # Update Elo + form after recording features
        _update_elo(ratings, home_key, away_key, hg, ag, k_base=ELO_K * UCL_K_MULT)
        _update_form(team_form, home_key, away_key, hg, ag)
        return True

    # ── 1. Historical seasons from football-data.org ──────────────────────────
    print("  Fetching historical UCL seasons from football-data.org...")
    api_updated = 0
    for season in UCL_HISTORY_SEASONS:
        for home_name, away_name, hg, ag in _fetch_ucl_season_results(season):
            if _process_result(home_name, away_name, hg, ag):
                api_updated += 1

    # ── 2. Current-season finished matches from DB ────────────────────────────
    with conn.cursor() as cur:
        cur.execute("""
            SELECT ht.name, at.name, m.home_score, m.away_score
              FROM matches m
              JOIN teams ht ON ht.id = m.home_team_id
              JOIN teams at ON at.id = m.away_team_id
             WHERE m.competition = 'UCL'
               AND m.status = 'finished'
               AND m.home_score IS NOT NULL
               AND m.away_score IS NOT NULL
             ORDER BY m.match_date
        """)
        db_results = cur.fetchall()

    db_updated = 0
    for home_name, away_name, hg, ag in db_results:
        if _process_result(home_name, away_name, hg, ag):
            db_updated += 1

    total = api_updated + db_updated
    print(f"  UCL Elo pass: {api_updated} historical + {db_updated} current-season = {total} matches")
    return {"ucl_history_matches": api_updated, "ucl_current_matches": db_updated}, ucl_training


# ── Team name matching ────────────────────────────────────────────────────────

# Maps football-data.org / UEFA team names → football-data.co.uk CSV names.
# Add entries here whenever a team's name causes a missed fuzzy match.
TEAM_ALIASES: dict[str, str] = {
    # France
    "Paris Saint-Germain FC":  "Paris SG",
    "Paris Saint-Germain":     "Paris SG",
    "Stade Brestois 29":       "Brest",
    "Lille OSC":               "Lille",
    "LOSC Lille":              "Lille",
    "Olympique de Marseille":  "Marseille",
    "Olympique Lyonnais":      "Lyon",
    "AS Monaco FC":            "Monaco",
    "Stade Rennais FC":        "Rennes",
    # Italy
    "FC Internazionale Milano": "Inter",
    "Internazionale Milano":    "Inter",
    "Internazionale":           "Inter",
    "SSC Napoli":               "Napoli",
    "AC Milan":                 "Milan",
    "AS Roma":                  "Roma",
    "SS Lazio":                 "Lazio",
    "ACF Fiorentina":           "Fiorentina",
    # Spain
    "Club Atlético de Madrid":  "Ath Madrid",
    "Athletic Club":            "Ath Bilbao",
    "Real Betis Balompié":      "Betis",
    "Villarreal CF":            "Villarreal",
    "Real Sociedad de Fútbol":  "Sociedad",
    "Deportivo Alavés":         "Alaves",
    # Germany
    "FC Bayern München":        "Bayern Munich",
    "Bayer 04 Leverkusen":      "Leverkusen",
    "Eintracht Frankfurt":      "Ein Frankfurt",
    "Borussia Mönchengladbach": "M'gladbach",
    "TSG 1899 Hoffenheim":      "Hoffenheim",
    "FC Augsburg":              "Augsburg",
    # England
    "Manchester City FC":       "Man City",
    "Manchester United FC":     "Man United",
    "Newcastle United FC":      "Newcastle",
    "Tottenham Hotspur FC":     "Tottenham",
    "Nottingham Forest FC":     "Nott'm Forest",
    "West Ham United FC":       "West Ham",
    "Wolverhampton Wanderers FC": "Wolves",
    "Leicester City FC":        "Leicester",
}


def fuzzy_match(name: str, candidates: list[str], threshold: float = 0.55) -> str | None:
    # Check alias map first
    resolved = TEAM_ALIASES.get(name, name)
    name_lower = resolved.lower()
    best_score, best = 0.0, None
    for c in candidates:
        score = SequenceMatcher(None, name_lower, c.lower()).ratio()
        if score > best_score:
            best_score, best = score, c
    return best if best_score >= threshold else None


# ── DB helpers ────────────────────────────────────────────────────────────────

def get_connection():
    return psycopg2.connect(os.environ["DATABASE_URL"].replace("?pgbouncer=true", ""))


def get_scheduled_ucl_matches(conn) -> list[dict]:
    with conn.cursor() as cur:
        cur.execute("""
            SELECT m.id, m.match_date, m.stage,
                   ht.name  AS home_team_name,
                   at.name  AS away_team_name,
                   hs.rank              AS home_ucl_rank,
                   hs.played            AS home_ucl_played,
                   hs.won               AS home_ucl_won,
                   hs.drawn             AS home_ucl_drawn,
                   hs.lost              AS home_ucl_lost,
                   hs.goals_for         AS home_ucl_gf,
                   hs.goals_against     AS home_ucl_ga,
                   hs.goal_difference   AS home_ucl_gd,
                   hs.points            AS home_ucl_pts,
                   hs.ranking_coefficient AS home_ucl_coeff,
                   as_.rank             AS away_ucl_rank,
                   as_.played           AS away_ucl_played,
                   as_.won              AS away_ucl_won,
                   as_.drawn            AS away_ucl_drawn,
                   as_.lost             AS away_ucl_lost,
                   as_.goals_for        AS away_ucl_gf,
                   as_.goals_against    AS away_ucl_ga,
                   as_.goal_difference  AS away_ucl_gd,
                   as_.points           AS away_ucl_pts,
                   as_.ranking_coefficient AS away_ucl_coeff
              FROM matches m
              JOIN teams ht  ON ht.id  = m.home_team_id
              JOIN teams at  ON at.id  = m.away_team_id
              LEFT JOIN ucl_standings hs ON hs.team_id = m.home_team_id AND hs.season_year = '2027'
              LEFT JOIN ucl_standings as_ ON as_.team_id = m.away_team_id AND as_.season_year = '2027'
             WHERE m.competition = 'UCL'
               AND m.status = 'scheduled'
             ORDER BY m.match_date
        """)
        cols = [
            "id", "match_date", "stage", "home_team_name", "away_team_name",
            "home_ucl_rank", "home_ucl_played", "home_ucl_won", "home_ucl_drawn",
            "home_ucl_lost", "home_ucl_gf", "home_ucl_ga", "home_ucl_gd",
            "home_ucl_pts", "home_ucl_coeff",
            "away_ucl_rank", "away_ucl_played", "away_ucl_won", "away_ucl_drawn",
            "away_ucl_lost", "away_ucl_gf", "away_ucl_ga", "away_ucl_gd",
            "away_ucl_pts", "away_ucl_coeff",
        ]
        return [dict(zip(cols, row)) for row in cur.fetchall()]


def write_predictions(conn, metrics: dict, predictions: list[dict]) -> str:
    run_id = str(uuid.uuid4())
    now = datetime.datetime.now(datetime.timezone.utc)

    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO model_runs (id, model_version, trained_at, metrics) VALUES (%s, %s, %s, %s)",
            (run_id, MODEL_VERSION, now, json.dumps(metrics)),
        )
        for pred in predictions:
            cur.execute(
                """
                INSERT INTO model_predictions
                  (id, match_id, model_run_id,
                   home_win_prob, draw_prob, away_win_prob,
                   home_elo, away_elo, elo_diff, features, created_at)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (match_id, model_run_id) DO UPDATE SET
                  home_win_prob = EXCLUDED.home_win_prob,
                  draw_prob     = EXCLUDED.draw_prob,
                  away_win_prob = EXCLUDED.away_win_prob,
                  home_elo      = EXCLUDED.home_elo,
                  away_elo      = EXCLUDED.away_elo,
                  elo_diff      = EXCLUDED.elo_diff,
                  features      = EXCLUDED.features
                """,
                (
                    str(uuid.uuid4()), pred["match_id"], run_id,
                    pred["home_win_prob"], pred["draw_prob"], pred["away_win_prob"],
                    pred.get("home_elo"), pred.get("away_elo"), pred.get("elo_diff"),
                    json.dumps(pred.get("features")),
                    now,
                ),
            )
    conn.commit()
    return run_id


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=== Predibol ML Pipeline v2 ===\n")

    # 1. Download historical data
    print("Downloading historical match data...")
    matches = download_csvs(SEASONS, LEAGUES)
    print(f"\nTotal training matches: {len(matches)}\n")

    # 2. Build features + train (includes Elo + form)
    print("Building features and training model...")
    X, y, ratings, team_form = build_dataset(matches)

    # 3. UCL-specific Elo adjustment (requires DB)
    print("Connecting to DB for UCL adjustment...")

    # Save domestic ratings before UCL pass so we can blend later
    domestic_ratings = dict(ratings)

    # ── Diagnostic: top Elos after domestic phase ─────────────────────────────
    top10 = sorted(ratings.items(), key=lambda x: x[1], reverse=True)[:10]
    psg_d = domestic_ratings.get("Paris SG")
    mc_d  = domestic_ratings.get("Man City")
    print("\n[Domestic Elo] PSG:      ", round(psg_d) if psg_d else "NOT FOUND")
    print("[Domestic Elo] Man City: ", round(mc_d) if mc_d else "NOT FOUND")
    print("[Domestic top 10]:", [(k, round(v)) for k, v in top10])
    print()
    # ─────────────────────────────────────────────────────────────────────────

    conn = get_connection()
    ucl_counts, ucl_training = ucl_elo_adjustment(ratings, team_form, conn)

    # Blend: final = domestic + UCL_BLEND × (ucl_adjusted − domestic)
    # Teams with no domestic data keep their UCL-adjusted value directly.
    blended_ratings = {
        team: domestic_ratings.get(team, ELO_BASE) + UCL_BLEND * (ucl_elo - domestic_ratings.get(team, ELO_BASE))
        for team, ucl_elo in ratings.items()
    }

    # ── Diagnostic: blended Elos ──────────────────────────────────────────────
    psg_b = blended_ratings.get("Paris SG")
    mc_b  = blended_ratings.get("Man City")
    print("\n[Blended Elo] PSG:      ", round(psg_b) if psg_b else "NOT FOUND")
    print("[Blended Elo] Man City: ", round(mc_b) if mc_b else "NOT FOUND")
    if psg_b and mc_b:
        print("[Blended Elo diff (Man City eff. vs PSG)]:", round((mc_b + HOME_ADV) - psg_b))
    print()
    # ─────────────────────────────────────────────────────────────────────────

    # 4. Merge UCL training rows into the domestic dataset
    # UCL rows used pre-match domestic Elos, so they're in the same feature
    # distribution as domestic rows. This teaches the model to predict UCL
    # outcomes, not just domestic ones.
    if ucl_training:
        X_ucl = np.array([row for row, _ in ucl_training])
        y_ucl = np.array([label for _, label in ucl_training])
        X = np.vstack([X, X_ucl])
        y = np.concatenate([y, y_ucl])
        print(f"  Added {len(ucl_training)} UCL training rows → total {len(y)} samples\n")

    # 5. Train logistic regression
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    model = LogisticRegression(max_iter=2000, C=1.0)
    cv_scores = cross_val_score(model, X_scaled, y, cv=5, scoring="accuracy")
    model.fit(X_scaled, y)

    metrics = {
        "cv_accuracy_mean": round(float(cv_scores.mean()), 4),
        "cv_accuracy_std": round(float(cv_scores.std()), 4),
        "training_samples": int(len(y)),
        "features": ["elo_diff", "home_scored_avg", "home_conceded_avg",
                      "away_scored_avg", "away_conceded_avg",
                      "home_scoring_edge", "away_scoring_edge"],
        "model_version": MODEL_VERSION,
        **ucl_counts,
    }
    print(f"CV accuracy: {metrics['cv_accuracy_mean']:.4f} ± {metrics['cv_accuracy_std']:.4f}\n")

    # 6. Fetch scheduled UCL matches + predict
    print("Fetching scheduled UCL matches...")
    scheduled = get_scheduled_ucl_matches(conn)
    print(f"Found {len(scheduled)} scheduled matches\n")

    elo_teams = list(blended_ratings.keys())
    avg_elo = float(np.mean(list(blended_ratings.values())))
    unmatched: set[str] = set()
    predictions = []

    for match in scheduled:
        home_key = fuzzy_match(match["home_team_name"], elo_teams)
        away_key = fuzzy_match(match["away_team_name"], elo_teams)

        home_elo = blended_ratings[home_key] if home_key else avg_elo
        away_elo = blended_ratings[away_key] if away_key else avg_elo

        if not home_key: unmatched.add(match["home_team_name"])
        if not away_key: unmatched.add(match["away_team_name"])

        h_form = team_form.get(home_key, []) if home_key else []
        a_form = team_form.get(away_key, []) if away_key else []

        h_scored  = round(np.mean([f["s"] for f in h_form]) if h_form else DEFAULT_SCORED, 2)
        h_conceded = round(np.mean([f["c"] for f in h_form]) if h_form else DEFAULT_CONCEDED, 2)
        a_scored  = round(np.mean([f["s"] for f in a_form]) if a_form else DEFAULT_SCORED, 2)
        a_conceded = round(np.mean([f["c"] for f in a_form]) if a_form else DEFAULT_CONCEDED, 2)
        elo_diff = (home_elo + HOME_ADV) - away_elo

        feat_vec = [elo_diff, h_scored, h_conceded, a_scored, a_conceded,
                    h_scored - a_conceded, a_scored - h_conceded]
        probs = model.predict_proba(scaler.transform([feat_vec]))[0]  # [H, D, A]

        # UCL standings (context — not model inputs, but stored for UI)
        ucl_home = {
            "rank":   match["home_ucl_rank"],
            "played": match["home_ucl_played"],
            "won":    match["home_ucl_won"],
            "drawn":  match["home_ucl_drawn"],
            "lost":   match["home_ucl_lost"],
            "gf":     match["home_ucl_gf"],
            "ga":     match["home_ucl_ga"],
            "gd":     match["home_ucl_gd"],
            "pts":    match["home_ucl_pts"],
            "coeff":  round(match["home_ucl_coeff"], 3) if match["home_ucl_coeff"] else None,
        } if match["home_ucl_rank"] is not None else None

        ucl_away = {
            "rank":   match["away_ucl_rank"],
            "played": match["away_ucl_played"],
            "won":    match["away_ucl_won"],
            "drawn":  match["away_ucl_drawn"],
            "lost":   match["away_ucl_lost"],
            "gf":     match["away_ucl_gf"],
            "ga":     match["away_ucl_ga"],
            "gd":     match["away_ucl_gd"],
            "pts":    match["away_ucl_pts"],
            "coeff":  round(match["away_ucl_coeff"], 3) if match["away_ucl_coeff"] else None,
        } if match["away_ucl_rank"] is not None else None

        predictions.append({
            "match_id": match["id"],
            "home_win_prob": round(float(probs[0]), 4),
            "draw_prob":     round(float(probs[1]), 4),
            "away_win_prob": round(float(probs[2]), 4),
            "home_elo": round(home_elo, 1),
            "away_elo": round(away_elo, 1),
            "elo_diff": round(elo_diff, 1),
            "features": {
                "home_form": h_form,
                "away_form": a_form,
                "home_form_avg_scored":   h_scored,
                "home_form_avg_conceded": h_conceded,
                "away_form_avg_scored":   a_scored,
                "away_form_avg_conceded": a_conceded,
                "home_scoring_edge": round(h_scored - a_conceded, 2),
                "away_scoring_edge": round(a_scored - h_conceded, 2),
                "ucl_home": ucl_home,
                "ucl_away": ucl_away,
            },
        })

    if unmatched:
        print(f"Teams using average Elo/form (not in top-5 leagues): {sorted(unmatched)}\n")

    # 7. Write to DB
    print(f"Writing {len(predictions)} predictions to DB...")
    run_id = write_predictions(conn, metrics, predictions)
    conn.close()

    print(f"\n✓ Done")
    print(f"  Model run    : {run_id}")
    print(f"  Version      : {MODEL_VERSION}")
    print(f"  Accuracy     : {metrics['cv_accuracy_mean']:.4f} ± {metrics['cv_accuracy_std']:.4f}")
    print(f"  UCL history  : {ucl_counts['ucl_history_matches']} matches across {len(UCL_HISTORY_SEASONS)} seasons")
    print(f"  Predicted    : {len(predictions)} matches")


if __name__ == "__main__":
    main()
