"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiveMatchCard from "@/components/LiveMatchCard";
import FixtureCard from "@/components/FixtureCard";

import type { Match } from "@/types/football";

// API-Football live fixture response structure.
interface ApiLiveFixture {
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

// API-Football upcoming fixture response structure.
interface ApiUpcomingFixture {
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

interface ApiResponse<T> {
  success?: boolean;
  matches?: T[];
  error?: unknown;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error) {
    return JSON.stringify(error);
  }

  return "Unable to retrieve football data.";
}

function formatKickoff(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(date));
}

export default function HomePage() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);

  const [liveLoading, setLiveLoading] = useState(true);
  const [fixturesLoading, setFixturesLoading] = useState(true);

  const [liveError, setLiveError] = useState("");
  const [fixturesError, setFixturesError] = useState("");

  // Retrieve live football scores.
  const loadLiveMatches = useCallback(async () => {
    try {
      setLiveLoading(true);
      setLiveError("");

      const response = await fetch("/api/football/live", {
        cache: "no-store",
      });

      const data: ApiResponse<ApiLiveFixture> =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data.error)
        );
      }

      const formattedMatches: Match[] = (
        data.matches || []
      ).map((item) => ({
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

      setLiveMatches(formattedMatches);
    } catch (error) {
      setLiveError(
        error instanceof Error
          ? error.message
          : "Unable to load live matches."
      );
    } finally {
      setLiveLoading(false);
    }
  }, []);

  // Retrieve today's scheduled fixtures.
  const loadUpcomingMatches = useCallback(async () => {
    try {
      setFixturesLoading(true);
      setFixturesError("");

      const response = await fetch("/api/football/fixtures", {
        cache: "no-store",
      });

      const data: ApiResponse<ApiUpcomingFixture> =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data.error)
        );
      }

      const formattedMatches: Match[] = (
        data.matches || []
      ).map((item) => ({
        id: item.fixture.id,
        league: item.league.name,
        status: "UPCOMING",

        kickoff: formatKickoff(item.fixture.date),

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

        homeScore: null,
        awayScore: null,
      }));

      setUpcomingMatches(formattedMatches);
    } catch (error) {
      setFixturesError(
        error instanceof Error
          ? error.message
          : "Unable to load upcoming fixtures."
      );
    } finally {
      setFixturesLoading(false);
    }
  }, []);

  // Load both sections when the homepage opens.
  useEffect(() => {
    void loadLiveMatches();
    void loadUpcomingMatches();
  }, [loadLiveMatches, loadUpcomingMatches]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-br from-green-950 via-slate-950 to-slate-950">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">

          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-green-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              Your Football World
            </div>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              Every Match.
              <br />
              Every Goal.
              <br />
              <span className="text-green-400">
                Every Moment.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 md:text-lg">
              Stay connected to the beautiful game. Follow live
              football scores, discover upcoming fixtures, explore
              competitions and keep track of your favourite teams.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/live"
                className="rounded-xl bg-green-500 px-7 py-4 font-bold text-slate-950 transition hover:bg-green-400"
              >
                Explore Live Scores →
              </Link>

              <Link
                href="/fixtures"
                className="rounded-xl border border-slate-600 px-7 py-4 font-bold text-white transition hover:border-green-500 hover:text-green-400"
              >
                View Fixtures
              </Link>
            </div>
          </div>

          {/* DASHBOARD SUMMARY */}
          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-2xl border border-green-500/20 bg-slate-900/80 p-7">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Live Matches
                </span>
              </div>

              <p className="text-5xl font-black text-green-400">
                {liveLoading ? "..." : liveError ? "—" : liveMatches.length}
              </p>

              <p className="mt-3 text-sm text-slate-400">
                Matches currently in progress
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-7">
              <div className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">
                Today's Fixtures
              </div>

              <p className="text-5xl font-black text-white">
                {fixturesLoading
                  ? "..."
                  : fixturesError
                    ? "—"
                    : upcomingMatches.length}
              </p>

              <p className="mt-3 text-sm text-slate-400">
                Scheduled matches today
              </p>
            </div>

            <Link
              href="/teams"
              className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 transition hover:border-green-500"
            >
              <p className="text-3xl">⚽</p>
              <h3 className="mt-4 font-bold">Explore Teams</h3>
              <p className="mt-2 text-sm text-slate-400">
                Discover clubs and national teams.
              </p>
            </Link>

            <Link
              href="/leagues"
              className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 transition hover:border-green-500"
            >
              <p className="text-3xl">🏆</p>
              <h3 className="mt-4 font-bold">Explore Leagues</h3>
              <p className="mt-2 text-sm text-slate-400">
                Follow competitions and standings.
              </p>
            </Link>

          </div>
        </div>
      </section>

      {/* LIVE MATCHES */}
      <section className="mx-auto max-w-7xl px-6 py-16">

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />

              <p className="text-xs font-bold uppercase tracking-widest text-green-400">
                Follow the Action
              </p>
            </div>

            <h2 className="text-3xl font-black md:text-4xl">
              Live Matches
            </h2>

            <p className="mt-2 text-slate-400">
              Real-time football scores from ongoing matches.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void loadLiveMatches()}
              disabled={liveLoading}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold transition hover:border-green-500 disabled:opacity-50"
            >
              {liveLoading ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              href="/live"
              className="rounded-lg bg-green-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-green-400"
            >
              All Live Scores →
            </Link>
          </div>
        </div>

        {liveLoading && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <p className="text-slate-400">
              Loading live football scores...
            </p>
          </div>
        )}

        {!liveLoading && liveError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
            <h3 className="font-bold text-red-400">
              Unable to load live matches
            </h3>

            <p className="mt-2 text-sm text-slate-300">
              {liveError}
            </p>

            <button
              type="button"
              onClick={() => void loadLiveMatches()}
              className="mt-4 rounded-lg bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
            >
              Try Again
            </button>
          </div>
        )}

        {!liveLoading && !liveError && liveMatches.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <p className="text-4xl">⚽</p>

            <h3 className="mt-4 text-xl font-bold">
              No Live Matches Right Now
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              There are currently no live matches available.
              Check back when the next games begin.
            </p>
          </div>
        )}

        {!liveLoading && liveMatches.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {liveMatches.slice(0, 6).map((match) => (
              <LiveMatchCard
                key={match.id}
                match={match}
              />
            ))}
          </div>
        )}
      </section>

      {/* UPCOMING FIXTURES */}
      <section className="border-y border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6 py-16">

          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-green-400">
                Plan Your Football Experience
              </p>

              <h2 className="text-3xl font-black md:text-4xl">
                Today's Fixtures
              </h2>

              <p className="mt-2 text-slate-400">
                Discover today's scheduled football matches.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void loadUpcomingMatches()}
                disabled={fixturesLoading}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold transition hover:border-green-500 disabled:opacity-50"
              >
                {fixturesLoading ? "Refreshing..." : "Refresh"}
              </button>

              <Link
                href="/fixtures"
                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-green-400"
              >
                All Fixtures →
              </Link>
            </div>
          </div>

          {fixturesLoading && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
              <p className="text-slate-400">
                Loading today's fixtures...
              </p>
            </div>
          )}

          {!fixturesLoading && fixturesError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
              <h3 className="font-bold text-red-400">
                Unable to load fixtures
              </h3>

              <p className="mt-2 text-sm text-slate-300">
                {fixturesError}
              </p>

              <button
                type="button"
                onClick={() => void loadUpcomingMatches()}
                className="mt-4 rounded-lg bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                Try Again
              </button>
            </div>
          )}

          {!fixturesLoading &&
            !fixturesError &&
            upcomingMatches.length === 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
                <p className="text-4xl">📅</p>

                <h3 className="mt-4 text-xl font-bold">
                  No Upcoming Fixtures
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  No scheduled matches are currently available
                  for today.
                </p>
              </div>
            )}

          {!fixturesLoading &&
            !fixturesError &&
            upcomingMatches.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                {upcomingMatches.slice(0, 8).map((match) => (
                  <FixtureCard
                    key={match.id}
                    match={match}
                  />
                ))}
              </div>
            )}
        </div>
      </section>

      {/* DISCOVER MORE */}
      <section className="mx-auto max-w-7xl px-6 py-16">

        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-green-400">
            Explore More
          </p>

          <h2 className="text-3xl font-black md:text-4xl">
            Your Football Hub
          </h2>

          <p className="mt-3 max-w-2xl text-slate-400">
            Everything you need to stay connected to football,
            all in one place.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          <Link
            href="/search"
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-green-500"
          >
            <p className="text-3xl">🔎</p>
            <h3 className="mt-5 text-lg font-bold">
              Global Search
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Search for football teams, leagues and matches.
            </p>
          </Link>

          <Link
            href="/leagues"
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-green-500"
          >
            <p className="text-3xl">🏆</p>
            <h3 className="mt-5 text-lg font-bold">
              Competitions
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Explore football leagues and their standings.
            </p>
          </Link>

          <Link
            href="/teams"
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-green-500"
          >
            <p className="text-3xl">⚽</p>
            <h3 className="mt-5 text-lg font-bold">
              Teams Directory
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Discover football clubs and national teams.
            </p>
          </Link>

          <Link
            href="/favourites"
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-green-500"
          >
            <p className="text-3xl">♥</p>
            <h3 className="mt-5 text-lg font-bold">
              Favourites
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Keep your favourite teams close.
            </p>
          </Link>

        </div>
      </section>

      {/* BRAND MESSAGE */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-2xl border border-green-500/20 bg-gradient-to-r from-green-950 to-slate-900 p-8 md:p-12">
          <h2 className="text-3xl font-black md:text-4xl">
            Football Is More Than a Game.
          </h2>

          <p className="mt-4 max-w-2xl leading-8 text-slate-300">
            From the first whistle to the final score, LiveScore by
            Cheke brings you closer to the matches, clubs and
            competitions that make football special.
          </p>

          <p className="mt-6 text-sm font-black tracking-widest text-green-400">
            LIVE SCORE BY CHEKE
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}