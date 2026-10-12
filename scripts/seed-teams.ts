/**
 * Fetches the current UCL squad from football-data.org and upserts
 * all teams into the `teams` table.
 *
 * Usage:
 *   FOOTBALL_DATA_API_KEY=<key> DATABASE_URL=<url> npx tsx scripts/seed-teams.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface FDTeam {
  id: number;
  name: string;
  area: { name: string };
}

interface FDResponse {
  teams: FDTeam[];
}

async function main() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    throw new Error("FOOTBALL_DATA_API_KEY environment variable is required");
  }

  console.log("Fetching UCL teams from football-data.org...");

  const res = await fetch(
    "https://api.football-data.org/v4/competitions/CL/teams",
    { headers: { "X-Auth-Token": apiKey } }
  );

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as FDResponse;
  console.log(`Found ${data.teams.length} teams. Upserting into database...`);

  for (const team of data.teams) {
    await prisma.team.upsert({
      where: { externalRef: String(team.id) },
      create: {
        name: team.name,
        country: team.area.name,
        externalRef: String(team.id),
      },
      update: {
        name: team.name,
        country: team.area.name,
      },
    });
  }

  console.log(`Done — upserted ${data.teams.length} teams.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
