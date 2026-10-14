// "Bracket Simulator" feature card animation (pure SVG + CSS). Plays only while the card is
// hovered (.feature-card:hover); at rest it shows the finished bracket. 9s loop:
// in each matchup a tap picks one team → green blink → the line lights up to the next round →
// the pick advances, the other team dims. Quarterfinals → semis → final → champion.
// Teams are invented crests, not real clubs. Keyframes are generated from STEPS below.

const SHIELD = "M11 1 L20 4 V11 C20 16 16 19.5 11 21 C6 19.5 2 16 2 11 V4 Z";
const BAND = "M2 9 L11 13 L20 9 V12.5 L11 16.5 L2 12.5 Z";
const LOOP = 9; // seconds

const TEAMS = [
  { fill: "#E63946", band: "#FFFFFF" },
  { fill: "#4FA3F7", band: "#0B1E5B" },
  { fill: "#F2C14E", band: "#141414" },
  { fill: "#7B4FD6", band: "#FFFFFF" },
  { fill: "#2BAE66", band: "#FFFFFF" },
  { fill: "#F28C28", band: "#0B1E5B" },
  { fill: "#E8ECF5", band: "#C8102E" },
  { fill: "#8B1E3F", band: "#F2C14E" },
];

type Slot = { x: number; y: number; s: number; team: number; path?: string };

// Slot positions (top-left corner, size). path = connector from this slot to the next round.
const SLOTS: Record<string, Slot> = {
  qf0: { x: 12, y: 18, s: 18, team: 0, path: "M30 27 H44 V40 H62" },
  qf1: { x: 12, y: 44, s: 18, team: 1, path: "M30 53 H44 V40 H62" },
  qf2: { x: 12, y: 106, s: 18, team: 2, path: "M30 115 H44 V128 H62" },
  qf3: { x: 12, y: 132, s: 18, team: 3, path: "M30 141 H44 V128 H62" },
  qf4: { x: 270, y: 18, s: 18, team: 4, path: "M270 27 H256 V40 H238" },
  qf5: { x: 270, y: 44, s: 18, team: 5, path: "M270 53 H256 V40 H238" },
  qf6: { x: 270, y: 106, s: 18, team: 6, path: "M270 115 H256 V128 H238" },
  qf7: { x: 270, y: 132, s: 18, team: 7, path: "M270 141 H256 V128 H238" },
  sfL0: { x: 62, y: 31, s: 18, team: 0, path: "M80 40 H94 V84 H112" },
  sfL1: { x: 62, y: 119, s: 18, team: 3, path: "M80 128 H94 V84 H112" },
  sfR0: { x: 220, y: 31, s: 18, team: 5, path: "M220 40 H206 V84 H188" },
  sfR1: { x: 220, y: 119, s: 18, team: 6, path: "M220 128 H206 V84 H188" },
  fL: { x: 112, y: 75, s: 18, team: 3, path: "M130 84 H150 V54" },
  fR: { x: 170, y: 75, s: 18, team: 5, path: "M170 84 H150 V54" },
  ch: { x: 139, y: 30, s: 22, team: 3 },
};

// Each pick: the winner's slot, the loser's slot, the slot the winner advances to, and when (s).
const STEPS = [
  { win: "qf0", lose: "qf1", next: "sfL0", t: 0.7 },
  { win: "qf3", lose: "qf2", next: "sfL1", t: 1.5 },
  { win: "qf5", lose: "qf4", next: "sfR0", t: 2.3 },
  { win: "qf6", lose: "qf7", next: "sfR1", t: 3.1 },
  { win: "sfL1", lose: "sfL0", next: "fL", t: 4.2 },
  { win: "sfR0", lose: "sfR1", next: "fR", t: 5.0 },
  { win: "fL", lose: "fR", next: "ch", t: 6.1 },
];
const STAR_T = 7.0;

const pc = (sec: number) => `${Math.max(0, Math.min(100, (sec / LOOP) * 100)).toFixed(2)}%`;

function buildCss() {
  const rules: string[] = [];
  const play = (cls: string, kf: string) =>
    rules.push(`.feature-card:hover .${cls} { animation: ${kf} ${LOOP}s linear infinite; }`);

  rules.push(`@keyframes ba-scene { 0% { opacity: 0; } ${pc(0.35)}, ${pc(8.5)} { opacity: 1; } 100% { opacity: 0; } }`);
  play("ba-scene", "ba-scene");

  STEPS.forEach((st, k) => {
    const t = st.t;
    rules.push(`@keyframes ba-tap-${k} { 0%, ${pc(t - 0.2)} { opacity: 0; transform: scale(1.6); } ${pc(t - 0.05)} { opacity: .9; transform: scale(1); } ${pc(t + 0.1)} { opacity: .9; transform: scale(.7); } ${pc(t + 0.35)}, 100% { opacity: 0; transform: scale(2); } }`);
    rules.push(`@keyframes ba-ring-${k} { 0%, ${pc(t + 0.05)} { opacity: 0; } ${pc(t + 0.12)} { opacity: 1; } ${pc(t + 0.22)} { opacity: .15; } ${pc(t + 0.32)} { opacity: 1; } ${pc(t + 0.42)} { opacity: .15; } ${pc(t + 0.52)} { opacity: 1; } ${pc(t + 0.75)}, 100% { opacity: 0; } }`);
    rules.push(`@keyframes ba-lit-${k} { 0%, ${pc(t + 0.3)} { stroke-dashoffset: 1; } ${pc(t + 0.6)}, 100% { stroke-dashoffset: 0; } }`);
    rules.push(`@keyframes ba-dim-${k} { 0%, ${pc(t + 0.4)} { opacity: 1; } ${pc(t + 0.6)}, 100% { opacity: .35; } }`);
    rules.push(`@keyframes ba-adv-${k} { 0%, ${pc(t + 0.5)} { opacity: 0; transform: scale(.3); } ${pc(t + 0.68)} { opacity: 1; transform: scale(1.18); } ${pc(t + 0.8)}, 100% { opacity: 1; transform: scale(1); } }`);
    ["tap", "ring", "lit", "dim", "adv"].forEach((n) => play(`ba-${n}-${k}`, `ba-${n}-${k}`));
  });

  rules.push(`@keyframes ba-star { 0%, ${pc(STAR_T)} { opacity: 0; transform: scale(0) rotate(-90deg); } ${pc(STAR_T + 0.25)} { opacity: 1; transform: scale(1.35) rotate(10deg); } ${pc(STAR_T + 0.4)}, 100% { opacity: 1; transform: scale(1) rotate(0); } }`);
  play("ba-star", "ba-star");

  return `
.ba { display: block; width: 100%; height: auto; border-radius: 10px; font-family: inherit; }
.ba [class*="ba-tap"], .ba [class*="ba-adv"], .ba .ba-star { transform-box: fill-box; transform-origin: center; }
.ba [class*="ba-tap"], .ba [class*="ba-ring"] { opacity: 0; }
.ba [class*="ba-dim"] { opacity: .35; }
${rules.join("\n")}
@media (prefers-reduced-motion: reduce) { .ba * { animation: none !important; } }
`;
}

const CSS = buildCss();

function Shield({ slot, team }: { slot: Slot; team: number }) {
  const c = TEAMS[team];
  return (
    <g transform={`translate(${slot.x} ${slot.y}) scale(${slot.s / 22})`}>
      <path d={SHIELD} fill={c.fill} />
      <path d={BAND} fill={c.band} />
      <path d={SHIELD} fill="none" stroke="#060f2a" strokeOpacity="0.5" strokeWidth="1" />
    </g>
  );
}

export function BracketAnim() {
  const stepByWin = new Map(STEPS.map((s, k) => [s.win, k]));
  const stepByLose = new Map(STEPS.map((s, k) => [s.lose, k]));
  const stepByNext = new Map(STEPS.map((s, k) => [s.next, k]));

  return (
    <svg
      className="ba"
      viewBox="0 0 300 170"
      role="img"
      aria-label="Animation: picking a winner in each matchup of a knockout bracket, from the quarterfinals to a champion"
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <rect width="300" height="170" rx="10" fill="#081537" />
      <g className="ba-scene">
        {/* base connectors */}
        {Object.values(SLOTS).map((sl, i) =>
          sl.path ? <path key={i} d={sl.path} fill="none" stroke="#1c3470" strokeWidth="1.5" /> : null
        )}
        {/* winning lines, drawn in as picks are made */}
        {STEPS.map((st, k) => (
          <path key={k} className={`ba-lit-${k}`} d={SLOTS[st.win].path} pathLength={1}
            strokeDasharray="1" fill="none" stroke="#7BE33B" strokeWidth="2" strokeLinecap="round" />
        ))}

        <text x="150" y="104" fontSize="7" fontWeight="700" letterSpacing="1.5" fill="#4a6899" textAnchor="middle">FINAL</text>

        {Object.entries(SLOTS).map(([id, sl]) => {
          const adv = stepByNext.get(id);
          const lose = stepByLose.get(id);
          const pad = sl.s * 0.125;
          return (
            <g key={id}>
              {adv !== undefined && (
                <path d={SHIELD} transform={`translate(${sl.x} ${sl.y}) scale(${sl.s / 22})`}
                  fill="none" stroke="#2a4a8a" strokeWidth="1.2" strokeDasharray="2 2" />
              )}
              <g className={adv !== undefined ? `ba-adv-${adv}` : undefined}>
                <g className={lose !== undefined ? `ba-dim-${lose}` : undefined}>
                  <Shield slot={sl} team={sl.team} />
                </g>
              </g>
              {stepByWin.has(id) && (
                <path className={`ba-ring-${stepByWin.get(id)}`} d={SHIELD}
                  transform={`translate(${sl.x - pad} ${sl.y - pad}) scale(${(sl.s * 1.25) / 22})`}
                  fill="none" stroke="#7BE33B" strokeWidth="1.6" />
              )}
            </g>
          );
        })}

        {/* champion star */}
        <path className="ba-star" fill="#7BE33B"
          d="M150 13 L151.9 17.4 L156.7 17.9 L153.1 21.1 L154.1 25.8 L150 23.4 L145.9 25.8 L146.9 21.1 L143.3 17.9 L148.1 17.4 Z" />

        {/* taps */}
        {STEPS.map((st, k) => {
          const sl = SLOTS[st.win];
          return <circle key={k} className={`ba-tap-${k}`} cx={sl.x + sl.s / 2} cy={sl.y + sl.s * 0.55} r="3.5" fill="#FFFFFF" />;
        })}
      </g>
    </svg>
  );
}
