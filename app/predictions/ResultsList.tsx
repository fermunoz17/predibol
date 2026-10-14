"use client";

import Link from "next/link";
import Image from "next/image";

interface Team {
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

interface Prediction {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
}

export interface ResultMatch {
  id: string;
  matchDate: Date;
  stage: string | null;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  prediction: Prediction | null;
}

function actualOutcome(homeScore: number, awayScore: number): "home" | "draw" | "away" {
  if (homeScore > awayScore) return "home";
  if (homeScore < awayScore) return "away";
  return "draw";
}

function predictedOutcome(pred: Prediction): "home" | "draw" | "away" {
  const max = Math.max(pred.homeWinProb, pred.drawProb, pred.awayWinProb);
  if (max === pred.homeWinProb) return "home";
  if (max === pred.drawProb) return "draw";
  return "away";
}

export function AccuracySummary({ matches }: { matches: ResultMatch[] }) {
  const withPred = matches.filter((m) => m.prediction !== null);
  if (withPred.length === 0) return null;

  const correct = withPred.filter(
    (m) => predictedOutcome(m.prediction!) === actualOutcome(m.homeScore, m.awayScore)
  ).length;

  const pct = Math.round((correct / withPred.length) * 100);

  return (
    <div className="border border-gray-800 rounded-xl p-4 mb-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">Model accuracy</p>
        <p className="text-2xl font-bold mt-0.5">
          {pct}%
          <span className="text-sm font-normal text-gray-500 ml-2">
            {correct} / {withPred.length} correct
          </span>
        </p>
      </div>
      <div className="w-24 h-2 rounded overflow-hidden bg-gray-800">
        <div
          className="h-full rounded"
          style={{
            width: `${pct}%`,
            background: pct >= 60 ? "#22c55e" : pct >= 40 ? "#eab308" : "#ef4444",
          }}
        />
      </div>
    </div>
  );
}

export function ResultsList({ matches }: { matches: ResultMatch[] }) {
  return (
    <ul className="space-y-3">
      {matches.map((match) => {
        const pred = match.prediction;
        const actual = actualOutcome(match.homeScore, match.awayScore);
        const predicted = pred ? predictedOutcome(pred) : null;
        const correct = predicted !== null ? predicted === actual : null;
        const awayColor = match.awayTeam.secondaryColor ?? match.awayTeam.primaryColor;

        const winnerName =
          actual === "home"
            ? match.homeTeam.name
            : actual === "away"
            ? match.awayTeam.name
            : null;

        const winnerColor =
          actual === "home"
            ? match.homeTeam.primaryColor
            : actual === "away"
            ? awayColor
            : "#9ca3af";

        return (
          <li key={match.id}>
            <Link
              href={`/predictions/${match.id}`}
              className="block border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-colors"
            >
              {/* Teams + score */}
              <div className="flex items-center gap-3">
                {/* Home team */}
                <div className="flex items-center gap-2 flex-1 flex-row-reverse">
                  {match.homeTeam.logoUrl ? (
                    <Image src={match.homeTeam.logoUrl} alt={match.homeTeam.name} width={28} height={28} unoptimized className="shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-800 shrink-0" />
                  )}
                  <span className="font-semibold text-sm leading-tight text-right">
                    {match.homeTeam.name}
                  </span>
                </div>

                {/* Score */}
                <div className="shrink-0 text-center w-14">
                  <span className="font-bold text-lg tabular-nums">
                    {match.homeScore} – {match.awayScore}
                  </span>
                </div>

                {/* Away team */}
                <div className="flex items-center gap-2 flex-1">
                  {match.awayTeam.logoUrl ? (
                    <Image src={match.awayTeam.logoUrl} alt={match.awayTeam.name} width={28} height={28} unoptimized className="shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-800 shrink-0" />
                  )}
                  <span className="font-semibold text-sm leading-tight">
                    {match.awayTeam.name}
                  </span>
                </div>
              </div>

              {/* Date + stage */}
              <div className="text-xs text-gray-500 mt-2 text-center">
                {new Date(match.matchDate).toLocaleDateString("en-US", {
                  weekday: "short", month: "short", day: "numeric", year: "numeric",
                })}
                {match.stage ? ` · ${match.stage}` : ""}
              </div>

              {/* Prediction result */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  Winner:{" "}
                  <span className="font-medium" style={{ color: winnerColor ?? "#9ca3af" }}>
                    {winnerName ?? "Draw"}
                  </span>
                </span>

                {correct !== null ? (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      correct
                        ? "bg-green-900/40 text-green-400"
                        : "bg-red-900/40 text-red-400"
                    }`}
                  >
                    {correct ? "✓ Correct" : "✗ Incorrect"}
                  </span>
                ) : (
                  <span className="text-gray-600 text-xs">No prediction</span>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
