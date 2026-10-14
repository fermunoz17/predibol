"use client";

/**
 * Hero video background.
 *
 * Primary: YouTube embed (ljenEXPED8Q) with autoplay/mute/loop.
 * Fallback: if YouTube blocks embedding (common for official UEFA content),
 *   place the downloaded video at /public/ball.mp4 and it will show instead.
 *
 * YouTube sizing trick: a 16:9 iframe must be at least
 *   width = 177.78vh  OR  height = 56.25vw
 * to cover any viewport without letterboxing.
 */
export function HeroVideoBg() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">

      {/* ── YouTube embed ── */}
      <iframe
        src="https://www.youtube.com/embed/ljenEXPED8Q?autoplay=1&mute=1&loop=1&playlist=ljenEXPED8Q&controls=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&disablekb=1&fs=0"
        allow="autoplay; encrypted-media"
        title="UEFA Champions League"
        className="absolute top-1/2 left-1/2 pointer-events-none border-0"
        style={{
          width:     "max(100%, 177.78vh)",
          height:    "max(100%, 56.25vw)",
          /* nudge right to re-center the ball — adjust the px value to taste */
          transform: "translateX(-50%) translateY(-50%)",
        }}
      />

      {/* ── Base dark overlay ── */}
      <div className="absolute inset-0 bg-[#04091e]/50" />

      {/* ── Edge vignette — all four sides + corners in one pass ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(to bottom,  #04091e 0%, transparent 28%),
            linear-gradient(to top,     #04091e 0%, transparent 38%),
            linear-gradient(to right,   #04091e 0%, transparent 28%),
            linear-gradient(to left,    #04091e 0%, transparent 28%)
          `,
        }}
      />

    </div>
  );
}
