import Link from "next/link";

const ACCOUNT_FEATURES = [
  {
    title: "Your Predictions",
    description: "Make your own picks and track how they stack up against the model.",
  },
  {
    title: "Bracket Simulator",
    description: "Predict the full knockout bracket — the model runs every possible path to the final and shows you the most likely champion.",
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
  {
    title: "Leagues & Leaderboards",
    description: "Create a private league with friends or compete on the global leaderboard — bracket picks, match-by-match predictions, exact scores, and more.",
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">

      {/* Hero — full viewport, video as background, text anchored to bottom */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">

        {/* Video background */}

        {/* Title — centered */}
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center z-10" style={{ pointerEvents: "none" }}>
          <h1 className="text-6xl sm:text-7xl font-bold tracking-[0.05em] uppercase">
            {"Predibol".split("").map((char, i) => (
              <span
                key={i}
                className="pixel-char"
                style={{
                  animationDelay: `${1 + i * 0.07}s`,
                  background: "linear-gradient(180deg, #ffffff 10%, #c8deff 60%, #45bfff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {char}
              </span>
            ))}
          </h1>
        </div>

        {/* Subtitle + CTA — original bottom position */}
        <div className="relative mt-auto pb-16 px-6 text-center z-10">
          <div className="max-w-2xl mx-auto">

            <p className="text-base sm:text-lg text-[#6a90cc] max-w-lg mx-auto mb-8 leading-relaxed">
              Machine learning predictions for UEFA Champions League matches
              powered by Elo ratings and historical data from Europe&apos;s top leagues.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/predictions"
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg text-sm font-medium tracking-wide transition-colors shadow-[0_0_24px_rgba(59,130,246,0.3)]"
              >
                View Predictions
              </Link>
              <Link
                href="/signup"
                className="inline-block border border-[#142655] hover:border-[#1e4488] text-[#90b8e8] hover:text-white px-8 py-3 rounded-lg text-sm font-medium tracking-wide transition-colors"
              >
                Sign up free
              </Link>
            </div>

          </div>
        </div>

        {/* Scroll hint */}
        {/* <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 opacity-40">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-[#45bfff]" />
          <span className="text-[10px] text-[#45bfff] tracking-[0.3em] uppercase">Scroll</span>
        </div> */}

      </section>

      {/* How it works */}
      <section className="border-t border-[#142655] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs text-[#4a6899] text-center tracking-[0.25em] uppercase mb-10">How it works</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#c9a84c] mb-3 tracking-tight">7,000+</div>
              <div className="font-semibold text-white mb-2">Training Matches</div>
              <div className="text-sm text-[#4a6899] leading-relaxed">
                4 seasons of data across the Premier League, La Liga, Serie A, Bundesliga, and Ligue 1.
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#c9a84c] mb-3 tracking-tight">Elo</div>
              <div className="font-semibold text-white mb-2">Rating System</div>
              <div className="text-sm text-[#4a6899] leading-relaxed">
                Each team gets a dynamic Elo score updated after every result, capturing current form.
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#c9a84c] mb-3 tracking-tight">52%</div>
              <div className="font-semibold text-white mb-2">Model Accuracy</div>
              <div className="text-sm text-[#4a6899] leading-relaxed">
                Cross-validated on held-out matches. Baseline (random) is 33% for a 3-way outcome.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Create an account to */}
      <section id="features" className="border-t border-[#142655] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs text-[#4a6899] text-center tracking-[0.25em] uppercase mb-2">Coming Soon</p>
          <h2 className="text-2xl font-bold mb-3 text-center text-white">Create an account to</h2>
          <p className="text-[#4a6899] text-center mb-12 text-sm">
            Free — unlock these features as they launch
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACCOUNT_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="border border-[#142655] rounded-xl p-6 bg-[#060f2a]/40 hover:border-[#1e4488] hover:bg-[#060f2a]/70 transition-all"
              >
                <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-[#4a6899] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/signup"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg text-sm font-medium tracking-wide transition-colors shadow-[0_0_24px_rgba(59,130,246,0.3)]"
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
