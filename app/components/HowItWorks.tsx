"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

// "How it works" stats. When the section scrolls into view: each column rises in, the numbers
// count up (7,000+ and 52%), "Elo" slams in letter by letter, and a lime underline draws.
// Server render and reduced motion show the final values; the zeroed "armed" state is only set
// on the client while the section is still off-screen, so nothing visibly resets.

type Stat = { value: number | string; prefix?: string; suffix?: string; title: string; body: string };

const STATS: Stat[] = [
  { value: 7000, suffix: "+", title: "Training Matches", body: "4 seasons of data across the Premier League, La Liga, Serie A, Bundesliga, and Ligue 1." },
  { value: "Elo", title: "Rating System", body: "Each team gets a dynamic Elo score updated after every result, capturing current form." },
  { value: 52, suffix: "%", title: "Model Accuracy", body: "Cross-validated on held-out matches. Baseline (random) is 33% for a 3-way outcome." },
];

const COUNT_MS = 1400;
const STAGGER_MS = 150;

function CountUp({ to, play, delay, suffix = "" }: { to: number; play: boolean; delay: number; suffix?: string }) {
  const [n, setN] = useState(to);
  useEffect(() => {
    if (!play) return;
    let raf = 0;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / COUNT_MS));
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setN(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, to, delay]);
  return <>{n.toLocaleString("en-US")}{suffix}</>;
}

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<"rest" | "armed" | "play">("rest");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const visible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
    if (visible) { setPhase("play"); return; }
    setPhase("armed");
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setPhase("play"); obs.disconnect(); }
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className={`hiw hiw-${phase} border-t border-[#142655] py-20`}>
      <div className="max-w-5xl mx-auto px-6">
        <p className="hiw-eyebrow text-xs text-[#6a80b3] text-center tracking-[0.25em] uppercase mb-10">How it works</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {STATS.map((s, i) => (
            <div key={s.title} className="hiw-item" style={{ "--i": i } as CSSProperties}>
              <div className="hiw-num text-5xl text-[#7BE33B] mb-2">
                {typeof s.value === "number" ? (
                  <CountUp to={s.value} suffix={s.suffix} play={phase === "play"} delay={i * STAGGER_MS + 250} />
                ) : (
                  s.value.split("").map((ch, j) => (
                    <span key={j} className="hiw-l" style={{ "--j": j } as CSSProperties}>{ch}</span>
                  ))
                )}
              </div>
              <div className="hiw-bar mx-auto mb-4" aria-hidden="true" />
              <div className="font-semibold text-white mb-2">{s.title}</div>
              <div className="text-sm text-[#9fb0da] leading-relaxed">{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
