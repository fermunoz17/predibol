import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function StandingsPage() {
  const standings = await prisma.uclStanding.findMany({
    where: { seasonYear: "2027" },
    orderBy: { rank: "asc" },
    include: { team: true },
  });

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">UCL Standings</h1>
        <p className="text-sm text-[#4a6899] mt-1">2026/27 League Phase</p>
      </div>

      {standings.length === 0 ? (
        <p className="text-[#4a6899]">No standings data yet. Run <code className="text-xs bg-[#060f2a] border border-[#142655] px-1 py-0.5 rounded">npm run db:ingest-standings</code> to populate.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-[#4a6899] uppercase tracking-wider border-b border-[#142655]">
                <th className="text-left pb-3 pr-4 w-8">#</th>
                <th className="text-left pb-3">Team</th>
                <th className="text-center pb-3 px-3">P</th>
                <th className="text-center pb-3 px-3">W</th>
                <th className="text-center pb-3 px-3">D</th>
                <th className="text-center pb-3 px-3">L</th>
                <th className="text-center pb-3 px-3">GF</th>
                <th className="text-center pb-3 px-3">GA</th>
                <th className="text-center pb-3 px-3">GD</th>
                <th className="text-center pb-3 pl-3 font-bold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => {
                const isTop8 = s.rank <= 8;
                const isPlayoff = s.rank > 8 && s.rank <= 24;

                return (
                  <tr
                    key={s.id}
                    className={`border-b border-[#142655]/60 hover:bg-[#060f2a]/50 transition-colors ${
                      i === 7 ? "border-b-2 border-blue-800" :
                      i === 23 ? "border-b-2 border-yellow-800" : ""
                    }`}
                  >
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-semibold ${
                        isTop8 ? "text-blue-400" :
                        isPlayoff ? "text-yellow-400" :
                        "text-[#4a6899]"
                      }`}>
                        {s.rank}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {s.team.logoUrl ? (
                          <Image
                            src={s.team.logoUrl}
                            alt={s.team.name}
                            width={24}
                            height={24}
                            className="shrink-0"
                            unoptimized
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#060f2a] shrink-0" />
                        )}
                        <span className="font-medium">{s.team.name}</span>
                        {s.team.country && (
                          <span className="text-xs text-[#2a4a88] hidden sm:inline">{s.team.country}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-center text-[#6a90cc] px-3">{s.played}</td>
                    <td className="py-3 text-center text-green-400 px-3">{s.won}</td>
                    <td className="py-3 text-center text-[#6a90cc] px-3">{s.drawn}</td>
                    <td className="py-3 text-center text-red-400 px-3">{s.lost}</td>
                    <td className="py-3 text-center text-[#6a90cc] px-3">{s.goalsFor}</td>
                    <td className="py-3 text-center text-[#6a90cc] px-3">{s.goalsAgainst}</td>
                    <td className="py-3 text-center px-3">
                      <span className={s.goalDifference > 0 ? "text-green-400" : s.goalDifference < 0 ? "text-red-400" : "text-[#6a90cc]"}>
                        {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                      </span>
                    </td>
                    <td className="py-3 text-center pl-3 font-bold">{s.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Legend */}
          <div className="flex gap-6 mt-6 text-xs text-[#4a6899]">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-0.5 bg-blue-800" />
              <span className="text-blue-400">Top 8</span> — Round of 16 (direct)
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-0.5 bg-yellow-800" />
              <span className="text-yellow-400">9–24</span> — Knockout playoffs
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#4a6899]">25–36</span> — Eliminated
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
