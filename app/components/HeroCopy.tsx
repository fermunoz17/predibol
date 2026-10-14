"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";

const TAGLINE =
  "Machine learning predictions for UEFA Champions League matches, powered by Elo ratings and historical data from Europe's top leagues.";

// Tagline and CTAs animate in right after the logo reveal (timed in globals.css,
// "Hero copy" section). Replay in HeroLogoReveal fires "predibol:replay" to restart them.
export function HeroCopy() {
  const [run, setRun] = useState(0);

  useEffect(() => {
    const again = () => setRun((r) => r + 1);
    document.addEventListener("predibol:replay", again);
    return () => document.removeEventListener("predibol:replay", again);
  }, []);

  return (
    <div key={run} className="pb-16 px-6 text-center mt-2">
      <p
        className="hero-tagline text-lg sm:text-xl text-[#9fb0da] max-w-xl mx-auto mb-9 leading-snug"
        aria-label={TAGLINE}
      >
        {TAGLINE.split(" ").map((word, i) => (
          <span key={i}>
            <span className="hero-word" aria-hidden="true" style={{ "--i": i } as CSSProperties}>
              {word}
            </span>{" "}
          </span>
        ))}
      </p>
      <div className="hero-ctas flex items-center justify-center gap-4 flex-wrap">
        <Link
          href="/predictions"
          className="hero-cta cta-primary inline-block bg-[#2457E6] hover:bg-[#3a6cf0] text-white px-8 py-3 rounded-lg transition-colors shadow-[0_0_24px_rgba(36,87,230,0.35)]"
        >
          View Predictions
        </Link>
        <Link
          href="/signup"
          className="hero-cta inline-block border border-[#2a4a8a] hover:border-[#3a6aaa] text-[#9fb0da] hover:text-white px-8 py-3 rounded-lg transition-colors"
        >
          Sign up free
        </Link>
      </div>
    </div>
  );
}
