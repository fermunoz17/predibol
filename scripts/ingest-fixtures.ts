/**
 * Fetches current UCL fixtures/results from football-data.org and upserts
 * them into the matches table. Existing rows are matched by externalRef
 * (football-data.org match ID) so status and scores stay current.
 *
 * Usage:
 *   npm run db:ingest-fixtures
 *
 * Env vars required:
 *   FOOTBALL_DATA_API_KEY  — free-tier key from football-data.org
 *   DATABASE_URL           — Postgres connection string (via Prisma)
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

// Load .env from project root (tsx doesn't auto-load it outside Next.js)
try {
  const envFile = readFileSync(resolve(process.cwd(), ".env"), "utf8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      if (!(key in process.env)) process.env[key] = val;
    }
  }
} catch {
  // .env not present — rely on real environment variables
}

const prisma = new PrismaClient();

const API_BASE = "https://api.football-data.org/v4";
// Season value = year the season starts. 2025 → 2025/26 UCL.
const UCL_SEASON = 2025;

// football-data.org name → DB canonical name.
// Only needed when fuzzy matching would fail (score < 0.4).
// Use exact DB names (see `teams` table).
const ALIASES: Record<string, string> = {
  "Sport Lisboa e Benfica": "SL Benfica",
};

// football-data.org status → our schema status
function mapStatus(apiStatus: string): string {
  switch (apiStatus) {
    case "IN_PLAY":
    case "PAUSED":
    case "HALFTIME":
      return "live";
    case "FINISHED":
    case "AWARDED":
      return "finished";
    default:
      // SCHEDULED, TIMED, POSTPONED, CANCELLED, SUSPENDED
      return "scheduled";
  }
}

// football-data.org stage → human-readable label
function mapStage(apiStage: string): string {
  return apiStage
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface FdTeam {
  id: number;
  name: string;
  shortName: string;
}

interface FdScore {
  fullTime: { home: number | null; away: number | null };
}

interface FdMatch {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  homeTeam: FdTeam;
  awayTeam: FdTeam;
  score: FdScore;
}

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

function fuzzyScore(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.9;
  const trigrams = (s: string) =>
    new Set(Array.from({ length: Math.max(0, s.length - 2) }, (_, i) => s.slice(i, i + 3)));
  const ta = trigrams(na);
  const tb = trigrams(nb);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  ta.forEach((t) => { if (tb.has(t)) inter++; });
  return inter / (ta.size + tb.size - inter);
}

async function fetchFixtures(): Promise<FdMatch[]> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) throw new Error("FOOTBALL_DATA_API_KEY is not set");

  const url = `${API_BASE}/competitions/CL/matches?season=${UCL_SEASON}`;
  const res = await fetch(url, {
    headers: { "X-Auth-Token": apiKey },
  });

  if (!res.ok) {
    throw new Error(`football-data.org API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json() as { matches: FdMatch[] };
  return data.matches ?? [];
}

async function main() {
  console.log(`Fetching UCL ${UCL_SEASON}/${String(UCL_SEASON + 1).slice(-2)} fixtures from football-data.org...`);

  const matches = await fetchFixtures();
  console.log(`Got ${matches.length} matches from API.\n`);

  const dbTeams = await prisma.team.findMany();
  // Build a map: football-data.org team ID → DB team (populated as we match)
  const teamCache = new Map<number, string>(); // fdTeamId → dbTeamId

  async function resolveTeam(fdTeam: FdTeam): Promise<string> {
    if (teamCache.has(fdTeam.id)) return teamCache.get(fdTeam.id)!;

    // 1. Exact match by externalRef (set by a previous run)
    const byRef = dbTeams.find((t) => t.externalRef === String(fdTeam.id));
    if (byRef) {
      teamCache.set(fdTeam.id, byRef.id);
      return byRef.id;
    }

    // 2. Alias map then fuzzy match
    const lookupName = ALIASES[fdTeam.name] ?? fdTeam.name;
    let bestTeam = dbTeams.length > 0 ? dbTeams[0] : null;
    let bestScore = 0;
    for (const dbTeam of dbTeams) {
      const score = fuzzyScore(lookupName, dbTeam.name);
      if (score > bestScore) { bestScore = score; bestTeam = dbTeam; }
    }

    if (bestScore >= 0.4 && bestTeam) {
      teamCache.set(fdTeam.id, bestTeam.id);
      return bestTeam.id;
    }

    // 3. Not in DB — create the team using football-data.org data
    const newTeam = await prisma.team.create({
      data: {
        name: fdTeam.name,
        externalRef: String(fdTeam.id),
      },
    });
    dbTeams.push(newTeam); // keep local cache in sync
    teamCache.set(fdTeam.id, newTeam.id);
    console.log(`  + Created team: "${fdTeam.name}" (fd id: ${fdTeam.id})`);
    return newTeam.id;
  }

  let upserted = 0;
  let skipped = 0;

  for (const m of matches) {
    const homeTeamId = await resolveTeam(m.homeTeam);
    const awayTeamId = await resolveTeam(m.awayTeam);

    const status = mapStatus(m.status);
    const ft = m.score?.fullTime;
    const homeScore = ft?.home ?? null;
    const awayScore = ft?.away ?? null;

    const data = {
      homeTeamId,
      awayTeamId,
      matchDate: new Date(m.utcDate),
      competition: "UCL",
      stage: mapStage(m.stage),
      status,
      homeScore: status === "finished" ? homeScore : null,
      awayScore: status === "finished" ? awayScore : null,
    };

    await prisma.match.upsert({
      where: { externalRef: String(m.id) },
      create: { externalRef: String(m.id), ...data },
      update: data,
    });

    upserted++;
  }

  // Backfill externalRef on fuzzy-matched teams so future runs use exact lookup
  let refsUpdated = 0;
  for (const [fdId, dbId] of teamCache) {
    const dbTeam = dbTeams.find((t) => t.id === dbId);
    if (dbTeam && !dbTeam.externalRef) {
      await prisma.team.update({
        where: { id: dbId },
        data: { externalRef: String(fdId) },
      });
      refsUpdated++;
    }
  }

  console.log(`\nDone — upserted ${upserted} matches, skipped ${skipped}, updated ${refsUpdated} team externalRefs.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
