"use client";

import { useCallback, useEffect, useState } from "react";

import Header from "@/components/Header";
import LiveMatchCard from "@/components/LiveMatchCard";
import FixtureCard from "@/components/FixtureCard";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

import type { Match } from "@/types/football";

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
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
      logo: string;
    };

    away: {
      name: string;
      code: string | null;
      logo: string;
    };
  };

  goals: {
    home: number | null;
    away: number | null;
  };
}

interface ApiResponse {
  success: boolean;
  matches: ApiFixture[];
  error?: string;
}

function formatMatch(fixture: ApiFixture, isLive: boolean): Match {
  return {
    id: fixture.fixture.id,
    league: fixture.league.name,
    status: isLive ? "LIVE" : "UPCOMING",

    minute: isLive
      ? fixture.fixture.status.elapsed !== null
        ? `${fixture.fixture.status.elapsed}'`
        : fixture.fixture.status.short
      : undefined,

    kickoff: isLive
      ? undefined
      : new Date(fixture.fixture.date).toLocaleString(
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

    homeScore: isLive ? fixture.goals.home : null,
    awayScore: isLive ? fixture.goals.away : null,
  };
}

export default function Home() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHomepageData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [liveResponse, fixturesResponse] = await Promise.all([
        fetch("/api/football/live", { cache: "no-store" }),
        fetch("/api/football/fixtures", { cache: "no-store" }),
      ]);

      const liveData: ApiResponse = await liveResponse.json();
      const fixturesData: ApiResponse = await fixturesResponse.json();

      if (!liveResponse.ok || !liveData.success) {
        throw new Error("Unable to retrieve live match information.");
      }

      if (!fixturesResponse.ok || !fixturesData.success) {
        throw new Error("Unable to retrieve upcoming fixtures.");
      }

      setLiveMatches(
        liveData.matches.map((fixture) => formatMatch(fixture, true))
      );

      setUpcomingMatches(
        fixturesData.matches
          .slice(0, 10)
          .map((fixture) => formatMatch(fixture, false))
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading football data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomepageData();
  }, [fetchHomepageData]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">

        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-400">
            Every Match. Every Moment.
          </p>

          <h1 className="text-4xl font-bold md:text-6xl">
            Football Lives Here.
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Follow live football scores, upcoming fixtures, and results
            from competitions around the world.
          </p>
        </div>

        <div className="mb-8 flex justify-end">
          <button
            onClick={fetchHomepageData}
            disabled={loading}
            className="rounded-lg bg-green-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-green-400 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Refresh Scores"}
          </button>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-400">
            {error}
          </div>
        )}

        {loading && (
          <div className="py-10 text-center text-slate-400">
            Loading football information...
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

            <div className="space-y-10 lg:col-span-2">

              <section>
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />

                  <h2 className="text-2xl font-bold">
                    Live Matches
                  </h2>
                </div>

                {liveMatches.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {liveMatches.slice(0, 10).map((match) => (
                      <LiveMatchCard
                        key={match.id}
                        match={match}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 p-8 text-center">
                    <p className="text-slate-400">
                      There are currently no live matches.
                    </p>
                  </div>
                )}
              </section>

              <section>
                <h2 className="mb-5 text-2xl font-bold">
                  Upcoming Fixtures
                </h2>

                {upcomingMatches.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingMatches.map((match) => (
                      <FixtureCard
                        key={match.id}
                        match={match}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 p-8 text-center">
                    <p className="text-slate-400">
                      No upcoming fixtures are currently available.
                    </p>
                  </div>
                )}
              </section>

            </div>

            <aside>
              <Sidebar />
            </aside>

          </div>
        )}

      </section>

      <Footer />
    </main>
  );
}