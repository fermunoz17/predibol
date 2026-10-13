"use client";

import Link from "next/link";
import Image from "next/image";

interface Team {
  name: string;
  country: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

interface Prediction {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  homeElo: number | null;
  awayElo: number | null;
  eloDiff: number | null;
}

interface Match {
  id: string;
  matchDate: Date;
  stage: string | null;
  homeTeam: Team;
  awayTeam: Team;
  prediction: Prediction | null;
}

function TeamLogo({ team, align }: { team: Team; align: "left" | "right" }) {
  return (
    <div className={`flex items-center gap-2 flex-1 ${align === "right" ? "flex-row-reverse" : ""}`}>
      {team.logoUrl ? (
        <Image src={team.logoUrl} alt={team.name} width={28} height={28} unoptimized className="shrink-0" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-gray-800 shrink-0" />
      )}
      <span className={`font-semibold text-sm leading-tight ${align === "right" ? "text-right" : ""}`}>
        {team.name}
      </span>
    </div>
  );
}

function ProbBar({ homeProb, drawProb, awayProb, homeColor, awayColor }: {
  homeProb: number; drawProb: number; awayProb: number;
  homeColor: string | null; awayColor: string | null;
}) {
  return (
    <div className="w-full flex rounded overflow-hidden h-2">
      <div style={{ width: `${homeProb * 100}%`, background: homeColor ?? "#3b82f6" }} />
      <div className="bg-gray-500" style={{ width: `${drawProb * 100}%` }} />
      <div style={{ width: `${awayProb * 100}%`, background: awayColor ?? "#ef4444" }} />
    </div>
  );
}

function outcomeLabel(pred: Prediction, homeTeam: string, awayTeam: string, homeColor: string | null, awayColor: string | null) {
  const max = Math.max(pred.homeWinProb, pred.drawProb, pred.awayWinProb);
  if (max === pred.homeWinProb) return { label: `${homeTeam} to win`, color: homeColor ?? "#3b82f6", isTeam: true };
  if (max === pred.drawProb) return { label: "Draw likely", color: "#9ca3af", isTeam: false };
  return { label: `${awayTeam} to win`, color: awayColor ?? "#ef4444", isTeam: true };
}

export function MatchList({ matches }: { matches: Match[] }) {
  return (
    <ul className="space-y-3">
      {matches.map((match) => {
        const pred = match.prediction;
        const awayColor = match.awayTeam.secondaryColor ?? match.awayTeam.primaryColor;
        const outcome = pred ? outcomeLabel(pred, match.homeTeam.name, match.awayTeam.name, match.homeTeam.primaryColor, awayColor) : null;

        return (
          <li key={match.id}>
            <Link
              href={`/predictions/${match.id}`}
              className="block border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <TeamLogo team={match.homeTeam} align="right" />
                <span className="text-xs text-gray-500 uppercase tracking-wider shrink-0 w-6 text-center">vs</span>
                <TeamLogo team={match.awayTeam} align="left" />
              </div>

              <div className="text-xs text-gray-500 mt-2 text-center">
                {new Date(match.matchDate).toLocaleDateString("en-US", {
                  weekday: "short", month: "short", day: "numeric", year: "numeric",
                })}
                {match.stage ? ` · ${match.stage}` : ""}
              </div>

              {pred && (
                <div className="mt-3">
                  <ProbBar
                    homeProb={pred.homeWinProb}
                    drawProb={pred.drawProb}
                    awayProb={pred.awayWinProb}
                    homeColor={match.homeTeam.primaryColor}
                    awayColor={awayColor}
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span style={{ color: match.homeTeam.primaryColor ?? "#3b82f6" }}>{(pred.homeWinProb * 100).toFixed(0)}%</span>
                    <span className="font-medium" style={{ color: outcome?.color }}>{outcome?.label}</span>
                    <span style={{ color: awayColor ?? "#ef4444" }}>{(pred.awayWinProb * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
