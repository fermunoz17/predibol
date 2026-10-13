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
      className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500"
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
