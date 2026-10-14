"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Props {
  currentIdx: number;
  total: number;
  label: string;
}

export function MatchdayNav({ currentIdx, total, label }: Props) {
  const params = useSearchParams();

  function href(idx: number) {
    const p = new URLSearchParams(params.toString());
    p.set("matchday", String(idx));
    p.delete("team");
    return `/predictions?${p.toString()}`;
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      {currentIdx > 0 ? (
        <Link href={href(currentIdx - 1)} className="text-[#9fb0da] hover:text-[#7BE33B] px-1 transition-colors">←</Link>
      ) : (
        <span className="text-[#2a4a8a] px-1">←</span>
      )}
      <span className="text-[#9fb0da] min-w-[140px] text-center">{label}</span>
      {currentIdx < total - 1 ? (
        <Link href={href(currentIdx + 1)} className="text-[#9fb0da] hover:text-[#7BE33B] px-1 transition-colors">→</Link>
      ) : (
        <span className="text-[#2a4a8a] px-1">→</span>
      )}
    </div>
  );
}
