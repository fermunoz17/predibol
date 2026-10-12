/**
 * Fetches the current UCL fixtures/results from football-data.org and
 * upserts them into the `matches` table.
 *
 * Usage:
 *   npm run db:ingest-fixtures
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface FDTeamRef {
  id: number;
  name: string;
}

interface FDScore {
  fullTime: { home: number | null; away: number | null };
}

interface FDMatch {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  homeTeam: FDTeamRef;
  awayTeam: FDTeamRef;
  score: FDScore;
}

interface FDResponse {
  matches: FDMatch[];
}

function mapStatus(fdStatus: string): string {
  switch (fdStatus) {
    case "FINISHED":
      return "finished";
    case "IN_PLAY":
    case "PAUSED":
    case "HALF_TIME":
      return "live";
    default:
      return "scheduled";
  }
}

function mapStage(fdStage: string): string {
  const stages: Record<string, string> = {
    LEAGUE_PHASE: "League Phase",
    ROUND_OF_16: "Round of 16",
    QUARTER_FINALS: "Quarter Finals",
    SEMI_FINALS: "Semi Finals",
    FINAL: "Final",
  };
  return stages[fdStage] ?? fdStage;
}

async function main() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    throw new Error("FOOTBALL_DATA_API_KEY environment variable is required");
  }

  console.log("Fetching UCL fixtures from football-data.org...");

  const res = await fetch(
    "https://api.football-data.org/v4/competitions/CL/matches",
    { headers: { "X-Auth-Token": apiKey } }
  );

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as FDResponse;
  console.log(`Found ${data.matches.length} matches. Upserting...`);

  // Pre-load all teams keyed by externalRef for fast lookup
  const teams = await prisma.team.findMany({ select: { id: true, externalRef: true } });
  const teamMap = new Map(teams.map((t) => [t.externalRef, t.id]));

  let upserted = 0;
  let skipped = 0;

  for (const match of data.matches) {
    const homeTeamId = teamMap.get(String(match.homeTeam.id));
    const awayTeamId = teamMap.get(String(match.awayTeam.id));

    if (!homeTeamId || !awayTeamId) {
      console.warn(
        `Skipping match ${match.id}: team not found (home=${match.homeTeam.id}, away=${match.awayTeam.id})`
      );
      skipped++;
      continue;
    }

    await prisma.match.upsert({
      where: { externalRef: String(match.id) },
      create: {
        externalRef: String(match.id),
        homeTeamId,
        awayTeamId,
        matchDate: new Date(match.utcDate),
        competition: "UCL",
        stage: mapStage(match.stage),
        homeScore: match.score.fullTime.home,
        awayScore: match.score.fullTime.away,
        status: mapStatus(match.status),
      },
      update: {
        matchDate: new Date(match.utcDate),
        stage: mapStage(match.stage),
        homeScore: match.score.fullTime.home,
        awayScore: match.score.fullTime.away,
        status: mapStatus(match.status),
      },
    });

    upserted++;
  }

  console.log(`Done — upserted ${upserted} matches, skipped ${skipped}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
