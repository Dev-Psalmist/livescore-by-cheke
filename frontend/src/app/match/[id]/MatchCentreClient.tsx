"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface MatchDetails {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
      extra: number | null;
    };
    venue: {
      name: string | null;
      city: string | null;
    };
  };

  league: {
    name: string;
    country: string;
    logo: string;
    round: string;
  };

  teams: {
    home: {
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };

  goals: {
    home: number | null;
    away: number | null;
  };

  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
  };

  events: Array<{
    time: {
      elapsed: number;
      extra: number | null;
    };
    team: {
      name: string;
    };
    player: {
      name: string;
    };
    assist: {
      name: string | null;
    };
    type: string;
    detail: string;
    comments: string | null;
  }>;

  lineups: Array<{
    team: {
      name: string;
      logo: string;
    };
    formation: string;
    startXI: Array<{
      player: {
        id: number;
        name: string;
        number: number;
        pos: string;
      };
    }>;
    substitutes: Array<{
      player: {
        id: number;
        name: string;
        number: number;
        pos: string;
      };
    }>;
  }>;

  statistics: Array<{
    team: {
      name: string;
    };
    statistics: Array<{
      type: string;
      value: string | number | null;
    }>;
  }>;
}

interface MatchCentreClientProps {
  id: string;
}

export default function MatchCentreClient({
  id,
}: MatchCentreClientProps) {

  const [match, setMatch] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("events");

  async function loadMatch() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/football/match?id=${id}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Unable to load match information."
        );
      }

      setMatch(data.match);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadMatch();
    }
  }, [id]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-NG", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Africa/Lagos",
    });
  };

  const getMatchTime = () => {
    if (!match) return "";

    const status = match.fixture.status;

    if (status.elapsed !== null) {
      return `${status.elapsed}'${status.extra ? ` + ${status.extra}` : ""}`;
    }

    return status.long;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#08111e] text-white">
        <Header />

        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            <p className="text-gray-400">
              Loading match information...
            </p>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  if (error || !match) {
    return (
      <main className="min-h-screen bg-[#08111e] text-white">
        <Header />

        <div className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="mb-4 text-2xl font-bold">
            Match Information Unavailable
          </h1>

          <p className="mb-8 text-gray-400">
            {error || "We could not find this match."}
          </p>

          <Link
            href="/"
            className="rounded-lg bg-green-500 px-6 py-3 font-bold text-black"
          >
            Return Home
          </Link>
        </div>

        <Footer />
      </main>
    );
  }

  const isLive = match.fixture.status.elapsed !== null;

  return (
    <main className="min-h-screen bg-[#08111e] text-white">
      <Header />

      <div className="mx-auto max-w-6xl px-5 py-10">

        {/* Back Navigation */}

        <Link
          href="/"
          className="mb-8 inline-block text-sm text-green-400 hover:text-green-300"
        >
          ← Back to LiveScore
        </Link>

        {/* Match Information */}

        <section className="mb-8 rounded-2xl border border-white/10 bg-[#111c2b] p-6 md:p-10">

          <div className="mb-8 text-center">
            <p className="text-sm font-bold text-green-400">
              {match.league.name}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {match.league.country} · {match.league.round}
            </p>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">

            {/* Home Team */}

            <div className="text-center">
              <img
                src={match.teams.home.logo}
                alt={match.teams.home.name}
                className="mx-auto mb-4 h-16 w-16 object-contain md:h-24 md:w-24"
              />

              <h2 className="text-sm font-bold md:text-xl">
                {match.teams.home.name}
              </h2>

              {match.teams.home.winner && (
                <span className="mt-2 inline-block text-xs text-green-400">
                  WINNER
                </span>
              )}
            </div>

            {/* Score */}

            <div className="text-center">
              <div className="text-4xl font-black md:text-6xl">
                {match.goals.home ?? "-"}
                <span className="mx-2 text-gray-500">:</span>
                {match.goals.away ?? "-"}
              </div>

              <p className="mt-3 text-sm font-bold text-green-400">
                {isLive ? getMatchTime() : match.fixture.status.long}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                {formatDate(match.fixture.date)}
              </p>
            </div>

            {/* Away Team */}

            <div className="text-center">
              <img
                src={match.teams.away.logo}
                alt={match.teams.away.name}
                className="mx-auto mb-4 h-16 w-16 object-contain md:h-24 md:w-24"
              />

              <h2 className="text-sm font-bold md:text-xl">
                {match.teams.away.name}
              </h2>

              {match.teams.away.winner && (
                <span className="mt-2 inline-block text-xs text-green-400">
                  WINNER
                </span>
              )}
            </div>

          </div>

          <div className="mt-8 border-t border-white/10 pt-5 text-center text-xs text-gray-400">
            {match.fixture.venue.name || "Venue unavailable"}
            {match.fixture.venue.city
              ? ` · ${match.fixture.venue.city}`
              : ""}
          </div>

          <div className="mt-4 text-center text-sm text-gray-400">
            Half-time: {match.score.halftime.home ?? "-"} :{" "}
            {match.score.halftime.away ?? "-"}
          </div>

        </section>

        {/* Match Centre Tabs */}

        <div className="mb-6 flex flex-wrap gap-3">

          {[
            { id: "events", label: "Match Events" },
            { id: "statistics", label: "Statistics" },
            { id: "lineups", label: "Lineups" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-5 py-3 text-sm font-bold transition ${
                activeTab === tab.id
                  ? "bg-green-500 text-black"
                  : "bg-[#111c2b] text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={loadMatch}
            className="ml-auto rounded-lg border border-white/10 px-5 py-3 text-sm font-bold text-green-400 hover:bg-white/5"
          >
            ↻ Refresh
          </button>

        </div>

        {/* Match Events */}

        {activeTab === "events" && (
          <section className="rounded-xl border border-white/10 bg-[#111c2b] p-6">

            <h3 className="mb-6 text-lg font-bold">
              Match Events
            </h3>

            {match.events.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No match events are available yet.
              </p>
            ) : (
              <div className="space-y-4">

                {match.events.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 border-b border-white/5 pb-4 last:border-0"
                  >
                    <div className="flex-1 text-left">
                      {event.team.name === match.teams.home.name && (
                        <>
                          <p className="font-semibold">
                            {event.player.name}
                          </p>

                          <p className="text-xs text-gray-400">
                            {event.detail}
                            {event.assist.name
                              ? ` · Assist: ${event.assist.name}`
                              : ""}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="min-w-16 text-center">
                      <span className="rounded-lg bg-[#26384c] px-3 py-2 text-xs font-bold text-green-400">
                        {event.time.elapsed}'
                        {event.time.extra
                          ? ` + ${event.time.extra}`
                          : ""}
                      </span>

                      <p className="mt-2 text-xs text-gray-400">
                        {event.type}
                      </p>
                    </div>

                    <div className="flex-1 text-right">
                      {event.team.name === match.teams.away.name && (
                        <>
                          <p className="font-semibold">
                            {event.player.name}
                          </p>

                          <p className="text-xs text-gray-400">
                            {event.detail}
                            {event.assist.name
                              ? ` · Assist: ${event.assist.name}`
                              : ""}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}

              </div>
            )}

          </section>
        )}

        {/* Match Statistics */}

        {activeTab === "statistics" && (
          <section className="rounded-xl border border-white/10 bg-[#111c2b] p-6">

            <h3 className="mb-6 text-lg font-bold">
              Match Statistics
            </h3>

            {match.statistics.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                Match statistics are not available yet.
              </p>
            ) : (
              <div className="space-y-6">

                {match.statistics[0].statistics.map((stat, index) => {
                  const homeValue = stat.value ?? 0;

                  const awayValue =
                    match.statistics[1]?.statistics[index]?.value ?? 0;

                  return (
                    <div key={index}>

                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-bold text-green-400">
                          {homeValue}
                        </span>

                        <span className="text-gray-400">
                          {stat.type}
                        </span>

                        <span className="font-bold text-green-400">
                          {awayValue}
                        </span>
                      </div>

                      <div className="flex h-2 overflow-hidden rounded-full bg-[#26384c]">
                        <div
                          className="bg-green-500"
                          style={{
                            width: `${
                              typeof homeValue === "number" &&
                              typeof awayValue === "number" &&
                              homeValue + awayValue > 0
                                ? (homeValue / (homeValue + awayValue)) * 100
                                : 50
                            }%`,
                          }}
                        />

                        <div className="flex-1 bg-blue-500" />
                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </section>
        )}

        {/* Team Lineups */}

        {activeTab === "lineups" && (
          <section className="grid gap-6 md:grid-cols-2">

            {match.lineups.length === 0 ? (
              <div className="col-span-full rounded-xl border border-white/10 bg-[#111c2b] p-8 text-center">
                <p className="text-gray-400">
                  Team lineups are not available yet.
                </p>
              </div>
            ) : (
              match.lineups.map((lineup, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/10 bg-[#111c2b] p-6"
                >

                  <div className="mb-6 flex items-center gap-3">
                    <img
                      src={lineup.team.logo}
                      alt={lineup.team.name}
                      className="h-10 w-10 object-contain"
                    />

                    <div>
                      <h3 className="font-bold">
                        {lineup.team.name}
                      </h3>

                      <p className="text-xs text-green-400">
                        Formation: {lineup.formation}
                      </p>
                    </div>
                  </div>

                  <h4 className="mb-3 text-sm font-bold text-gray-400">
                    Starting XI
                  </h4>

                  <div className="space-y-3">
                    {lineup.startXI.map((item) => (
                      <div
                        key={item.player.id}
                        className="flex items-center justify-between border-b border-white/5 pb-2 text-sm"
                      >
                        <span>
                          <span className="mr-3 text-green-400">
                            {item.player.number}
                          </span>

                          {item.player.name}
                        </span>

                        <span className="text-xs text-gray-500">
                          {item.player.pos}
                        </span>
                      </div>
                    ))}
                  </div>

                  <h4 className="mb-3 mt-6 text-sm font-bold text-gray-400">
                    Substitutes
                  </h4>

                  <div className="space-y-3">
                    {lineup.substitutes.map((item) => (
                      <div
                        key={item.player.id}
                        className="flex items-center justify-between border-b border-white/5 pb-2 text-sm"
                      >
                        <span>
                          <span className="mr-3 text-gray-500">
                            {item.player.number}
                          </span>

                          {item.player.name}
                        </span>

                        <span className="text-xs text-gray-500">
                          {item.player.pos}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              ))
            )}

          </section>
        )}

      </div>

      <Footer />
    </main>
  );
}