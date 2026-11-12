"use client";

import { useEffect, useState } from "react";

interface OddsValue {
  label: string;
  odd: string;
}

interface OddsBet {
  id: number;
  name: string;
  values: OddsValue[];
}

interface OddsBookmaker {
  id: number;
  name: string;
  bets: OddsBet[];
}

interface OddsResponse {
  success?: boolean;
  available?: boolean;
  updatedAt?: string | null;
  bookmakers?: OddsBookmaker[];
}

export default function MatchOdds({ matchId }: { matchId: string }) {
  const [bookmakers, setBookmakers] = useState<OddsBookmaker[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOdds() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/football/odds?id=${encodeURIComponent(matchId)}`,
          { cache: "no-store" }
        );
        const data: OddsResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Unable to load data right now. Please try again later.");
        }

        if (!cancelled) {
          setBookmakers(data.bookmakers ?? []);
          setUpdatedAt(data.updatedAt ?? null);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load data right now. Please try again later.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadOdds();
    return () => {
      cancelled = true;
    };
  }, [matchId]);

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#101d2d] p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
          Match markets
        </p>
        <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
          Betting Odds
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Pre-match odds supplied by API-Football. Availability varies by fixture and provider coverage.
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#0c1725] p-8 text-center">
          <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />
          <p className="text-sm text-slate-400">Loading verified odds...</p>
        </div>
      ) : error ? (
        <p className="rounded-xl border border-white/[0.06] bg-[#0c1725] p-5 text-sm text-slate-400">
          {error}
        </p>
      ) : bookmakers.length === 0 ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
          <p className="font-bold text-amber-300">Odds are not available for this match</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            The provider has not returned verified odds for this fixture. Coverage depends on the competition and subscription. No estimated odds are displayed.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {bookmakers.map((bookmaker) => (
            <div
              key={bookmaker.id}
              className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0c1725]"
            >
              <div className="border-b border-white/[0.06] px-4 py-3">
                <h3 className="font-bold text-white">{bookmaker.name}</h3>
              </div>

              <div className="divide-y divide-white/[0.05]">
                {bookmaker.bets.map((bet) => (
                  <div key={bet.id} className="p-4">
                    <h4 className="mb-3 text-xs font-semibold text-slate-400">
                      {bet.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                      {bet.values.map((value, index) => (
                        <div
                          key={`${value.label}-${index}`}
                          className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-3"
                        >
                          <p className="truncate text-xs text-slate-400">{value.label}</p>
                          <p className="mt-1 text-lg font-black text-emerald-300">{value.odd}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {updatedAt && (
            <p className="text-right text-[10px] text-slate-500">
              Provider update: {new Date(updatedAt).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}
            </p>
          )}
        </div>
      )}

      <p className="mt-6 border-t border-white/[0.06] pt-4 text-[10px] leading-5 text-slate-500">
        Odds are informational data from the provider and may change. Always verify current information independently.
      </p>
    </section>
  );
}
