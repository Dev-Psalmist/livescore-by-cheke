"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

type SearchType = "all" | "teams" | "leagues" | "matches";

interface TeamResult {
  team: {
    id: number;
    name: string;
    logo: string;
    country: string | null;
    code: string | null;
    national: boolean;
  };
  venue?: {
    name: string | null;
    city: string | null;
  };
}

interface LeagueResult {
  league: {
    id: number;
    name: string;
    type: string;
    logo: string;
  };
  country: {
    name: string;
    flag: string | null;
  };
  seasons?: {
    year: number;
    current: boolean;
  }[];
}

interface MatchResult {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      long: string;
      elapsed: number | null;
    };
  };
  league: {
    name: string;
    country: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

interface SearchResponse {
  success: boolean;
  error?: string;
  teams?: TeamResult[];
  leagues?: LeagueResult[];
  matches?: MatchResult[];
  matchedTeam?: TeamResult | null;
}

const categories: {
  id: SearchType;
  label: string;
}[] = [
  { id: "all", label: "All Results" },
  { id: "teams", label: "Teams" },
  { id: "leagues", label: "Leagues" },
  { id: "matches", label: "Matches" },
];

function formatMatchDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(new Date(date));
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchType>("all");

  const [teams, setTeams] = useState<TeamResult[]>([]);
  const [leagues, setLeagues] = useState<LeagueResult[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [matchedTeam, setMatchedTeam] =
    useState<TeamResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const searchTerm = query.trim();

    if (searchTerm.length < 3) {
      setError("Enter at least three characters to search.");
      setSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(false);

      setTeams([]);
      setLeagues([]);
      setMatches([]);
      setMatchedTeam(null);

      const response = await fetch(
        `/api/football/search?type=${category}&query=${encodeURIComponent(searchTerm)}`,
        { cache: "no-store" }
      );

      const data: SearchResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to complete your search."
        );
      }

      setTeams(data.teams || []);
      setLeagues(data.leagues || []);
      setMatches(data.matches || []);
      setMatchedTeam(data.matchedTeam || null);

      setSearched(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while searching."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-400">
            Discover Football
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Global Search
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-400">
            Find football teams, leagues and match results from
            around the world.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
          <form onSubmit={handleSearch}>
            <label
              htmlFor="global-search"
              className="mb-3 block text-sm font-semibold text-slate-300"
            >
              What are you looking for?
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="global-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Arsenal, Premier League..."
                className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-green-500"
              />

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-green-500 px-8 py-4 font-bold text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                    category === item.id
                      ? "bg-green-500 text-slate-950"
                      : "border border-slate-700 text-slate-300 hover:border-green-500 hover:text-green-400"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Enter at least three characters. Match searches find
              the latest 10 fixtures for the matching team in the
              current season.
            </p>
          </form>
        </section>

        {loading && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-green-400" />
            <p className="text-slate-400">
              Searching football data...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="font-medium text-red-400">{error}</p>
          </div>
        )}

        {!loading && searched && !error && (
          <div className="mt-10 space-y-12">
            {(category === "all" || category === "teams") && (
              <section>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Teams</h2>
                  <span className="text-sm text-slate-400">
                    {teams.length} found
                  </span>
                </div>

                {teams.length === 0 ? (
                  <p className="rounded-xl border border-slate-800 p-6 text-slate-400">
                    No matching teams found.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {teams.map((item) => (
                      <article
                        key={item.team.id}
                        className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5"
                      >
                        {item.team.logo ? (
                          <img
                            src={item.team.logo}
                            alt={`${item.team.name} logo`}
                            className="h-14 w-14 object-contain"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-800 font-bold text-green-400">
                            {item.team.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="font-bold">
                            {item.team.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-400">
                            {item.team.country || "Country unavailable"}
                          </p>
                          {item.team.national && (
                            <span className="mt-1 inline-block text-xs text-green-400">
                              National team
                            </span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {(category === "all" || category === "leagues") && (
              <section>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Leagues</h2>
                  <span className="text-sm text-slate-400">
                    {leagues.length} found
                  </span>
                </div>

                {leagues.length === 0 ? (
                  <p className="rounded-xl border border-slate-800 p-6 text-slate-400">
                    No matching leagues found.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {leagues.map((item) => (
                      <article
                        key={item.league.id}
                        className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5"
                      >
                        {item.league.logo ? (
                          <img
                            src={item.league.logo}
                            alt={`${item.league.name} logo`}
                            className="h-14 w-14 object-contain"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-800 font-bold text-green-400">
                            L
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="font-bold">
                            {item.league.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-400">
                            {item.country?.name || "Country unavailable"}
                          </p>
                          <p className="mt-1 text-xs text-green-400">
                            {item.league.type}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {category === "matches" && (
              <section>
                <div className="mb-5">
                  <h2 className="text-2xl font-bold">
                    Match Results
                  </h2>

                  {matchedTeam && (
                    <p className="mt-2 text-sm text-slate-400">
                      Showing recent fixtures for{" "}
                      <span className="font-semibold text-green-400">
                        {matchedTeam.team.name}
                      </span>
                    </p>
                  )}
                </div>

                {matches.length === 0 ? (
                  <p className="rounded-xl border border-slate-800 p-6 text-slate-400">
                    No recent fixtures were found for this team.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {matches.map((match) => (
                      <Link
                        key={match.fixture.id}
                        href={`/match/${match.fixture.id}`}
                        className="block rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-green-500"
                      >
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                          <span>
                            {match.league.name} · {match.league.country}
                          </span>
                          <span>
                            {formatMatchDate(match.fixture.date)}
                          </span>
                        </div>

                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={match.teams.home.logo}
                              alt=""
                              className="h-8 w-8 object-contain"
                            />
                            <span className="text-sm font-semibold">
                              {match.teams.home.name}
                            </span>
                          </div>

                          <div className="text-center">
                            <p className="text-xl font-extrabold">
                              {match.goals.home ?? "-"} :{" "}
                              {match.goals.away ?? "-"}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {match.fixture.status.long}
                            </p>
                          </div>

                          <div className="flex items-center justify-end gap-2 text-right">
                            <span className="text-sm font-semibold">
                              {match.teams.away.name}
                            </span>
                            <img
                              src={match.teams.away.logo}
                              alt=""
                              className="h-8 w-8 object-contain"
                            />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {!loading && !searched && !error && (
          <div className="mt-10 rounded-xl border border-dashed border-slate-800 p-12 text-center">
            <h2 className="text-xl font-semibold">
              Search the World of Football
            </h2>
            <p className="mt-2 text-slate-400">
              Find teams, competitions and recent matches in one place.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}