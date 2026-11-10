"use client";

import { useCallback, useEffect, useState } from "react";

import Header from "@/components/Header";
import FixtureCard from "@/components/FixtureCard";
import StandingsTable from "@/components/StandingsTable";
import Footer from "@/components/Footer";

import type { Match } from "@/types/football";

interface LeagueSeason {
  year: number;
  start: string;
  end: string;
  current: boolean;
}

interface League {
  league: {
    id: number;
    name: string;
    type: string;
    logo: string;
  };

  country: {
    name: string;
    code: string | null;
    flag: string | null;
  };

  seasons: LeagueSeason[];
}

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

interface Standing {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string | null;
  description: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

interface LeaguesResponse {
  success: boolean;
  leagues: League[];
  error?: string;
}

interface FixturesResponse {
  success: boolean;
  matches: ApiFixture[];
  error?: string;
}

interface StandingsResponse {
  success: boolean;
  standings: Standing[][];
  error?: string;
}

type LeagueView = "fixtures" | "standings";

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);

  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[][]>([]);

  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState<LeagueView>("standings");

  const [loading, setLoading] = useState(true);
  const [fixturesLoading, setFixturesLoading] = useState(false);
  const [standingsLoading, setStandingsLoading] = useState(false);

  const [error, setError] = useState("");
  const [fixturesError, setFixturesError] = useState("");
  const [standingsError, setStandingsError] = useState("");

  const fetchLeagues = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/football/leagues", {
        cache: "no-store",
      });

      const data: LeaguesResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Unable to load football competitions."
        );
      }

      setLeagues(data.leagues || []);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading leagues."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  async function selectLeague(league: League) {
    setSelectedLeague(league);

    setFixtures([]);
    setStandings([]);

    setFixturesError("");
    setStandingsError("");

    setActiveView("standings");

    const currentSeason =
      league.seasons.find((season) => season.current) ||
      [...league.seasons]
        .filter((season) => season.year <= new Date().getFullYear())
        .sort((a, b) => b.year - a.year)[0];

    if (!currentSeason) {
      setStandingsError("No available season was found for this league.");
      setFixturesError("No available season was found for this league.");
      return;
    }

    const leagueId = league.league.id;
    const season = currentSeason.year;

    // Load fixtures and standings independently.
    setFixturesLoading(true);
    setStandingsLoading(true);

    const fixturesRequest = fetch(
      `/api/football/league-fixtures?league=${leagueId}&season=${season}`,
      { cache: "no-store" }
    )
      .then(async (response) => {
        const data: FixturesResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Unable to retrieve league fixtures."
          );
        }

        const formattedMatches: Match[] = data.matches.map((fixture) => ({
          id: fixture.fixture.id,
          league: fixture.league.name,
          status: "UPCOMING",

          kickoff: new Date(fixture.fixture.date).toLocaleString(
            "en-NG",
            {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Africa/Lagos",
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

        setFixtures(formattedMatches);
      })
      .catch((err: unknown) => {
        setFixturesError(
          err instanceof Error
            ? err.message
            : "Unable to retrieve league fixtures."
        );
      })
      .finally(() => {
        setFixturesLoading(false);
      });

    const standingsRequest = fetch(
      `/api/football/standings?league=${leagueId}&season=${season}`,
      { cache: "no-store" }
    )
      .then(async (response) => {
        const data: StandingsResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Unable to retrieve league standings."
          );
        }

        setStandings(data.standings || []);
      })
      .catch((err: unknown) => {
        setStandingsError(
          err instanceof Error
            ? err.message
            : "Unable to retrieve league standings."
        );
      })
      .finally(() => {
        setStandingsLoading(false);
      });

    await Promise.all([fixturesRequest, standingsRequest]);
  }

  const filteredLeagues = leagues.filter((league) => {
    const searchText = search.toLowerCase();

    return (
      league.league.name.toLowerCase().includes(searchText) ||
      league.country.name.toLowerCase().includes(searchText)
    );
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">

        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-400">
            Explore World Football
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Football Leagues
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Discover football competitions around the world.
            Select a league to explore its standings and upcoming matches.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              Available Competitions
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {filteredLeagues.length} competitions found
            </p>
          </div>

          <button
            onClick={fetchLeagues}
            disabled={loading}
            className="rounded-lg bg-green-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-green-400 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh Leagues"}
          </button>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by league or country..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-green-500"
          />
        </div>

        {loading && (
          <div className="py-16 text-center text-slate-400">
            Loading football competitions...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="mb-4 text-red-400">{error}</p>

            <button
              onClick={fetchLeagues}
              className="rounded-lg bg-red-500 px-5 py-2 font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredLeagues.length === 0 && (
          <div className="rounded-xl border border-slate-800 p-10 text-center">
            <p className="text-slate-400">
              No competitions match your search.
            </p>
          </div>
        )}

        {!loading && !error && filteredLeagues.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLeagues.map((league) => {
              const isSelected =
                selectedLeague?.league.id === league.league.id;

              return (
                <button
                  key={league.league.id}
                  onClick={() => selectLeague(league)}
                  className={`rounded-xl border p-5 text-left transition hover:-translate-y-1 hover:border-green-500 ${
                    isSelected
                      ? "border-green-500 bg-green-500/10"
                      : "border-slate-800 bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-800 p-2">
                      <img
                        src={league.league.logo}
                        alt={`${league.league.name} logo`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold">
                        {league.league.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {league.country.name}
                      </p>

                      <p className="mt-1 text-xs uppercase tracking-wider text-green-400">
                        {league.league.type}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
                    <span className="text-sm text-slate-400">
                      {league.seasons.find((season) => season.current)?.year ||
                        "Season information"}
                    </span>

                    <span className="text-sm font-semibold text-green-400">
                      {isSelected ? "Selected" : "View League →"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selectedLeague && (
          <section className="mt-16 border-t border-slate-800 pt-10">

            <div className="mb-8 flex flex-wrap items-center gap-4">
              <img
                src={selectedLeague.league.logo}
                alt={`${selectedLeague.league.name} logo`}
                className="h-16 w-16 object-contain"
              />

              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
                  Selected Competition
                </p>

                <h2 className="text-3xl font-bold">
                  {selectedLeague.league.name}
                </h2>

                <p className="text-slate-400">
                  {selectedLeague.country.name}
                </p>
              </div>
            </div>

            <div className="mb-8 flex flex-wrap gap-3">
              <button
                onClick={() => setActiveView("standings")}
                className={`rounded-lg px-6 py-3 font-semibold transition ${
                  activeView === "standings"
                    ? "bg-green-500 text-slate-950"
                    : "border border-slate-700 text-slate-300 hover:border-green-500"
                }`}
              >
                League Standings
              </button>

              <button
                onClick={() => setActiveView("fixtures")}
                className={`rounded-lg px-6 py-3 font-semibold transition ${
                  activeView === "fixtures"
                    ? "bg-green-500 text-slate-950"
                    : "border border-slate-700 text-slate-300 hover:border-green-500"
                }`}
              >
                Upcoming Fixtures
              </button>
            </div>

            {activeView === "standings" && (
              <section>
                <h3 className="mb-6 text-2xl font-bold">
                  League Table
                </h3>

                {standingsLoading && (
                  <div className="py-12 text-center text-slate-400">
                    Loading league standings...
                  </div>
                )}

                {!standingsLoading && standingsError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
                    {standingsError}
                  </div>
                )}

                {!standingsLoading && !standingsError && (
                  <StandingsTable groups={standings} />
                )}
              </section>
            )}

            {activeView === "fixtures" && (
              <section>
                <h3 className="mb-6 text-2xl font-bold">
                  Upcoming Matches
                </h3>

                {fixturesLoading && (
                  <div className="py-12 text-center text-slate-400">
                    Loading upcoming matches...
                  </div>
                )}

                {!fixturesLoading && fixturesError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
                    {fixturesError}
                  </div>
                )}

                {!fixturesLoading &&
                  !fixturesError &&
                  fixtures.length === 0 && (
                    <div className="rounded-xl border border-slate-800 p-8 text-center">
                      <p className="text-slate-400">
                        No upcoming matches are currently available for
                        this competition in the next 14 days.
                      </p>
                    </div>
                  )}

                {!fixturesLoading &&
                  !fixturesError &&
                  fixtures.length > 0 && (
                    <div className="space-y-4">
                      {fixtures.map((match) => (
                        <FixtureCard
                          key={match.id}
                          match={match}
                        />
                      ))}
                    </div>
                  )}
              </section>
            )}

          </section>
        )}

      </section>

      <Footer />
    </main>
  );
}