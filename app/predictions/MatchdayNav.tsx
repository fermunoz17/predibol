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
        <Link href={href(currentIdx - 1)} className="text-gray-400 hover:text-white px-1">←</Link>
      ) : (
        <span className="text-gray-700 px-1">←</span>
      )}
      <span className="text-gray-300 min-w-[140px] text-center">{label}</span>
      {currentIdx < total - 1 ? (
        <Link href={href(currentIdx + 1)} className="text-gray-400 hover:text-white px-1">→</Link>
      ) : (
        <span className="text-gray-700 px-1">→</span>
      )}
    </div>
  );
}
