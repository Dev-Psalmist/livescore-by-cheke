"use client";

import { useCallback, useEffect, useState } from "react";

import Header from "@/components/Header";
import FixtureCard from "@/components/FixtureCard";
import Footer from "@/components/Footer";

import type { Match } from "@/types/football";

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
  };

  league: {
    name: string;
  };

  teams: {
    home: {
      name: string;
      code: string | null;
      logo: string;
    };

    away: {
      name: string;
      code: string | null;
      logo: string;
    };
  };
}

interface FixturesResponse {
  success: boolean;
  matches: ApiFixture[];
  error?: string;
}

export default function FixturesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFixtures = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/football/fixtures", {
        cache: "no-store",
      });

      const data: FixturesResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Unable to load upcoming fixtures."
        );
      }

      const formattedMatches: Match[] = data.matches.map((fixture) => ({
        id: fixture.fixture.id,
        league: fixture.league.name,
        status: "UPCOMING",

        kickoff: new Date(fixture.fixture.date).toLocaleString(
          undefined,
          {
            dateStyle: "medium",
            timeStyle: "short",
          }
        ),

        homeTeam: {
          name: fixture.teams.home.name,
          shortName:
            fixture.teams.home.code ||
            fixture.teams.home.name.substring(0, 3).toUpperCase(),
          logo: fixture.teams.home.logo,
        },

        awayTeam: {
          name: fixture.teams.away.name,
          shortName:
            fixture.teams.away.code ||
            fixture.teams.away.name.substring(0, 3).toUpperCase(),
          logo: fixture.teams.away.logo,
        },

        homeScore: null,
        awayScore: null,
      }));

      setMatches(formattedMatches);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFixtures();
  }, [fetchFixtures]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">

        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-400">
            Plan Your Football Experience
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            Upcoming Fixtures
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Stay ahead of the action. Explore upcoming football matches
            and their scheduled kickoff times.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold sm:text-2xl">
            Scheduled Matches
          </h2>

          <button
            onClick={fetchFixtures}
            disabled={loading}
            className="w-full rounded-lg bg-green-500 px-5 py-3 font-semibold sm:w-auto text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Fixtures"}
          </button>
        </div>

        {loading && (
          <div className="py-16 text-center text-slate-400">
            Loading upcoming fixtures...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="mb-4 text-red-400">{error}</p>

            <button
              onClick={fetchFixtures}
              className="rounded-lg bg-red-500 px-5 py-2 font-semibold text-white hover:bg-red-400"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && matches.length === 0 && (
          <div className="rounded-xl border border-slate-800 p-6 text-center sm:p-10">
            <h3 className="text-xl font-semibold">
              No Upcoming Fixtures
            </h3>

            <p className="mt-2 text-slate-400">
              There are currently no upcoming fixtures available.
            </p>
          </div>
        )}

        {!loading && !error && matches.length > 0 && (
          <div className="space-y-4">
            {matches.map((match) => (
              <FixtureCard
                key={match.id}
                match={match}
              />
            ))}
          </div>
        )}

      </section>

      <Footer />
    </main>
  );
}