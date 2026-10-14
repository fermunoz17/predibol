import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ProbabilityChart,
  EloChart,
  FormChart,
  AttackDefenceChart,
  ScoringEdgeChart,
  UclStandingsChart,
} from "./MatchCharts";


export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      homeTeam: true,
      awayTeam: true,
      modelPredictions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { modelRun: true },
      },
    },
  });

  if (!match) notFound();

  const pred = match.modelPredictions[0] ?? null;
  const features = pred?.features as {
    home_form: { s: number; c: number }[];
    away_form: { s: number; c: number }[];
    home_form_avg_scored: number;
    home_form_avg_conceded: number;
    away_form_avg_scored: number;
    away_form_avg_conceded: number;
    home_scoring_edge: number;
    away_scoring_edge: number;
    ucl_home: { rank: number; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; gd: number; pts: number; coeff: number | null } | null;
    ucl_away: { rank: number; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; gd: number; pts: number; coeff: number | null } | null;
  } | null;

  const homeColor = match.homeTeam.primaryColor;
  const awayColor = match.awayTeam.secondaryColor ?? match.awayTeam.primaryColor;

  const hasElo = pred?.homeElo != null && pred?.awayElo != null;

  const outcomeLabel =
    pred == null ? null
    : pred.homeWinProb >= pred.drawProb && pred.homeWinProb >= pred.awayWinProb
      ? match.homeTeam.name
      : pred.awayWinProb >= pred.drawProb
        ? match.awayTeam.name
        : "Draw";

  return (
    <main className="max-w-2xl mx-auto p-8">
      <Link href="/predictions" className="text-sm text-gray-500 hover:text-gray-300 mb-6 inline-block">
        ← All predictions
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
          {match.competition} · {match.stage}
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-3 flex-1 justify-end">
            <h1 className="text-2xl font-bold text-right">{match.homeTeam.name}</h1>
            {match.homeTeam.logoUrl && (
              <Image src={match.homeTeam.logoUrl} alt={match.homeTeam.name} width={40} height={40} unoptimized className="shrink-0" />
            )}
          </div>
          <span className="text-gray-600 shrink-0 text-sm">vs</span>
          <div className="flex items-center gap-3 flex-1">
            {match.awayTeam.logoUrl && (
              <Image src={match.awayTeam.logoUrl} alt={match.awayTeam.name} width={40} height={40} unoptimized className="shrink-0" />
            )}
            <h1 className="text-2xl font-bold">{match.awayTeam.name}</h1>
          </div>
        </div>
        <div className="text-sm text-gray-500 text-center mt-1">
          {new Date(match.matchDate).toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric", year: "numeric",
          })}
        </div>
      </div>

      {pred == null ? (
        <p className="text-gray-500">No prediction available for this match yet.</p>
      ) : (
        <div className="space-y-6">

          {/* Predicted outcome callout */}
          <div className="text-center py-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Predicted outcome</div>
            <div className="text-4xl font-bold">{outcomeLabel}</div>
          </div>

          {/* Chart 1: Win probability */}
          <ProbabilityChart
            homeTeam={match.homeTeam.name}
            awayTeam={match.awayTeam.name}
            homeWinProb={pred.homeWinProb}
            drawProb={pred.drawProb}
            awayWinProb={pred.awayWinProb}
            homeColor={homeColor}
            awayColor={awayColor}
          />

          {/* Chart 2: Elo ratings */}
          {hasElo && (
            <EloChart
              homeTeam={match.homeTeam.name}
              awayTeam={match.awayTeam.name}
              homeElo={pred.homeElo!}
              awayElo={pred.awayElo!}
              homeColor={match.homeTeam.primaryColor}
              awayColor={match.awayTeam.primaryColor}
            />
          )}

          {/* Chart 3: Recent form */}
          <FormChart
            homeTeam={match.homeTeam.name}
            awayTeam={match.awayTeam.name}
            features={features}
            homeColor={homeColor}
            awayColor={awayColor}
          />

          {/* Chart 4: Scoring edge */}
          <ScoringEdgeChart
            homeTeam={match.homeTeam.name}
            awayTeam={match.awayTeam.name}
            features={features}
            homeColor={homeColor}
            awayColor={awayColor}
          />

          {/* Chart 5: UCL standings */}
          <UclStandingsChart
            homeTeam={match.homeTeam.name}
            awayTeam={match.awayTeam.name}
            features={features}
            homeColor={homeColor}
            awayColor={awayColor}
          />

          {/* Chart 6: Attack vs defence radar */}
          <AttackDefenceChart
            homeTeam={match.homeTeam.name}
            awayTeam={match.awayTeam.name}
            features={features}
            homeColor={homeColor}
            awayColor={awayColor}
          />


        </div>
      )}
    </main>
  );
}
