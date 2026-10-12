import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/app/actions/auth";

export default async function PredictionsPage() {
  const matches = await prisma.match.findMany({
    where: {
      competition: "UCL",
      status: "scheduled",
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      modelPredictions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { matchDate: "asc" },
    take: 20,
  });

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">UCL Predictions</h1>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-gray-800 underline"
          >
            Log out
          </button>
        </form>
      </div>
      {matches.length === 0 ? (
        <p className="text-gray-500">No upcoming matches with predictions yet.</p>
      ) : (
        <ul className="space-y-4">
          {matches.map((match) => {
            const pred = match.modelPredictions[0];
            return (
              <li key={match.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{match.homeTeam.name}</span>
                  <span className="text-gray-400">vs</span>
                  <span className="font-semibold">{match.awayTeam.name}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(match.matchDate).toLocaleDateString()} · {match.stage}
                </div>
                {pred && (
                  <div className="mt-2 flex gap-4 text-sm">
                    <span className="text-green-600">Home: {(pred.homeWinProb * 100).toFixed(1)}%</span>
                    <span className="text-yellow-600">Draw: {(pred.drawProb * 100).toFixed(1)}%</span>
                    <span className="text-red-600">Away: {(pred.awayWinProb * 100).toFixed(1)}%</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
