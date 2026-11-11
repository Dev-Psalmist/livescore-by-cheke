"use client";

import { FormEvent, useState } from "react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface FootballTeam {
  team: {
    id: number;
    name: string;
    code: string | null;
    country: string | null;
    founded: number | null;
    national: boolean;
    logo: string;
  };

  venue: {
    name: string | null;
    city: string | null;
    capacity: number | null;
    image: string | null;
  };
}

interface TeamsResponse {
  success: boolean;
  teams: FootballTeam[];
  error?: string;
}

export default function TeamsPage() {
  const [search, setSearch] = useState("");
  const [teams, setTeams] = useState<FootballTeam[]>([]);

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function searchTeams(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const searchTerm = search.trim();

    if (searchTerm.length < 3) {
      setError("Enter at least three characters to search.");
      setTeams([]);
      setSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setTeams([]);
      setSearched(false);

      const response = await fetch(
        `/api/football/teams?search=${encodeURIComponent(searchTerm)}`,
        {
          cache: "no-store",
        }
      );

      const data: TeamsResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to retrieve football teams."
        );
      }

      setTeams(data.teams || []);
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
            Explore World Football
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Football Teams
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-400">
            Discover football clubs and national teams from around
            the world. Search for a team to explore its information.
          </p>
        </div>

        <section className="mb-12 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
          <h2 className="mb-2 text-2xl font-bold">
            Find a Team
          </h2>

          <p className="mb-6 text-sm text-slate-400">
            Enter at least three characters of a team name.
          </p>

          <form
            onSubmit={searchTeams}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search teams, e.g. Arsenal..."
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-5 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-green-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-green-500 px-8 py-4 font-bold text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search Teams"}
            </button>
          </form>
        </section>

        {loading && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-green-400" />

            <p className="text-slate-400">
              Searching football teams...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {!loading && searched && !error && teams.length === 0 && (
          <div className="rounded-xl border border-slate-800 p-10 text-center">
            <h3 className="text-xl font-semibold">
              No Teams Found
            </h3>

            <p className="mt-2 text-slate-400">
              No teams matched your search. Try another team name.
            </p>
          </div>
        )}

        {!loading && teams.length > 0 && (
          <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">
                  Search Results
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {teams.length} team{teams.length === 1 ? "" : "s"} found
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((item) => (
                <article
                  key={item.team.id}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-green-500"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-800 p-3">
                      {item.team.logo ? (
                        <img
                          src={item.team.logo}
                          alt={`${item.team.name} logo`}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-green-400">
                          {item.team.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-lg font-bold">
                        {item.team.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {item.team.country || "Country unavailable"}
                      </p>

                      {item.team.national && (
                        <span className="mt-2 inline-block rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                          National Team
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 border-t border-slate-800 pt-5">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-slate-500">
                        Team Code
                      </span>

                      <span className="font-medium">
                        {item.team.code || "Unavailable"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-slate-500">
                        Founded
                      </span>

                      <span className="font-medium">
                        {item.team.founded || "Unavailable"}
                      </span>
                    </div>

                    <div className="border-t border-slate-800 pt-3">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-green-400">
                        Home Venue
                      </p>

                      <p className="text-sm font-medium">
                        {item.venue.name || "Venue unavailable"}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {item.venue.city || "City unavailable"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {!loading && !searched && !error && (
          <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center">
            <h3 className="text-xl font-semibold">
              Discover Football Teams
            </h3>

            <p className="mt-2 text-slate-400">
              Search for your favourite club or national team to
              get started.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}