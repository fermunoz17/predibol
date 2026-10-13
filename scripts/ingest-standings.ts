/**
 * Fetches UCL standings from the UEFA API and upserts them into ucl_standings.
 * Also updates teams.logo_url from the UEFA data.
 *
 * Usage:
 *   npm run db:ingest-standings
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STANDINGS_URL =
  "https://standings.uefa.com/v1/standings?competitionId=1&seasonYear=2027";

interface UefaTeam {
  id: string;
  teamCode: string;
  internationalName: string;
  countryCode: string;
  logoUrl?: string;
  translations?: {
    displayName?: Record<string, string>;
  };
}

interface UefaItem {
  rank: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  totalPoints: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  rankingCoefficient?: number;
  team: UefaTeam;
}

interface UefaStandingsResponse {
  items: UefaItem[];
}

function getLogoUrl(team: UefaTeam): string | null {
  // UEFA provides logos at multiple sizes — use 70x70 as thumbnail
  if (!team.id) return null;
  return `https://img.uefa.com/imgml/TP/teams/logos/70x70/${team.id}.png`;
}

// Manual overrides for UEFA short names that don't fuzzy-match well
const ALIASES: Record<string, string> = {
  "man utd":    "Manchester United FC",
  "man city":   "Manchester City FC",
  "sporting cp": "Sporting Clube de Portugal",
  "aek athens": "PAE AEK",
  "atleti":     "Club Atlético de Madrid",
};

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

function fuzzyScore(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.9;
  // Jaccard on trigrams
  const trigrams = (s: string) =>
    new Set(Array.from({ length: s.length - 2 }, (_, i) => s.slice(i, i + 3)));
  const ta = trigrams(na);
  const tb = trigrams(nb);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  ta.forEach((t) => { if (tb.has(t)) inter++; });
  return inter / (ta.size + tb.size - inter);
}

async function main() {
  console.log("Fetching UCL standings from UEFA API...");

  const res = await fetch(STANDINGS_URL);
  if (!res.ok) throw new Error(`UEFA API failed: ${res.status} ${res.statusText}`);

  const raw = await res.json() as UefaStandingsResponse[];
  const data = Array.isArray(raw) ? raw[0] : raw;
  const items: UefaItem[] = data.items;

  console.log(`Got ${items.length} teams from UEFA standings.\n`);

  // Load all teams from DB for matching
  const dbTeams = await prisma.team.findMany();

  let upserted = 0;
  let unmatched: string[] = [];

  for (const item of items) {
    const uefaName = item.team.internationalName;
    const logoUrl = getLogoUrl(item.team);

    // Check alias map first, then fall back to fuzzy match
    const aliasTarget = ALIASES[uefaName.toLowerCase()];
    let bestTeam = dbTeams[0];
    let bestScore = 0;

    for (const dbTeam of dbTeams) {
      const score = aliasTarget
        ? (dbTeam.name === aliasTarget ? 1 : 0)
        : fuzzyScore(uefaName, dbTeam.name);
      if (score > bestScore) {
        bestScore = score;
        bestTeam = dbTeam;
      }
    }

    if (bestScore < 0.4) {
      unmatched.push(uefaName);
      console.warn(`  ✗ No match for "${uefaName}" (best: "${bestTeam.name}" @ ${bestScore.toFixed(2)})`);
      continue;
    }

    console.log(`  ✓ #${item.rank} ${uefaName} → "${bestTeam.name}" (score: ${bestScore.toFixed(2)})`);

    // Update logo URL on the team
    if (logoUrl) {
      await prisma.team.update({
        where: { id: bestTeam.id },
        data: { logoUrl },
      });
    }

    // Upsert standing
    await prisma.uclStanding.upsert({
      where: { teamId_seasonYear: { teamId: bestTeam.id, seasonYear: "2027" } },
      create: {
        teamId: bestTeam.id,
        uclTeamId: item.team.id,
        seasonYear: "2027",
        rank: item.rank,
        played: item.played,
        won: item.won,
        drawn: item.drawn,
        lost: item.lost,
        goalsFor: item.goalsFor,
        goalsAgainst: item.goalsAgainst,
        goalDifference: item.goalDifference,
        points: item.points,
        rankingCoefficient: item.rankingCoefficient ?? null,
        updatedAt: new Date(),
      },
      update: {
        uclTeamId: item.team.id,
        rank: item.rank,
        played: item.played,
        won: item.won,
        drawn: item.drawn,
        lost: item.lost,
        goalsFor: item.goalsFor,
        goalsAgainst: item.goalsAgainst,
        goalDifference: item.goalDifference,
        points: item.points,
        rankingCoefficient: item.rankingCoefficient ?? null,
        updatedAt: new Date(),
      },
    });

    upserted++;
  }

  console.log(`\nDone — upserted ${upserted} standings, ${unmatched.length} unmatched.`);
  if (unmatched.length) console.log("Unmatched:", unmatched);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
