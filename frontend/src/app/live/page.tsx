"use client";

import { useCallback, useEffect, useState } from "react";

import Header from "@/components/Header";
import LiveMatchCard from "@/components/LiveMatchCard";
import Footer from "@/components/Footer";

import type { Match } from "@/types/football";

interface ApiFootballFixture {
  fixture: {
    id: number;
    status: {
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    name: string;
  };
  teams: {
    home: {
      name: string;
      code: string | null;
      logo?: string;
    };
    away: {
      name: string;
      code: string | null;
      logo?: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

interface LiveApiResponse {
  success?: boolean;
  matches?: ApiFootballFixture[];
  error?: unknown;
}

export default function LiveScoresPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/football/live", {
        cache: "no-store",
      });

      const data: LiveApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : JSON.stringify(data.error) || "Unable to load live matches."
        );
      }

      const apiMatches = data.matches ?? [];

      const formattedMatches: Match[] = apiMatches.map((item) => ({
        id: item.fixture.id,
        league: item.league.name,
        status: "LIVE",
        minute:
          item.fixture.status.elapsed !== null
            ? `${item.fixture.status.elapsed}'`
            : item.fixture.status.short,
        homeTeam: {
          name: item.teams.home.name,
          shortName:
            item.teams.home.code ||
            item.teams.home.name.slice(0, 3).toUpperCase(),
          logo: item.teams.home.logo,
        },
        awayTeam: {
          name: item.teams.away.name,
          shortName:
            item.teams.away.code ||
            item.teams.away.name.slice(0, 3).toUpperCase(),
          logo: item.teams.away.logo,
        },
        homeScore: item.goals.home,
        awayScore: item.goals.away,
      }));

      setMatches(formattedMatches);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading matches."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-400">
            Follow Every Moment
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Live Football Scores
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Follow ongoing football matches and check current
            scores from competitions around the world.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
            <h2 className="text-2xl font-bold">Matches in Progress</h2>
          </div>

          <button
            onClick={() => void loadMatches()}
            disabled={loading}
            className="rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh Scores"}
          </button>
        </div>

        {lastUpdated && (
          <p className="mb-6 text-xs text-slate-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        {loading && matches.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <p className="text-slate-300">
              Loading live football scores...
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
            <h3 className="font-semibold text-red-400">
              Unable to load live scores
            </h3>

            <p className="mt-2 text-sm text-slate-300">{error}</p>

            <button
              onClick={() => void loadMatches()}
              className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && matches.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h3 className="text-xl font-semibold">No Live Matches</h3>

            <p className="mt-2 text-slate-400">
              There are currently no live matches available.
              Check again later.
            </p>
          </div>
        )}

        {matches.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <LiveMatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}