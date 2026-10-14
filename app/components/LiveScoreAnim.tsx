// "Live Match Updates" feature card animation (pure SVG + CSS, styles in globals.css →
// "Feature: Live Match Updates"). Plays only while the card is hovered. 8s loop:
// 88' at 1–1 → clock ticks to 89' → home side scores: GOAL!, score flips to 2–1,
// win probabilities swing. At rest it shows the final 89', 2–1 state.
// Teams are invented crests, not real clubs.

const SHIELD = "M11 1 L20 4 V11 C20 16 16 19.5 11 21 C6 19.5 2 16 2 11 V4 Z";
const BAND = "M2 9 L11 13 L20 9 V12.5 L11 16.5 L2 12.5 Z";
const DISPLAY = "var(--font-kanit), 'Arial Black', sans-serif";

const HOME = { fill: "#E63946", band: "#FFFFFF", code: "RAV" };
const AWAY = { fill: "#4FA3F7", band: "#0B1E5B", code: "SOL" };

function Crest({ team, x, y, size }: { team: typeof HOME; x: number; y: number; size: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 22})`}>
      <path d={SHIELD} fill={team.fill} />
      <path d={BAND} fill={team.band} />
      <path d={SHIELD} fill="none" stroke="#060f2a" strokeOpacity="0.5" strokeWidth="0.8" />
    </g>
  );
}

function Pct({ x, anchor, label, before, after }: { x: number; anchor: "start" | "middle" | "end"; label: string; before: number; after: number }) {
  const common = { x, y: 162, fontSize: 7, fontWeight: 700, letterSpacing: 0.8, textAnchor: anchor } as const;
  return (
    <>
      <text {...common} className="ls-pct-old" fill="#9fb0da">{label} {before}%</text>
      <text {...common} className="ls-pct-new" fill="#9fb0da">{label} {after}%</text>
    </>
  );
}

export function LiveScoreAnim() {
  return (
    <svg
      className="ls"
      viewBox="0 0 300 170"
      role="img"
      aria-label="Animation: a live match at 89 minutes, tied 1–1, updates to 2–1 when the home team scores, and the win probabilities shift"
    >
      <defs>
        <clipPath id="ls-digit"><rect x="110" y="62" width="36" height="42" /></clipPath>
        <radialGradient id="ls-flash-grad">
          <stop offset="0" stopColor="#7BE33B" stopOpacity="0.7" />
          <stop offset="1" stopColor="#7BE33B" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="170" rx="10" fill="#081537" />

      <g className="ls-scene">
        {/* header */}
        <rect x="12" y="10" width="40" height="15" rx="7.5" fill="#C8102E" />
        <circle className="ls-dot" cx="21" cy="17.5" r="2.6" fill="#FFFFFF" />
        <text x="27" y="20.5" fontSize="8" fontWeight="800" letterSpacing="0.8" fill="#FFFFFF">LIVE</text>
        <text x="288" y="20.5" fontSize="7" fontWeight="700" letterSpacing="1.2" fill="#4a6899" textAnchor="end">QUARTER-FINAL</text>

        {/* clock */}
        <g fontFamily={DISPLAY} fontSize="14" fontWeight="900" fill="#7BE33B" textAnchor="middle">
          <text className="ls-min88" x="150" y="46">88&apos;</text>
          <text className="ls-min89" x="150" y="46">89&apos;</text>
        </g>

        {/* goal flash behind the score */}
        <circle className="ls-flash" cx="150" cy="84" r="46" fill="url(#ls-flash-grad)" />

        {/* crests */}
        <g className="ls-shake"><Crest team={HOME} x={36} y={54} size={48} /></g>
        <path className="ls-ring" d={SHIELD} transform="translate(30 48) scale(2.727)" fill="none" stroke="#7BE33B" strokeWidth="0.9" />
        <Crest team={AWAY} x={216} y={54} size={48} />
        <text x="60" y="118" fontSize="8" fontWeight="700" letterSpacing="1.5" fill="#9fb0da" textAnchor="middle">{HOME.code}</text>
        <text x="240" y="118" fontSize="8" fontWeight="700" letterSpacing="1.5" fill="#9fb0da" textAnchor="middle">{AWAY.code}</text>

        {/* score */}
        <g fontFamily={DISPLAY} fontStyle="italic" fontSize="36" fontWeight="900" fill="#FFFFFF" textAnchor="middle">
          <g clipPath="url(#ls-digit)">
            <text className="ls-h-old" x="128" y="98">1</text>
            <text className="ls-h-new" x="128" y="98">2</text>
          </g>
          <text x="150" y="96" fontSize="26" fill="#4a6899">-</text>
          <text x="172" y="98">1</text>
        </g>

        <text className="ls-goal" x="150" y="126" fontFamily={DISPLAY} fontStyle="italic" fontSize="15" fontWeight="900" letterSpacing="1" fill="#7BE33B" textAnchor="middle">GOAL!</text>

        {/* win probability: home | draw | away */}
        <rect x="40" y="141" width="220" height="6" rx="3" fill="#2a4a8a" />
        <rect className="ls-bar-h" x="40" y="141" width="220" height="6" rx="3" fill={HOME.fill} />
        <rect className="ls-bar-a" x="40" y="141" width="220" height="6" rx="3" fill={AWAY.fill} />
        <Pct x={40} anchor="start" label={HOME.code} before={34} after={81} />
        <Pct x={150} anchor="middle" label="DRAW" before={38} after={15} />
        <Pct x={260} anchor="end" label={AWAY.code} before={28} after={4} />
      </g>
    </svg>
  );
}
