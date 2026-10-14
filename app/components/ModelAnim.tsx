// "Model Transparency" feature card animation (pure SVG + CSS). Deliberately generic: a k-means
// clustering run on the left and a small random forest voting on the right. It doesn't depict
// Predibol's actual model. Plays only while the card is hovered (.feature-card:hover); at rest it
// shows the finished state. 9s loop. The k-means steps are real: points and centroids come from
// running k-means on seeded random data below, so every recolor and centroid move is correct.

const LOOP = 9;
const DISPLAY = "var(--font-kanit), 'Arial Black', sans-serif";
const COLORS = ["#7BE33B", "#4FA3F7", "#F2C14E"];
const GREY = "#4a6899";

// ── k-means data (seeded, deterministic so server and client render the same) ──
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}
const rand = rng(7);
const CENTERS = [[42, 58], [112, 66], [74, 126]];
const POINTS = CENTERS.flatMap(([cx, cy]) =>
  Array.from({ length: 8 }, () => [cx + (rand() + rand() - 1) * 26, cy + (rand() + rand() - 1) * 22])
);
const nearest = (p: number[], cs: number[][]) =>
  cs.reduce((best, c, k) => (Math.hypot(p[0] - c[0], p[1] - c[1]) < Math.hypot(p[0] - cs[best][0], p[1] - cs[best][1]) ? k : best), 0);

const ITERS = 3;
const centroidSteps: number[][][] = [[[30, 140], [60, 34], [136, 120]]]; // poor start on purpose
const assignSteps: number[][] = [];
for (let it = 0; it < ITERS; it++) {
  const cs = centroidSteps[it];
  const a = POINTS.map((p) => nearest(p, cs));
  assignSteps.push(a);
  centroidSteps.push(
    cs.map((c, k) => {
      const mine = POINTS.filter((_, i) => a[i] === k);
      return mine.length ? [mine.reduce((s, p) => s + p[0], 0) / mine.length, mine.reduce((s, p) => s + p[1], 0) / mine.length] : c;
    })
  );
}
const FINAL_ASSIGN = assignSteps[ITERS - 1];
const FINAL_C = centroidSteps[ITERS];

// ── random forest: 3 depth-2 trees, the leaf each one lands on, and its class ──
const TREE_X = [177, 222, 267];
const TREES = [
  { leaves: [1, 0, 1, 0], path: [0, 1] }, // left, then leaf 1 → class 0 (lime)
  { leaves: [1, 0, 0, 1], path: [1, 2] }, // right, then leaf 2 → class 0 (lime)
  { leaves: [1, 0, 0, 1], path: [0, 0] }, // left, then leaf 0 → class 1 (blue)
];
const node = (cx: number) => ({
  root: [cx, 40],
  kids: [[cx - 12, 64], [cx + 12, 64]],
  leaves: [[cx - 18, 92], [cx - 6, 92], [cx + 6, 92], [cx + 18, 92]],
});
const VOTE_Y = 120;

// ── timeline ──
const T_POINTS = 0.3;
const T_CENT = 1.2;
const tAssign = (k: number) => 1.7 + k * 1.1;
const tMove = (k: number) => 2.2 + k * 1.1;
const tTree = (j: number) => 1.0 + j * 0.35;
const tPath = (j: number) => 4.8 + j * 0.3;
const tVote = (j: number) => 5.9 + j * 0.15;
const T_RESULT = 6.6;

const pc = (sec: number) => `${Math.max(0, Math.min(100, (sec / LOOP) * 100)).toFixed(2)}%`;
const f = (n: number) => n.toFixed(1);

function buildCss() {
  const r: string[] = [];
  const play = (cls: string) => r.push(`.feature-card:hover .${cls} { animation: ${cls} ${LOOP}s linear infinite; }`);
  const pop = (t: number) => `0%, ${pc(t)} { opacity: 0; transform: scale(0); } ${pc(t + 0.18)} { opacity: 1; transform: scale(1.3); } ${pc(t + 0.3)}, 100% { opacity: 1; transform: scale(1); }`;
  const draw = (t: number, d = 0.4) => `0%, ${pc(t)} { stroke-dashoffset: 1; } ${pc(t + d)}, 100% { stroke-dashoffset: 0; }`;

  r.push(`@keyframes mt-scene { 0% { opacity: 0; } ${pc(0.3)}, ${pc(8.5)} { opacity: 1; } 100% { opacity: 0; } }`);
  play("mt-scene");

  POINTS.forEach((_, i) => {
    r.push(`@keyframes mt-pt-${i} { ${pop(T_POINTS + i * 0.03)} }`);
    play(`mt-pt-${i}`);
    const stops = [`0%, ${pc(tAssign(0))} { fill: ${GREY}; }`];
    assignSteps.forEach((a, k) => {
      const end = k + 1 < ITERS ? pc(tAssign(k + 1)) : "100%";
      stops.push(`${pc(tAssign(k) + 0.15)}, ${end} { fill: ${COLORS[a[i]]}; }`);
    });
    r.push(`@keyframes mt-fill-${i} { ${stops.join(" ")} }`);
    play(`mt-fill-${i}`);
  });

  [0, 1, 2].forEach((k) => {
    const stops = [`0%, ${pc(tMove(0))} { transform: translate(${f(centroidSteps[0][k][0])}px, ${f(centroidSteps[0][k][1])}px); }`];
    for (let it = 1; it <= ITERS; it++) {
      const end = it < ITERS ? pc(tMove(it)) : "100%";
      stops.push(`${pc(tMove(it - 1) + 0.4)}, ${end} { transform: translate(${f(centroidSteps[it][k][0])}px, ${f(centroidSteps[it][k][1])}px); }`);
    }
    r.push(`@keyframes mt-cpos-${k} { ${stops.join(" ")} }`);
    r.push(`@keyframes mt-cpop-${k} { ${pop(T_CENT + k * 0.12)} }`);
    r.push(`.feature-card:hover .mt-cpos-${k} { animation: mt-cpos-${k} ${LOOP}s ease-in-out infinite; }`);
    play(`mt-cpop-${k}`);
  });

  TREES.forEach((_, j) => {
    r.push(`@keyframes mt-tree-${j} { ${draw(tTree(j), 0.5)} }`);
    r.push(`@keyframes mt-nodes-${j} { 0%, ${pc(tTree(j))} { opacity: 0; } ${pc(tTree(j) + 0.4)}, 100% { opacity: 1; } }`);
    r.push(`@keyframes mt-path-${j} { ${draw(tPath(j), 0.35)} }`);
    r.push(`@keyframes mt-leaf-${j} { ${pop(tPath(j) + 0.3)} }`);
    r.push(`@keyframes mt-vote-${j} { 0%, ${pc(tVote(j))} { opacity: 0; transform: translateY(-${VOTE_Y - 92}px); } ${pc(tVote(j) + 0.08)} { opacity: 1; } ${pc(tVote(j) + 0.4)} { transform: translateY(2px); } ${pc(tVote(j) + 0.5)}, 100% { opacity: 1; transform: translateY(0); } }`);
    ["tree", "nodes", "path", "leaf", "vote"].forEach((n) => play(`mt-${n}-${j}`));
  });
  r.push(`@keyframes mt-result { ${pop(T_RESULT)} }`);
  play("mt-result");

  return `
.mt { display: block; width: 100%; height: auto; border-radius: 10px; font-family: inherit; }
.mt [class*="mt-pt-"], .mt [class*="mt-cpop-"], .mt [class*="mt-leaf-"], .mt .mt-result { transform-box: fill-box; transform-origin: center; }
${FINAL_C.map((c, k) => `.mt-cpos-${k} { transform: translate(${f(c[0])}px, ${f(c[1])}px); }`).join("\n")}
${r.join("\n")}
@media (prefers-reduced-motion: reduce) { .mt * { animation: none !important; } }
`;
}
const CSS = buildCss();

export function ModelAnim() {
  const votes = TREES.map((t) => t.leaves[t.path[1]]);
  const winner = votes.filter((v) => v === 0).length >= 2 ? 0 : 1;
  const winCount = votes.filter((v) => v === winner).length;

  return (
    <svg className="mt" viewBox="0 0 300 170" role="img"
      aria-label="Animation: points group into three colored clusters, and three decision trees vote on a result">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <rect width="300" height="170" rx="10" fill="#081537" />
      <g className="mt-scene">
        {/* ── k-means ── */}
        <rect x="8" y="8" width="140" height="154" rx="8" fill="#0b1e5b" stroke="#142655" />
        {POINTS.map((p, i) => (
          <circle key={i} className={`mt-pt-${i} mt-fill-${i}`} cx={f(p[0])} cy={f(p[1])} r="3" fill={COLORS[FINAL_ASSIGN[i]]} />
        ))}
        {[0, 1, 2].map((k) => (
          <g key={k} className={`mt-cpos-${k}`}>
            <g className={`mt-cpop-${k}`}>
              <circle r="6" fill="#081537" stroke={COLORS[k]} strokeWidth="2" />
              <path d="M-3 0 H3 M0 -3 V3" stroke={COLORS[k]} strokeWidth="1.6" strokeLinecap="round" />
            </g>
          </g>
        ))}

        {/* ── random forest ── */}
        <rect x="152" y="8" width="140" height="154" rx="8" fill="#0b1e5b" stroke="#142655" />
        {TREES.map((t, j) => {
          const n = node(TREE_X[j]);
          const kid = n.kids[t.path[0]];
          const leaf = n.leaves[t.path[1]];
          const edges = `M${n.root[0]} ${n.root[1]} L${n.kids[0][0]} ${n.kids[0][1]} L${n.leaves[0][0]} ${n.leaves[0][1]} M${n.kids[0][0]} ${n.kids[0][1]} L${n.leaves[1][0]} ${n.leaves[1][1]} M${n.root[0]} ${n.root[1]} L${n.kids[1][0]} ${n.kids[1][1]} L${n.leaves[2][0]} ${n.leaves[2][1]} M${n.kids[1][0]} ${n.kids[1][1]} L${n.leaves[3][0]} ${n.leaves[3][1]}`;
          return (
            <g key={j}>
              <path className={`mt-tree-${j}`} d={edges} pathLength={1} strokeDasharray="1" fill="none" stroke="#2a4a8a" strokeWidth="1.4" />
              <path className={`mt-path-${j}`} d={`M${n.root[0]} ${n.root[1]} L${kid[0]} ${kid[1]} L${leaf[0]} ${leaf[1]}`} pathLength={1}
                strokeDasharray="1" fill="none" stroke={COLORS[t.leaves[t.path[1]]]} strokeWidth="2.2" strokeLinecap="round" />
              <g className={`mt-nodes-${j}`}>
                {[n.root, ...n.kids].map(([x, y], q) => (
                  <circle key={q} cx={x} cy={y} r="4" fill="#081537" stroke="#9fb0da" strokeWidth="1.2" />
                ))}
                {n.leaves.map(([x, y], q) => (
                  <rect key={q} x={x - 3.5} y={y - 3.5} width="7" height="7" rx="1.5" fill={COLORS[t.leaves[q]]} fillOpacity="0.35" />
                ))}
              </g>
              <rect className={`mt-leaf-${j}`} x={leaf[0] - 4.5} y={leaf[1] - 4.5} width="9" height="9" rx="2" fill={COLORS[t.leaves[t.path[1]]]} stroke="#FFFFFF" strokeWidth="1" />
              <circle className={`mt-vote-${j}`} cx={TREE_X[j]} cy={VOTE_Y} r="4.5" fill={COLORS[votes[j]]} />
            </g>
          );
        })}
        <line x1="160" x2="284" y1={VOTE_Y + 9} y2={VOTE_Y + 9} stroke="#142655" />
        <g className="mt-result">
          <rect x="190" y="136" width="64" height="18" rx="9" fill={COLORS[winner]} />
          <text x="222" y="148.5" fontFamily={DISPLAY} fontStyle="italic" fontSize="10" fontWeight="900" fill="#0b1e5b" textAnchor="middle">
            {winCount} / {TREES.length} VOTE
          </text>
        </g>
      </g>
    </svg>
  );
}
