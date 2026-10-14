// "Leagues & Leaderboards" feature card animation (pure SVG + CSS). Plays only while the card is
// hovered (.feature-card:hover); at rest it shows the finished leaderboard. 8s loop:
// 4 players pop in → their points appear → their ranks appear (2, 3, 1, 4) → avatars fly into a
// sorted leaderboard → crown on #1. Sample players, not real users. Keyframes generated below.

const DISPLAY = "var(--font-kanit), 'Arial Black', sans-serif";
const LOOP = 8;

const PLAYERS = [
  { name: "Fer", pts: 118, color: "#2457E6", icon: "#FFFFFF" },
  { name: "Lau", pts: 96, color: "#7BE33B", icon: "#0B1E5B" },
  { name: "Kim", pts: 142, color: "#2BAE66", icon: "#FFFFFF" },
  { name: "Alex", pts: 71, color: "#E08A3C", icon: "#FFFFFF" },
];
// rank = position after sorting by points (here 2, 3, 1, 4)
const RANKS = PLAYERS.map((p) => 1 + PLAYERS.filter((q) => q.pts > p.pts).length);

const GX = [48, 116, 184, 252]; // grid avatar centres
const GY = 60;
const R = 20;
const ROW_Y = (rank: number) => 12 + (rank - 1) * 38; // row top
const ROW_CY = (rank: number) => ROW_Y(rank) + 16;
const AV_X = 60; // avatar centre in the leaderboard
const S = 0.55; // avatar scale in the leaderboard

const pc = (sec: number) => `${Math.max(0, Math.min(100, (sec / LOOP) * 100)).toFixed(2)}%`;

function buildCss() {
  const r: string[] = [];
  const play = (cls: string) => r.push(`.feature-card:hover .${cls} { animation: ${cls} ${LOOP}s linear infinite; }`);
  r.push(`@keyframes lb-scene { 0% { opacity: 0; } ${pc(0.3)}, ${pc(7.5)} { opacity: 1; } 100% { opacity: 0; } }`);
  play("lb-scene");

  PLAYERS.forEach((_, i) => {
    const rank = RANKS[i];
    const dx = AV_X - GX[i];
    const dy = ROW_CY(rank) - GY;
    const t0 = 0.25 + i * 0.15;
    const tm = 4.0 + i * 0.08;
    const end = `translate(${dx}px, ${dy}px) scale(${S})`;
    r.push(`@keyframes lb-av-${i} { 0%, ${pc(t0)} { opacity: 0; transform: translate(0, 0) scale(0); } ${pc(t0 + 0.2)} { opacity: 1; transform: translate(0, 0) scale(1.15); } ${pc(t0 + 0.3)}, ${pc(tm)} { opacity: 1; transform: translate(0, 0) scale(1); } ${pc(tm + 0.6)}, 100% { opacity: 1; transform: ${end}; } }`);
    play(`lb-av-${i}`);

    const shown = (start: number, pop: boolean) => {
      const a = pop ? "transform: scale(.4);" : "";
      const b = pop ? "transform: scale(1.2);" : "";
      const c = pop ? "transform: scale(1);" : "";
      return `0%, ${pc(start)} { opacity: 0; ${a} } ${pc(start + 0.2)} { opacity: 1; ${b} } ${pc(start + 0.3)}, ${pc(3.9)} { opacity: 1; ${c} } ${pc(4.2)}, 100% { opacity: 0; ${c} }`;
    };
    r.push(`@keyframes lb-name-${i} { ${shown(t0 + 0.1, false)} }`);
    r.push(`@keyframes lb-pts-${i} { ${shown(1.4 + i * 0.18, true)} }`);
    r.push(`@keyframes lb-rank-${i} { ${shown(2.7 + i * 0.22, true)} }`);
    play(`lb-name-${i}`);
    play(`lb-pts-${i}`);
    play(`lb-rank-${i}`);
  });

  [1, 2, 3, 4].forEach((rank) => {
    const t = 4.3 + (rank - 1) * 0.12;
    r.push(`@keyframes lb-row-${rank} { 0%, ${pc(t)} { opacity: 0; transform: translateX(-12px); } ${pc(t + 0.35)}, 100% { opacity: 1; transform: translateX(0); } }`);
    play(`lb-row-${rank}`);
  });

  r.push(`@keyframes lb-crown { 0%, ${pc(5.1)} { opacity: 0; transform: scale(0) rotate(-30deg); } ${pc(5.35)} { opacity: 1; transform: scale(1.35) rotate(10deg); } ${pc(5.5)} { transform: scale(1) rotate(-6deg); } ${pc(5.65)}, 100% { opacity: 1; transform: scale(1) rotate(0); } }`);
  play("lb-crown");

  return `
.lb { display: block; width: 100%; height: auto; border-radius: 10px; font-family: inherit; }
.lb [class*="lb-av-"], .lb [class*="lb-pts-"], .lb [class*="lb-rank-"], .lb .lb-crown { transform-box: fill-box; transform-origin: center; }
.lb [class*="lb-name-"], .lb [class*="lb-pts-"], .lb [class*="lb-rank-"] { opacity: 0; }
${r.join("\n")}
@media (prefers-reduced-motion: reduce) { .lb * { animation: none !important; } }
`;
}
const CSS = buildCss();

function Avatar({ i, cx, cy }: { i: number; cx: number; cy: number }) {
  const p = PLAYERS[i];
  return (
    <>
      <circle cx={cx} cy={cy} r={R} fill={p.color} />
      <g clipPath={`url(#lb-clip-${i})`} fill={p.icon} fillOpacity="0.92">
        <circle cx={cx} cy={cy - 5} r="7" />
        <path d={`M${cx - 14} ${cy + 21} Q${cx} ${cy - 2} ${cx + 14} ${cy + 21} Z`} />
      </g>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#060f2a" strokeOpacity="0.5" strokeWidth="1.5" />
    </>
  );
}

export function LeagueAnim() {
  const order = [1, 2, 3, 4].map((rank) => RANKS.indexOf(rank));
  return (
    <svg
      className="lb"
      viewBox="0 0 300 170"
      role="img"
      aria-label={`Animation: four league players show their points and ranks, then line up in a leaderboard with a crown on the leader, ${PLAYERS[order[0]].name}`}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <defs>
        {PLAYERS.map((_, i) => (
          <clipPath key={i} id={`lb-clip-${i}`}><circle cx={GX[i]} cy={GY} r={R} /></clipPath>
        ))}
      </defs>
      <rect width="300" height="170" rx="10" fill="#081537" />
      <g className="lb-scene">
        {/* leaderboard rows (behind the avatars) */}
        {order.map((i, k) => {
          const rank = k + 1;
          const y = ROW_Y(rank);
          const cy = ROW_CY(rank);
          const lead = rank === 1;
          return (
            <g key={rank} className={`lb-row-${rank}`}>
              <rect x="12" y={y} width="276" height="32" rx="8" fill="#0b1e5b" stroke={lead ? "#F2C14E" : "#142655"} strokeOpacity={lead ? 0.7 : 1} />
              <text x="26" y={cy + 5} fontFamily={DISPLAY} fontStyle="italic" fontSize="13" fontWeight="900" fill={lead ? "#F2C14E" : "#4a6899"} textAnchor="middle">{rank}</text>
              <text x="80" y={cy + 3.5} fontSize="10" fontWeight="700" fill="#FFFFFF">{PLAYERS[i].name}</text>
              <text x="262" y={cy + 5} fontFamily={DISPLAY} fontStyle="italic" fontSize="14" fontWeight="900" fill={lead ? "#7BE33B" : "#FFFFFF"} textAnchor="end">{PLAYERS[i].pts}</text>
              <text x="266" y={cy + 4} fontSize="6.5" fontWeight="700" fill="#4a6899">PTS</text>
            </g>
          );
        })}

        {/* players: avatar, name, points, rank */}
        {PLAYERS.map((p, i) => {
          const rank = RANKS[i];
          const restTransform = `translate(${AV_X - GX[i]}px, ${ROW_CY(rank) - GY}px) scale(${S})`;
          const gold = rank === 1;
          return (
            <g key={p.name}>
              <text className={`lb-name-${i}`} x={GX[i]} y={GY + 34} fontSize="8.5" fontWeight="700" fill="#9fb0da" textAnchor="middle">{p.name}</text>
              <text className={`lb-pts-${i}`} x={GX[i]} y={GY + 58} fontFamily={DISPLAY} fontStyle="italic" fontSize="17" fontWeight="900" fill="#7BE33B" textAnchor="middle">{p.pts}</text>
              <g className={`lb-rank-${i}`}>
                <circle cx={GX[i] + 17} cy={GY - 17} r="9" fill={gold ? "#F2C14E" : "#2a4a8a"} stroke="#081537" strokeWidth="1.5" />
                <text x={GX[i] + 17} y={GY - 13.8} fontSize="8.5" fontWeight="800" fill={gold ? "#0b1e5b" : "#FFFFFF"} textAnchor="middle">#{rank}</text>
              </g>
              <g className={`lb-av-${i}`} style={{ transform: restTransform }}>
                <Avatar i={i} cx={GX[i]} cy={GY} />
              </g>
            </g>
          );
        })}

        {/* crown on the leader */}
        <path className="lb-crown" fill="#F2C14E" stroke="#081537" strokeWidth="0.8" strokeLinejoin="round"
          d={`M${AV_X - 8} ${ROW_CY(1) - 9} L${AV_X - 9} ${ROW_CY(1) - 19} L${AV_X - 4} ${ROW_CY(1) - 14} L${AV_X} ${ROW_CY(1) - 21} L${AV_X + 4} ${ROW_CY(1) - 14} L${AV_X + 9} ${ROW_CY(1) - 19} L${AV_X + 8} ${ROW_CY(1) - 9} Z`} />
      </g>
    </svg>
  );
}
