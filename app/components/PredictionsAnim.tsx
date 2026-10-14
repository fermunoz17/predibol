// "Your Predictions" feature card animation (pure SVG + CSS, styles in globals.css → "Feature: Your Predictions").
// 8s loop: zoomed in on one fixture → tap → green blink on the chosen shield → zoom out to the
// full pick table → more picks fill in. Teams are invented crests, not real clubs.

const SHIELD = "M11 1 L20 4 V11 C20 16 16 19.5 11 21 C6 19.5 2 16 2 11 V4 Z";
const BAND = "M2 9 L11 13 L20 9 V12.5 L11 16.5 L2 12.5 Z";

type Team = { fill: string; band: string };

const ROWS: { home: Team; away: Team; pick: 0 | 1 | 2 }[] = [
  { home: { fill: "#E63946", band: "#FFFFFF" }, away: { fill: "#4FA3F7", band: "#0B1E5B" }, pick: 0 },
  { home: { fill: "#F2C14E", band: "#141414" }, away: { fill: "#7B4FD6", band: "#FFFFFF" }, pick: 1 },
  { home: { fill: "#2BAE66", band: "#FFFFFF" }, away: { fill: "#F28C28", band: "#0B1E5B" }, pick: 2 },
  { home: { fill: "#E8ECF5", band: "#C8102E" }, away: { fill: "#8B1E3F", band: "#F2C14E" }, pick: 0 },
];

const PILL_X = [216, 242, 268];
const LABELS = ["1", "X", "2"];

function Shield({ team, x, y, className }: { team: Team; x: number; y: number; className?: string }) {
  return (
    <g transform={`translate(${x} ${y})`} className={className}>
      <path d={SHIELD} fill={team.fill} />
      <path d={BAND} fill={team.band} />
      <path d={SHIELD} fill="none" stroke="#060f2a" strokeOpacity="0.5" strokeWidth="1" />
    </g>
  );
}

export function PredictionsAnim() {
  return (
    <svg
      className="pa"
      viewBox="0 0 300 170"
      role="img"
      aria-label="Animation: picking a winner between two teams, then a table of upcoming matches being filled in with picks"
    >
      <rect width="300" height="170" rx="10" fill="#081537" />
      <g className="pa-scene">
        <g className="pa-table">
          {ROWS.map((row, i) => {
            const y = 8 + i * 40;
            const first = i === 0;
            return (
              <g key={i}>
                <rect x="4" y={y} width="292" height="34" rx="7" fill="#0b1e5b" stroke="#142655" />
                <Shield team={row.home} x={10} y={y + 6} />
                <text x="47" y={y + 20.5} fontSize="8" fontWeight="700" fill="#4a6899" textAnchor="middle">VS</text>
                <Shield team={row.away} x={62} y={y + 6} className={first ? "pa-dim" : undefined} />
                <rect x="96" y={y + 11} width="70" height="5" rx="2.5" fill="#1c3470" />
                <rect x="96" y={y + 20} width="46" height="4" rx="2" fill="#142655" />
                {PILL_X.map((px, p) => (
                  <g key={p}>
                    <rect x={px} y={y + 8} width="22" height="18" rx="5" fill="#0b1e5b" stroke="#2a4a8a" />
                    <text x={px + 11} y={y + 21} fontSize="10" fontWeight="700" fill="#9fb0da" textAnchor="middle">{LABELS[p]}</text>
                  </g>
                ))}
                {/* the pick, lit green */}
                <g className={`pa-pick pa-pick-${i + 1}`}>
                  <rect x={PILL_X[row.pick]} y={y + 8} width="22" height="18" rx="5" fill="#7BE33B" />
                  <text x={PILL_X[row.pick] + 11} y={y + 21} fontSize="10" fontWeight="800" fill="#0b1e5b" textAnchor="middle">{LABELS[row.pick]}</text>
                </g>
                {first && (
                  <>
                    <path className="pa-ring" d={SHIELD} transform={`translate(7.25 ${y + 3.25}) scale(1.25)`} fill="none" stroke="#7BE33B" strokeWidth="1.8" />
                    <g className="pa-check">
                      <circle cx="31" cy={y + 8} r="5.5" fill="#7BE33B" stroke="#0b1e5b" strokeWidth="1.2" />
                      <path d={`M28.6 ${y + 8.2} l1.7 1.7 l3.2 -3.4`} fill="none" stroke="#0b1e5b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                    <circle className="pa-tap" cx="21" cy={y + 17} r="4" fill="#FFFFFF" />
                  </>
                )}
              </g>
            );
          })}
        </g>
      </g>
    </svg>
  );
}
