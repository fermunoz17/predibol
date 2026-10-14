import Link from "next/link";
import { HeroLogoReveal } from "./components/HeroLogoReveal";
import { HeroCopy } from "./components/HeroCopy";
import { PredictionsAnim } from "./components/PredictionsAnim";
import { BracketAnim } from "./components/BracketAnim";
import { LiveScoreAnim } from "./components/LiveScoreAnim";
import { TeamHistoryAnim } from "./components/TeamHistoryAnim";
import { ModelAnim } from "./components/ModelAnim";
import { LeagueAnim } from "./components/LeagueAnim";
import { HowItWorks } from "./components/HowItWorks";

// Card animations, keyed by feature title. Add the rest here as they are built.
const FEATURE_ANIMS: Record<string, React.ReactNode> = {
  "Your Predictions": <PredictionsAnim />,
  "Bracket Simulator": <BracketAnim />,
  "Live Match Updates": <LiveScoreAnim />,
  "Team Performance History": <TeamHistoryAnim />,
  "Model Transparency": <ModelAnim />,
  "Leagues & Leaderboards": <LeagueAnim />,
};

const ACCOUNT_FEATURES = [
  {
    title: "Your Predictions",
    description: "Make your own picks and track how they stack up against the model.",
  },
  {
    title: "Bracket Simulator",
    description: "Predict the full knockout bracket. The model runs every possible path to the final and shows you the most likely champion.",
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
    description: "Explore what drives each prediction, from feature importance to model confidence.",
  },
  {
    title: "Leagues & Leaderboards",
    description: "Create a private league with friends or compete on the global leaderboard with bracket picks, match-by-match predictions, exact scores, and more.",
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">

      {/* Hero: logo reveal + CTA */}
      <section className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-[#0b1e5b] from-75% to-[#04091e] overflow-hidden px-4">

        <HeroLogoReveal />

        <HeroCopy />

      </section>

      {/* How it works */}
      <HowItWorks />

      {/* Create an account to */}
      <section id="features" className="border-t border-[#142655] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs text-[#6a80b3] text-center tracking-[0.25em] uppercase mb-2">Coming Soon</p>
          <h2 className="text-2xl font-bold mb-3 text-center text-white">Create an account to</h2>
          <p className="text-[#9fb0da] text-center mb-12 text-sm">
            Unlock these features as they launch
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACCOUNT_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="feature-card border border-[#142655] rounded-xl p-6 bg-[#060f2a]/40 hover:border-[#1e4488] hover:bg-[#060f2a]/70 transition-all"
              >
                {FEATURE_ANIMS[feature.title] && (
                  <div className="mb-5">{FEATURE_ANIMS[feature.title]}</div>
                )}
                <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-[#9fb0da] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/signup"
              className="inline-block bg-[#2457E6] hover:bg-[#3a6cf0] text-white px-8 py-3 rounded-lg text-sm font-medium tracking-wide transition-colors shadow-[0_0_24px_rgba(36,87,230,0.3)]"
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
