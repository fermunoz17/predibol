import Link from "next/link";

const COMING_SOON = [
  {
    title: "User Predictions",
    description: "Make your own picks and compare them against the model.",
  },
  {
    title: "Live Match Updates",
    description: "Real-time score and probability updates as matches are played.",
  },
  {
    title: "Team Performance History",
    description: "Deep dive into historical form, head-to-head records, and trends.",
  },
  {
    title: "Model Transparency",
    description: "Explore what drives each prediction — feature importance and model confidence.",
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-6xl font-bold tracking-tight mb-4">Predibol</h1>
        <p className="text-xl text-gray-400 max-w-xl mx-auto mb-10">
          Machine learning predictions for UEFA Champions League matches — powered by Elo ratings
          and historical data from Europe&apos;s top leagues.
        </p>
        <Link
          href="/predictions"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-base font-medium transition-colors"
        >
          View Upcoming Matches
        </Link>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-800 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-10 text-center">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">7,000+</div>
              <div className="font-semibold mb-1">Training Matches</div>
              <div className="text-sm text-gray-500">
                4 seasons of data across the Premier League, La Liga, Serie A, Bundesliga, and Ligue 1.
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">Elo</div>
              <div className="font-semibold mb-1">Rating System</div>
              <div className="text-sm text-gray-500">
                Each team gets a dynamic Elo score updated after every result, capturing current form.
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">52%</div>
              <div className="font-semibold mb-1">Model Accuracy</div>
              <div className="text-sm text-gray-500">
                Cross-validated on held-out matches. Baseline (random) is 33% for a 3-way outcome.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming soon */}
      <section id="coming-soon" className="border-t border-gray-800 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-2 text-center">Coming Soon</h2>
          <p className="text-gray-500 text-center mb-10 text-sm">Features in progress</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COMING_SOON.map((feature) => (
              <div key={feature.title} className="border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                    Upcoming
                  </span>
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
