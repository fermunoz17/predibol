// "Team Performance History" feature card animation (pure SVG + CSS). Plays only while the card
// is hovered (.feature-card:hover); at rest it shows the finished dashboard. 7s loop:
// form pills pop in → goals scored / conceded bars grow → totals slide in.
// Sample data for an invented team, not a real club. Keyframes are generated below.

const SHIELD = "M11 1 L20 4 V11 C20 16 16 19.5 11 21 C6 19.5 2 16 2 11 V4 Z";
const BAND = "M2 9 L11 13 L20 9 V12.5 L11 16.5 L2 12.5 Z";
const DISPLAY = "var(--font-kanit), 'Arial Black', sans-serif";
const LOOP = 7;

const SCORED_C = "#7BE33B";
const CONCEDED_C = "#F28C28";

// Last 6 matches, oldest → newest: [scored, conceded]
const MATCHES: [number, number][] = [[3, 1], [2, 0], [1, 1], [0, 2], [2, 1], [3, 0]];
const result = ([f, a]: [number, number]) => (f > a ? "W" : f < a ? "L" : "D");
const PILL = {
  W: { bg: "#7BE33B", fg: "#0b1e5b" },
  D: { bg: "#2a4a8a", fg: "#9fb0da" },
  L: { bg: "#C8102E", fg: "#FFFFFF" },
};
const TOTAL_F = MATCHES.reduce((s, m) => s + m[0], 0);
const TOTAL_A = MATCHES.reduce((s, m) => s + m[1], 0);

const BASE = 150; // bar baseline y
const UNIT = 26; // px per goal

const pc = (sec: number) => `${Math.max(0, Math.min(100, (sec / LOOP) * 100)).toFixed(2)}%`;

function buildCss() {
  const r: string[] = [];
  const play = (cls: string) => r.push(`.feature-card:hover .${cls} { animation: ${cls} ${LOOP}s linear infinite; }`);
  r.push(`@keyframes th-scene { 0% { opacity: 0; } ${pc(0.3)}, ${pc(6.5)} { opacity: 1; } 100% { opacity: 0; } }`);
  play("th-scene");
  MATCHES.forEach((_, i) => {
    const t = 0.35 + i * 0.15;
    r.push(`@keyframes th-pill-${i} { 0%, ${pc(t)} { opacity: 0; transform: scale(0); } ${pc(t + 0.18)} { opacity: 1; transform: scale(1.25); } ${pc(t + 0.3)}, 100% { opacity: 1; transform: scale(1); } }`);
    play(`th-pill-${i}`);
    const b = 1.45 + i * 0.13;
    r.push(`@keyframes th-bar-${i} { 0%, ${pc(b)} { transform: scaleY(0); } ${pc(b + 0.4)} { transform: scaleY(1.08); } ${pc(b + 0.55)}, 100% { transform: scaleY(1); } }`);
    play(`th-bar-${i}`);
  });
  [0, 1].forEach((k) => {
    const t = 2.5 + k * 0.25;
    r.push(`@keyframes th-tile-${k} { 0%, ${pc(t)} { opacity: 0; transform: translateX(24px); } ${pc(t + 0.4)}, 100% { opacity: 1; transform: translateX(0); } }`);
    r.push(`@keyframes th-val-${k} { 0%, ${pc(t + 0.3)} { opacity: 0; transform: scale(.4); } ${pc(t + 0.5)} { opacity: 1; transform: scale(1.25); } ${pc(t + 0.65)}, 100% { opacity: 1; transform: scale(1); } }`);
    play(`th-tile-${k}`);
    play(`th-val-${k}`);
  });
  return `
.th { display: block; width: 100%; height: auto; border-radius: 10px; font-family: inherit; }
.th [class*="th-pill"], .th [class*="th-val"] { transform-box: fill-box; transform-origin: center; }
.th [class*="th-bar"] { transform-box: fill-box; transform-origin: center bottom; }
${r.join("\n")}
@media (prefers-reduced-motion: reduce) { .th * { animation: none !important; } }
`;
}
const CSS = buildCss();

export function TeamHistoryAnim() {
  return (
    <svg
      className="th"
      viewBox="0 0 300 170"
      role="img"
      aria-label={`Animation: a team dashboard with recent form ${MATCHES.map(result).join(" ")}, and goals scored (${TOTAL_F}) versus conceded (${TOTAL_A}) over the last 6 matches`}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <rect width="300" height="170" rx="10" fill="#081537" />
      <g className="th-scene">
        {/* header: team + form */}
        <g transform="translate(12 11) scale(0.91)">
          <path d={SHIELD} fill="#E63946" />
          <path d={BAND} fill="#FFFFFF" />
        </g>
        <text x="38" y="26" fontSize="11" fontWeight="800" letterSpacing="1.2" fill="#FFFFFF">RAV</text>
        <text x="64" y="26" fontSize="7" fontWeight="700" letterSpacing="1.2" fill="#4a6899">LAST 6</text>
        {MATCHES.map((m, i) => {
          const res = result(m);
          const x = 160 + i * 22;
          return (
            <g key={i} className={`th-pill-${i}`}>
              <rect x={x} y="12" width="18" height="16" rx="4" fill={PILL[res].bg} />
              <text x={x + 9} y="23.5" fontSize="9" fontWeight="800" fill={PILL[res].fg} textAnchor="middle">{res}</text>
            </g>
          );
        })}
        <line x1="12" y1="38" x2="288" y2="38" stroke="#142655" />

        {/* goals chart */}
        <text x="14" y="54" fontSize="7" fontWeight="700" letterSpacing="1.2" fill="#9fb0da">GOALS</text>
        <rect x="56" y="48" width="6" height="6" rx="1.5" fill={SCORED_C} />
        <text x="65" y="54" fontSize="7" fill="#9fb0da">Scored</text>
        <rect x="96" y="48" width="6" height="6" rx="1.5" fill={CONCEDED_C} />
        <text x="105" y="54" fontSize="7" fill="#9fb0da">Conceded</text>
        {[1, 2, 3].map((g) => (
          <line key={g} x1="14" x2="200" y1={BASE - g * UNIT} y2={BASE - g * UNIT} stroke="#142655" strokeDasharray="2 3" />
        ))}
        {MATCHES.map(([f, a], i) => {
          const x0 = 18 + i * 31;
          return (
            <g key={i} className={`th-bar-${i}`}>
              {f > 0 && <rect x={x0 + 3} y={BASE - f * UNIT} width="10" height={f * UNIT} rx="2" fill={SCORED_C} />}
              {a > 0 && <rect x={x0 + 15} y={BASE - a * UNIT} width="10" height={a * UNIT} rx="2" fill={CONCEDED_C} />}
            </g>
          );
        })}
        <line x1="14" y1={BASE} x2="200" y2={BASE} stroke="#2a4a8a" strokeWidth="1.2" />
        <text x="14" y="162" fontSize="6.5" fill="#4a6899">Oldest</text>
        <text x="200" y="162" fontSize="6.5" fill="#4a6899" textAnchor="end">Latest</text>

        {/* totals */}
        {[
          { label: "SCORED", value: TOTAL_F, color: SCORED_C, y: 48 },
          { label: "CONCEDED", value: TOTAL_A, color: CONCEDED_C, y: 104 },
        ].map((tile, k) => (
          <g key={k} className={`th-tile-${k}`}>
            <rect x="212" y={tile.y} width="76" height="48" rx="7" fill="#0b1e5b" stroke="#142655" />
            <text x="222" y={tile.y + 14} fontSize="6.5" fontWeight="700" letterSpacing="1.2" fill="#9fb0da">{tile.label}</text>
            <text className={`th-val-${k}`} x="222" y={tile.y + 40} fontFamily={DISPLAY} fontStyle="italic" fontSize="24" fontWeight="900" fill={tile.color}>{tile.value}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
