"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function TabNav({ activeTab }: { activeTab: "upcoming" | "results" }) {
  const params = useSearchParams();

  function tabHref(tab: "upcoming" | "results") {
    const p = new URLSearchParams();
    p.set("tab", tab);
    return `/predictions?${p.toString()}`;
  }

  return (
    <div className="flex border-b border-gray-800 mb-6">
      {(["upcoming", "results"] as const).map((tab) => {
        const active = activeTab === tab;
        return (
          <Link
            key={tab}
            href={tabHref(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              active
                ? "border-white text-white"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab === "upcoming" ? "Upcoming" : "Results"}
          </Link>
        );
      })}
    </div>
  );
}
