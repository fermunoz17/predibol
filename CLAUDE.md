# UCL Predictive Modeling App

## Goal
A full-stack web app that surfaces UEFA Champions League (UCL) match predictions,
backed by a maintainable offline-trained ML pipeline. Success = accurate outcome
forecasting + a polished, deployed product.

## Tech stack (decided, do not deviate without discussion)
- **Frontend/Backend**: Next.js, deployed on Vercel (API routes for backend logic)
- **Database**: Supabase (Postgres) — also handles auth (Supabase Auth), one service
  for both DB + user management
- **ORM**: Prisma — schema already drafted at `prisma/schema.prisma`
- **Data sources**:
  - football-data.co.uk (via GitHub mirror: https://github.com/datasets/football-datasets)
    — historical results + betting odds across the top 5 European leagues (Premier
    League, La Liga, Serie A, Bundesliga, Ligue 1), CSV, updated daily, free
  - football-data.org free API — current-season UCL fixtures/results, free tier,
    ~10 calls/min rate limit, no lineup/tactical data on free tier
- **ML pipeline**: Python (pandas, scikit-learn). Trained OFFLINE, not as a Vercel
  serverless function — Vercel functions are not suited to ML training workloads.
  Predictions are computed offline and written to Postgres via a scheduled job
  (GitHub Actions cron). The Next.js app only ever reads pre-computed predictions
  from the DB — no live inference infrastructure needed for v1.

## Architecture flow
GitHub Actions (scheduled) → pulls fresh data from football-data.co.uk +
football-data.org → Python script retrains/generates predictions → writes to
Supabase Postgres → Next.js app (on Vercel) reads via Prisma → users log in via
Supabase Auth and view predictions in the React UI.

## Database schema (see prisma/schema.prisma)
- `users` — app-facing profile data (Supabase Auth owns credentials/sessions separately)
- `teams` — includes `external_ref` to map cleanly to football-data.org/co.uk team IDs
- `matches` — home/away teams, date, competition, stage, scores, status
- `model_runs` — one row per training run (version, timestamp, metrics as JSON)
- `model_predictions` — win/draw/loss probabilities per match per model run
- `prediction_votes` — optional: lets logged-in users make their own picks vs. the model

## Principles established so far
- Start simple: build the initial model on results + odds data before adding
  lineup/formation complexity
- Lineup/tactical data is a later enrichment (candidate: API-Football free tier,
  100 requests/day) — not needed for v1
- Keep the stack to as few services as possible: Vercel + Supabase + GitHub Actions

## Immediate next steps
1. Scaffold the Next.js app (App Router) with Prisma + Supabase client wired up
2. Run `npx prisma migrate dev` against a Supabase Postgres instance to create tables
3. Build the data ingestion script for football-data.co.uk CSVs
4. Build the football-data.org API client for current UCL fixtures
5. Set up the offline training script (Python) and a GitHub Actions workflow to run
   it on a schedule, writing predictions into `model_predictions`
6. Build the Next.js UI to read and display predictions

## On the horizon (not yet decided, revisit later)
- Whether Supabase Auth is sufficient or a dedicated provider (Clerk) is worth adding
- Whether to add a live inference path later (FastAPI on Railway/Render) vs.
  staying fully offline/scheduled
