"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Competition = {
  id: number;
  name: string;
  country: string;
  logo?: string;
  season?: number;
  category: "international" | "club";
  liveMatches: number;
  upcomingMatches: number;
};

type CompetitionResponse = {
  success?: boolean;
  focus?: "international" | "club" | "balanced";
  competitions?: Competition[];
};

export default function PopularCompetitions() {
  const [items, setItems] = useState<Competition[]>([]);
  const [focus, setFocus] = useState<CompetitionResponse["focus"]>("balanced");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCompetitions = async () => {
      try {
        const response = await fetch("/api/football/active-competitions", { cache: "no-store" });
        const data: CompetitionResponse = await response.json();
        if (!response.ok || !data.success) throw new Error("Competition list unavailable.");
        if (!cancelled) {
          setItems(data.competitions || []);
          setFocus(data.focus || "balanced");
        }
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadCompetitions();
    const refresh = window.setInterval(loadCompetitions, 15 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(refresh);
    };
  }, []);

  const focusLabel =
    focus === "international"
      ? "International football is in focus"
      : focus === "club"
        ? "Club football is in focus"
        : "What's active across football right now";

  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#141e29]">
      <div className="border-b border-white/[0.07] px-4 py-4">
        <h2 className="text-xs font-black uppercase tracking-[0.16em] text-slate-300">
          Competitions in Focus
        </h2>
        <p className="mt-1 text-[10px] leading-4 text-emerald-400">{focusLabel}</p>
        <p className="mt-1 text-[10px] text-slate-500">Ranked by popularity, live action and fixtures in the next 14 days</p>
      </div>

      <div className="max-h-[70vh] space-y-1 overflow-y-auto p-2">
        {loading && <p className="p-3 text-xs text-slate-500">Finding the most relevant competitions...</p>}
        {!loading && items.length === 0 && (
          <p className="p-3 text-xs text-slate-500">No active or upcoming competitions were found.</p>
        )}

        {items.map((item) => (
          <Link
            key={item.id}
            href={`/leagues?league=${item.id}`}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-xs text-slate-300 transition hover:bg-white/[0.05] hover:text-emerald-400"
          >
            {item.logo ? (
              <img src={item.logo} alt="" className="h-7 w-7 shrink-0 object-contain" />
            ) : (
              <span className="h-7 w-7 shrink-0 rounded-lg bg-[#202d3b]" />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{item.name}</span>
              <span className="mt-0.5 block truncate text-[10px] text-slate-500">{item.country}</span>
              <span className="mt-1 flex flex-wrap gap-1.5">
                {item.liveMatches > 0 && (
                  <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-300">
                    {item.liveMatches} LIVE
                  </span>
                )}
                {item.upcomingMatches > 0 && (
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                    {item.upcomingMatches} UPCOMING
                  </span>
                )}
              </span>
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/leagues"
        className="block border-t border-white/[0.07] px-4 py-3 text-xs font-bold text-emerald-400 hover:text-emerald-300"
      >
        All competitions →
      </Link>
    </section>
  );
}
