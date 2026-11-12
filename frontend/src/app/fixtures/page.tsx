"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

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
      id: number;
      name: string;
      code: string | null;
      logo: string;
    };

    away: {
      id: number;
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

      const formattedMatches: Match[] = (data.matches ?? []).map(
        (fixture) => ({
          id: fixture.fixture.id,
          league: fixture.league.name,
          status: "UPCOMING",

          kickoff: new Date(fixture.fixture.date).toLocaleString(
            "en-GB",
            {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Africa/Lagos",
            }
          ),

          homeTeam: {
            id: fixture.teams.home.id,
            name: fixture.teams.home.name,
            shortName:
              fixture.teams.home.code ||
              fixture.teams.home.name.substring(0, 3).toUpperCase(),
            logo: fixture.teams.home.logo,
          },

          awayTeam: {
            id: fixture.teams.away.id,
            name: fixture.teams.away.name,
            shortName:
              fixture.teams.away.code ||
              fixture.teams.away.name.substring(0, 3).toUpperCase(),
            logo: fixture.teams.away.logo,
          },

          homeScore: null,
          awayScore: null,
        })
      );

      setMatches(formattedMatches);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading fixtures."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFixtures();
  }, [fetchFixtures]);

  const competitions = useMemo(
    () => [...new Set(matches.map((match) => match.league))],
    [matches]
  );

  const nextFixture = matches[0];

  return (
    <main className="min-h-screen bg-[#0b1118] text-white">
      <Header />

      <div className="mx-auto max-w-[1500px] px-3 py-6 sm:px-5 sm:py-9 lg:px-6">

        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-[#12372e] via-[#172b2b] to-[#141e29] p-6 sm:p-9">

          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-emerald-300/[0.05]" />

          <div className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-emerald-400/[0.05] blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.17em] text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Match Schedule Centre
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                Upcoming Fixtures
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                Every match starts somewhere. Explore upcoming football
                fixtures, follow your favourite competitions and get ready
                for the next big moment.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/live"
                  className="rounded-lg bg-emerald-400 px-5 py-3 text-xs font-black text-[#07130e] transition hover:bg-emerald-300"
                >
                  Watch Live Scores →
                </Link>

                <Link
                  href="/leagues"
                  className="rounded-lg border border-white/15 bg-white/[0.04] px-5 py-3 text-xs font-bold text-white transition hover:border-emerald-400/50"
                >
                  Explore Competitions
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                Fixtures Available
              </p>

              <p className="mt-3 text-5xl font-black">
                {loading && matches.length === 0
                  ? "..."
                  : error
                    ? "—"
                    : matches.length}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Scheduled matches
              </p>

              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Competitions
                </p>

                <p className="mt-1 text-xl font-black text-emerald-400">
                  {loading && matches.length === 0
                    ? "..."
                    : error
                      ? "—"
                      : competitions.length}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* QUICK SUMMARY */}
        <section className="mt-6 grid gap-3 sm:grid-cols-3">

          <div className="rounded-xl border border-white/[0.07] bg-[#141e29] p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Total Fixtures
            </p>

            <p className="mt-2 text-2xl font-black text-white">
              {loading && matches.length === 0
                ? "..."
                : error
                  ? "—"
                  : matches.length}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#141e29] p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Competitions
            </p>

            <p className="mt-2 text-2xl font-black text-emerald-400">
              {loading && matches.length === 0
                ? "..."
                : error
                  ? "—"
                  : competitions.length}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#141e29] p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Next Match
            </p>

            <p className="mt-2 truncate text-sm font-black text-white">
              {loading
                ? "Loading fixtures..."
                : error
                  ? "Unavailable"
                  : nextFixture
                    ? `${nextFixture.homeTeam.shortName} vs ${nextFixture.awayTeam.shortName}`
                    : "No scheduled matches"}
            </p>
          </div>

        </section>

        {/* FIXTURES LIST */}
        <section className="mt-8 overflow-hidden rounded-xl border border-white/[0.07] bg-[#141e29]">

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] p-4 sm:p-6">

            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-400">
                  Coming Up
                </p>
              </div>

              <h2 className="mt-2 text-xl font-black sm:text-2xl">
                Scheduled Matches
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Upcoming football matches and kickoff times.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void fetchFixtures()}
              disabled={loading}
              className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-xs font-black text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {loading ? "Updating Fixtures..." : "↻ Refresh Fixtures"}
            </button>

          </div>

          <div className="p-4 sm:p-6">

            {loading && matches.length === 0 && (
              <div className="rounded-xl bg-[#0e1721] p-10 text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/20 border-t-emerald-400" />

                <p className="text-sm text-slate-400">
                  Loading upcoming fixtures...
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
                <h3 className="font-bold text-red-400">
                  Unable to load fixtures
                </h3>

                <p className="mt-2 break-words text-sm text-slate-300">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => void fetchFixtures()}
                  className="mt-4 rounded-lg bg-red-500 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-red-400"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && matches.length === 0 && (
              <div className="rounded-xl bg-[#0e1721] p-10 text-center">
                <p className="text-4xl">⚽</p>

                <h3 className="mt-4 text-lg font-black">
                  No Upcoming Fixtures
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  There are currently no scheduled matches available.
                  Check again later for updated fixtures.
                </p>

                <button
                  type="button"
                  onClick={() => void fetchFixtures()}
                  className="mt-5 rounded-lg border border-white/10 px-5 py-2.5 text-xs font-bold text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-400"
                >
                  Check Again
                </button>
              </div>
            )}

            {matches.length > 0 && (
              <div className="space-y-3">
                {matches.map((match) => (
                  <FixtureCard
                    key={match.id}
                    match={match}
                  />
                ))}
              </div>
            )}

          </div>
        </section>

        {/* ACTIVE COMPETITIONS */}
        {competitions.length > 0 && (
          <section className="mt-6 rounded-xl border border-white/[0.07] bg-[#141e29] p-5 sm:p-6">

            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black">
                  Featured Competitions
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Competitions represented in the current fixture list.
                </p>
              </div>

              <Link
                href="/leagues"
                className="text-xs font-bold text-emerald-400 transition hover:text-emerald-300"
              >
                View All →
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {competitions.map((competition) => (
                <span
                  key={competition}
                  className="rounded-lg border border-white/[0.07] bg-[#0e1721] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-500/30 hover:text-emerald-400"
                >
                  {competition}
                </span>
              ))}
            </div>

          </section>
        )}

        {/* BOTTOM NAVIGATION */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            LiveScore by Cheke · Every sport. Every moment.
          </p>

          <Link
            href="/"
            className="text-xs font-bold text-emerald-400 transition hover:text-emerald-300"
          >
            ← Back to Home
          </Link>
        </div>

      </div>

      <Footer />
    </main>
  );
}