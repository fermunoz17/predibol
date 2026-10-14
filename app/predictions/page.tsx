import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { MatchList } from "./MatchList";
import { MatchdayNav } from "./MatchdayNav";
import { TeamFilter } from "./TeamFilter";
import { TabNav } from "./TabNav";
import { ResultsList, AccuracySummary } from "./ResultsList";
import type { ResultMatch } from "./ResultsList";

// ── Matchday grouping ─────────────────────────────────────────────────────────

function buildMatchdayWindows(dates: Date[]): { start: number; end: number }[] {
  const days = [...new Set(dates.map((d) => new Date(d.toDateString()).getTime()))].sort(
    (a, b) => a - b
  );

  const windows: { start: number; end: number }[] = [];
  let start = days[0];
  let prev = days[0];

  for (let i = 1; i < days.length; i++) {
    const gap = (days[i] - prev) / 86_400_000;
    if (gap > 3) {
      windows.push({ start, end: prev + 86_400_000 - 1 });
      start = days[i];
    }
    prev = days[i];
  }
  if (days.length) windows.push({ start, end: prev + 86_400_000 - 1 });

  return windows;
}

function windowLabel(window: { start: number; end: number }): string {
  const fmt = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const s = fmt(window.start);
  const e = fmt(window.end - 1);
  return s === e ? s : `${s} – ${e}`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: Promise<{ matchday?: string; team?: string; tab?: string }>;
}) {
  const { matchday: matchdayParam, team: teamParam, tab: tabParam } = await searchParams;
  const activeTab = tabParam === "results" ? "results" : "upcoming";

  // ── Results tab ──────────────────────────────────────────────────────────────
  if (activeTab === "results") {
    const raw = await prisma.match.findMany({
      where: { competition: "UCL", status: "finished" },
      include: {
        homeTeam: true,
        awayTeam: true,
        modelPredictions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { matchDate: "desc" },
    });

    const results: ResultMatch[] = raw
      .filter((m) => m.homeScore !== null && m.awayScore !== null)
      .map((m) => {
        const pred = m.modelPredictions[0] ?? null;
        return {
          id: m.id,
          matchDate: m.matchDate,
          stage: m.stage,
          homeTeam: {
            name: m.homeTeam.name,
            logoUrl: m.homeTeam.logoUrl,
            primaryColor: m.homeTeam.primaryColor,
            secondaryColor: m.homeTeam.secondaryColor,
          },
          awayTeam: {
            name: m.awayTeam.name,
            logoUrl: m.awayTeam.logoUrl,
            primaryColor: m.awayTeam.primaryColor,
            secondaryColor: m.awayTeam.secondaryColor,
          },
          homeScore: m.homeScore!,
          awayScore: m.awayScore!,
          prediction: pred
            ? {
                homeWinProb: pred.homeWinProb,
                drawProb: pred.drawProb,
                awayWinProb: pred.awayWinProb,
              }
            : null,
        };
      });

    return (
      <main className="max-w-3xl mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Predictions</h1>
          <p className="text-sm text-[#4a6899] mt-1">UEFA Champions League 2025/26</p>
        </div>

        <Suspense fallback={null}>
          <TabNav activeTab="results" />
        </Suspense>

        <AccuracySummary matches={results} />

        {results.length === 0 ? (
          <p className="text-[#4a6899]">No finished matches yet.</p>
        ) : (
          <ResultsList matches={results} />
        )}
      </main>
    );
  }

  // ── Upcoming tab ─────────────────────────────────────────────────────────────
  const raw = await prisma.match.findMany({
    where: { competition: "UCL", status: { in: ["scheduled", "live"] } },
    include: {
      homeTeam: true,
      awayTeam: true,
      modelPredictions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { matchDate: "asc" },
  });

  const windows = buildMatchdayWindows(raw.map((m) => m.matchDate));

  const now = Date.now();
  const defaultIdx = windows.findIndex((w) => w.end >= now);
  const safeDefault = defaultIdx === -1 ? windows.length - 1 : defaultIdx;
  const currentIdx =
    matchdayParam !== undefined
      ? Math.max(0, Math.min(parseInt(matchdayParam, 10), windows.length - 1))
      : safeDefault;

  const teamMap = new Map<string, { id: string; name: string }>();
  for (const m of raw) {
    teamMap.set(m.homeTeam.id, { id: m.homeTeam.id, name: m.homeTeam.name });
    teamMap.set(m.awayTeam.id, { id: m.awayTeam.id, name: m.awayTeam.name });
  }
  const allTeams = [...teamMap.values()].sort((a, b) => a.name.localeCompare(b.name));

  const window = windows[currentIdx];
  const filtered = raw.filter((m) => {
    if (teamParam) {
      return m.homeTeamId === teamParam || m.awayTeamId === teamParam;
    }
    const t = new Date(m.matchDate.toDateString()).getTime();
    return window ? t >= window.start && t <= window.end : true;
  });

  const matches = filtered.map((m) => {
    const pred = m.modelPredictions[0] ?? null;
    return {
      id: m.id,
      matchDate: m.matchDate,
      stage: m.stage,
      homeTeam: {
        name: m.homeTeam.name,
        country: m.homeTeam.country,
        logoUrl: m.homeTeam.logoUrl,
        primaryColor: m.homeTeam.primaryColor,
        secondaryColor: m.homeTeam.secondaryColor,
      },
      awayTeam: {
        name: m.awayTeam.name,
        country: m.awayTeam.country,
        logoUrl: m.awayTeam.logoUrl,
        primaryColor: m.awayTeam.primaryColor,
        secondaryColor: m.awayTeam.secondaryColor,
      },
      prediction: pred
        ? {
            homeWinProb: pred.homeWinProb,
            drawProb: pred.drawProb,
            awayWinProb: pred.awayWinProb,
            homeElo: pred.homeElo,
            awayElo: pred.awayElo,
            eloDiff: pred.eloDiff,
          }
        : null,
    };
  });

  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Predictions</h1>
        <p className="text-sm text-[#4a6899] mt-1">UEFA Champions League 2025/26</p>
      </div>

      <Suspense fallback={null}>
        <TabNav activeTab="upcoming" />
      </Suspense>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Suspense fallback={<div className="h-9 w-48 bg-[#060f2a] rounded-lg animate-pulse" />}>
          <TeamFilter teams={allTeams} selectedId={teamParam} />
        </Suspense>

        {!teamParam && windows.length > 0 && (
          <Suspense fallback={null}>
            <MatchdayNav
              currentIdx={currentIdx}
              total={windows.length}
              label={window ? windowLabel(window) : ""}
            />
          </Suspense>
        )}

        {teamParam && (
          <span className="text-xs text-[#4a6899]">
            {matches.length} match{matches.length !== 1 ? "es" : ""} remaining
          </span>
        )}
      </div>

      {matches.length === 0 ? (
        <p className="text-[#4a6899]">No upcoming matches found.</p>
      ) : (
        <MatchList matches={matches} />
      )}
    </main>
  );
}
