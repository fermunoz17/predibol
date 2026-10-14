"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Team {
  id: string;
  name: string;
}

export function TeamFilter({ teams, selectedId }: { teams: Team[]; selectedId?: string }) {
  const router = useRouter();
  const params = useSearchParams();

  function onChange(teamId: string) {
    const p = new URLSearchParams(params.toString());
    if (teamId) {
      p.set("team", teamId);
      p.delete("matchday");
    } else {
      p.delete("team");
    }
    router.push(`/predictions?${p.toString()}`);
  }

  return (
    <select
      value={selectedId ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#060f2a] border border-[#142655] text-[#90b8e8] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#1e4488]"
    >
      <option value="">All teams</option>
      {teams.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
