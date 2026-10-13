"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";

interface FormEntry { s: number; c: number }

interface UclStanding {
  rank: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  coeff: number | null;
}

interface Features {
  home_form: FormEntry[];
  away_form: FormEntry[];
  home_form_avg_scored: number;
  home_form_avg_conceded: number;
  away_form_avg_scored: number;
  away_form_avg_conceded: number;
  home_scoring_edge: number;
  away_scoring_edge: number;
  ucl_home: UclStanding | null;
  ucl_away: UclStanding | null;
}

const DEFAULT_HOME = "#3b82f6";
const DEFAULT_AWAY = "#ef4444";

function hex(color: string | null | undefined, fallback: string) {
  return color ?? fallback;
}

/** Add alpha to a hex color: "#DC052D" → "rgba(..., opacity)" */
function withAlpha(hexColor: string, opacity: number) {
  const c = hexColor.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ── Probability chart ─────────────────────────────────────────────────────────

export function ProbabilityChart({ homeTeam, awayTeam, homeWinProb, drawProb, awayWinProb, homeColor, awayColor }: {
  homeTeam: string; awayTeam: string;
  homeWinProb: number; drawProb: number; awayWinProb: number;
  homeColor?: string | null; awayColor?: string | null;
}) {
  const hc = hex(homeColor, DEFAULT_HOME);
  const ac = hex(awayColor, DEFAULT_AWAY);

  const data = [
    { name: homeTeam, prob: Math.round(homeWinProb * 100), fill: hc },
    { name: "Draw",   prob: Math.round(drawProb * 100),    fill: "#6b7280" },
    { name: awayTeam, prob: Math.round(awayWinProb * 100), fill: ac },
  ];

  return (
    <ChartCard title="Win Probability">
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32 }}>
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`}
            tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={120}
            tick={{ fill: "#d1d5db", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v) => [`${v}%`, "Probability"]}
            contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
            labelStyle={{ color: "#f9fafb" }} />
          <Bar dataKey="prob" radius={[0, 4, 4, 0]} label={{ position: "right", fill: "#9ca3af", fontSize: 12, formatter: (v: unknown) => `${v}%` }}>
            {data.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ── Elo comparison chart ──────────────────────────────────────────────────────

const HOME_ADV = 100;

export function EloChart({ homeTeam, awayTeam, homeElo, awayElo, homeColor, awayColor }: {
  homeTeam: string; awayTeam: string; homeElo: number; awayElo: number;
  homeColor?: string | null; awayColor?: string | null;
}) {
  const hc = hex(homeColor, DEFAULT_HOME);
  const ac = hex(awayColor, DEFAULT_AWAY);

  const data = [
    { name: homeTeam, elo: Math.round(homeElo), effective: Math.round(homeElo + HOME_ADV), fill: hc },
    { name: awayTeam, elo: Math.round(awayElo), effective: Math.round(awayElo), fill: ac },
  ];

  const min = Math.min(homeElo, awayElo) - 100;
  const max = Math.max(homeElo + HOME_ADV, awayElo) + 100;

  return (
    <ChartCard title="Elo Ratings">
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 64 }}>
          <XAxis type="number" domain={[min, max]} tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={120}
            tick={{ fill: "#d1d5db", fontSize: 12 }} axisLine={false} tickLine={false} />
          <ReferenceLine x={1500} stroke="#374151" strokeDasharray="4 4" label={{ value: "avg", fill: "#6b7280", fontSize: 10 }} />
          <Tooltip
            formatter={(value, name) => [value, name === "effective" ? `Elo (incl. +${HOME_ADV} home adv.)` : "Elo"]}
            contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
            labelStyle={{ color: "#f9fafb" }} />
          <Bar dataKey="effective" radius={[0, 4, 4, 0]}
            label={{ position: "right", fill: "#9ca3af", fontSize: 12 }}>
            {data.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-600 mt-2">
        Home team gets +{HOME_ADV} Elo points added before comparison.
      </p>
    </ChartCard>
  );
}

// ── Form chart ────────────────────────────────────────────────────────────────

function TeamFormChart({ team, form, color }: {
  team: string; form: FormEntry[]; color: string;
}) {
  if (!form || form.length === 0) {
    return (
      <div className="text-center text-xs text-gray-600 py-8">
        No domestic league form data available for {team}.
      </div>
    );
  }

  const data = form.map((f, i) => ({
    match: `M-${form.length - i}`,
    scored: f.s,
    conceded: f.c,
  })).reverse();

  return (
    <div>
      <div className="text-xs font-medium mb-2" style={{ color }}>{team}</div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} margin={{ left: 0, right: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="match" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
            labelStyle={{ color: "#9ca3af", fontSize: 11 }} />
          <Bar dataKey="scored" name="Scored" fill={color} radius={[2, 2, 0, 0]} />
          <Bar dataKey="conceded" name="Conceded" fill="#374151" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-1 text-xs text-gray-500">
        <span><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: color }} />Scored</span>
        <span><span className="inline-block w-2 h-2 rounded-sm mr-1 bg-gray-700" />Conceded</span>
      </div>
    </div>
  );
}

export function FormChart({ homeTeam, awayTeam, features, homeColor, awayColor }: {
  homeTeam: string; awayTeam: string; features: Features | null;
  homeColor?: string | null; awayColor?: string | null;
}) {
  return (
    <ChartCard title="Recent Form — Last 5 Matches">
      <div className="grid grid-cols-2 gap-6">
        <TeamFormChart team={homeTeam} form={features?.home_form ?? []} color={hex(homeColor, DEFAULT_HOME)} />
        <TeamFormChart team={awayTeam} form={features?.away_form ?? []} color={hex(awayColor, DEFAULT_AWAY)} />
      </div>
    </ChartCard>
  );
}

// ── Attack vs defence radar ───────────────────────────────────────────────────

export function AttackDefenceChart({ homeTeam, awayTeam, features, homeColor, awayColor }: {
  homeTeam: string; awayTeam: string; features: Features | null;
  homeColor?: string | null; awayColor?: string | null;
}) {
  if (!features) return null;

  const hc = hex(homeColor, DEFAULT_HOME);
  const ac = hex(awayColor, DEFAULT_AWAY);

  const data = [
    {
      stat: "Attack",
      [homeTeam]: parseFloat(features.home_form_avg_scored.toFixed(2)),
      [awayTeam]: parseFloat(features.away_form_avg_scored.toFixed(2)),
    },
    {
      stat: "Defence",
      [homeTeam]: parseFloat((3 - features.home_form_avg_conceded).toFixed(2)),
      [awayTeam]: parseFloat((3 - features.away_form_avg_conceded).toFixed(2)),
    },
    {
      stat: "Scoring Edge",
      [homeTeam]: parseFloat((features.home_scoring_edge + 1.5).toFixed(2)),
      [awayTeam]: parseFloat((features.away_scoring_edge + 1.5).toFixed(2)),
    },
  ];

  return (
    <ChartCard title="Attack vs Defence Profile">
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid stroke="#1f2937" />
          <PolarAngleAxis dataKey="stat" tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <Radar name={homeTeam} dataKey={homeTeam} stroke={hc} fill={hc} fillOpacity={0.2} />
          <Radar name={awayTeam} dataKey={awayTeam} stroke={ac} fill={ac} fillOpacity={0.2} />
          <Tooltip
            contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
            labelStyle={{ color: "#9ca3af", fontSize: 11 }} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 text-xs text-gray-500 mt-1">
        <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: hc }} />{homeTeam}</span>
        <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: ac }} />{awayTeam}</span>
      </div>
      <p className="text-xs text-gray-600 mt-2 text-center">
        Defence = inverted goals conceded. Scoring Edge = team avg scored − opponent avg conceded.
      </p>
    </ChartCard>
  );
}

// ── Scoring edge chart ────────────────────────────────────────────────────────

export function ScoringEdgeChart({ homeTeam, awayTeam, features, homeColor, awayColor }: {
  homeTeam: string; awayTeam: string; features: Features | null;
  homeColor?: string | null; awayColor?: string | null;
}) {
  if (!features) return null;

  const hc = hex(homeColor, DEFAULT_HOME);
  const ac = hex(awayColor, DEFAULT_AWAY);

  const data = [
    { label: `${homeTeam} scores`,    value: features.home_form_avg_scored,   fill: hc },
    { label: `${awayTeam} concedes`,  value: features.away_form_avg_conceded, fill: withAlpha(ac, 0.4) },
    { label: `${awayTeam} scores`,    value: features.away_form_avg_scored,   fill: ac },
    { label: `${homeTeam} concedes`,  value: features.home_form_avg_conceded, fill: withAlpha(hc, 0.4) },
  ];

  return (
    <ChartCard title="Scoring Edge — Avg Goals Last 5">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 48 }}>
          <XAxis type="number" domain={[0, 3]} tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="label" width={160}
            tick={{ fill: "#d1d5db", fontSize: 11 }} axisLine={false} tickLine={false} />
          <ReferenceLine x={1.35} stroke="#374151" strokeDasharray="4 4"
            label={{ value: "avg", fill: "#6b7280", fontSize: 10 }} />
          <Tooltip formatter={(v: unknown) => [(v as number).toFixed(2), "Goals / match"]}
            contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
            labelStyle={{ color: "#f9fafb" }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}
            label={{ position: "right", fill: "#9ca3af", fontSize: 11, formatter: (v: unknown) => (v as number).toFixed(2) }}>
            {data.map((entry) => <Cell key={entry.label} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-600 mt-2">
        If a team scores more than their opponent concedes on average, they have a positive scoring edge.
      </p>
    </ChartCard>
  );
}

// ── UCL standings chart ───────────────────────────────────────────────────────

function StandingsStat({ label, home, away, higherIsBetter = true, homeColor, awayColor }: {
  label: string; home: number | null; away: number | null; higherIsBetter?: boolean;
  homeColor: string; awayColor: string;
}) {
  if (home == null || away == null) return null;
  const homeLeads = higherIsBetter ? home > away : home < away;
  const awayLeads = higherIsBetter ? away > home : away < home;
  return (
    <div className="grid grid-cols-3 items-center text-sm py-1.5 border-b border-gray-800 last:border-0">
      <span className="font-semibold" style={{ color: homeLeads ? homeColor : "#d1d5db" }}>{home}</span>
      <span className="text-center text-xs text-gray-500">{label}</span>
      <span className="font-semibold text-right" style={{ color: awayLeads ? awayColor : "#d1d5db" }}>{away}</span>
    </div>
  );
}

export function UclStandingsChart({ homeTeam, awayTeam, features, homeColor, awayColor }: {
  homeTeam: string; awayTeam: string; features: Features | null;
  homeColor?: string | null; awayColor?: string | null;
}) {
  const h = features?.ucl_home;
  const a = features?.ucl_away;

  if (!h && !a) return null;

  const hc = hex(homeColor, DEFAULT_HOME);
  const ac = hex(awayColor, DEFAULT_AWAY);

  const chartData = h && a ? [
    { stat: "Points",    home: h.pts,    away: a.pts },
    { stat: "Goals For", home: h.gf,     away: a.gf },
    { stat: "Goal Diff", home: h.gd + 5, away: a.gd + 5 },
    { stat: "Wins",      home: h.won,    away: a.won },
  ] : [];

  return (
    <ChartCard title="UCL Standings This Season">
      <div className="grid grid-cols-3 text-xs text-gray-500 mb-2">
        <span className="font-medium truncate" style={{ color: hc }}>{homeTeam}</span>
        <span className="text-center">Stat</span>
        <span className="font-medium text-right truncate" style={{ color: ac }}>{awayTeam}</span>
      </div>

      {h && a ? (
        <>
          <StandingsStat label="Rank"    home={h.rank} away={a.rank} higherIsBetter={false} homeColor={hc} awayColor={ac} />
          <StandingsStat label="Points"  home={h.pts}  away={a.pts}  homeColor={hc} awayColor={ac} />
          <div className="grid grid-cols-3 items-center text-sm py-1.5 border-b border-gray-800">
            <span className="text-gray-300">{h.won}W {h.drawn}D {h.lost}L</span>
            <span className="text-center text-xs text-gray-500">Record</span>
            <span className="text-gray-300 text-right">{a.won}W {a.drawn}D {a.lost}L</span>
          </div>
          <StandingsStat label="Goals For"  home={h.gf} away={a.gf}  homeColor={hc} awayColor={ac} />
          <StandingsStat label="Goals Agst" home={h.ga} away={a.ga} higherIsBetter={false} homeColor={hc} awayColor={ac} />
          <StandingsStat label="Goal Diff"  home={h.gd} away={a.gd}  homeColor={hc} awayColor={ac} />
          {h.coeff != null && a.coeff != null && (
            <StandingsStat label="UEFA Coeff" home={h.coeff} away={a.coeff} homeColor={hc} awayColor={ac} />
          )}

          {chartData.length > 0 && (
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={chartData} margin={{ left: 0, right: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="stat" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                    labelStyle={{ color: "#9ca3af", fontSize: 11 }} />
                  <Bar dataKey="home" name={homeTeam} fill={hc} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="away" name={awayTeam} fill={ac} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-600 mt-1 text-center">
                Goal Diff bar is offset by +5 so negative values are visible.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-xs text-gray-500 py-4 text-center">
          Standings data available for {h ? homeTeam : awayTeam} only.
          {!h && <div className="mt-1">{homeTeam}: no UCL standings data</div>}
          {!a && <div className="mt-1">{awayTeam}: no UCL standings data</div>}
        </div>
      )}
    </ChartCard>
  );
}
