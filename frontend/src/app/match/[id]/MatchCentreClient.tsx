"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LineupPitch from "@/components/LineupPitch";
import EventTimeline from "@/components/EventTimeline";
import MatchInsights from "@/components/MatchInsights";
import PlayerPerformance from "@/components/PlayerPerformance";

interface MatchEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    name: string;
  };
  player: {
    name: string | null;
  };
  assist: {
    name: string | null;
  } | null;
  type: string;
  detail: string;
  comments: string | null;
}

interface MatchStatistic {
  type: string;
  value: string | number | null;
}

interface LineupPlayer {
  player: {
    id: number;
    name: string;
    number: number;
    pos: string;
  };
}

interface MatchLineup {
  team: {
    name: string;
    logo: string;
  };
  formation: string;
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
}

/* PLAYER PERFORMANCE TYPES */

interface PlayerStatistics {
  games?: {
    minutes?: number | null;
    number?: number | null;
    position?: string | null;
    rating?: string | number | null;
    captain?: boolean | null;
    substitute?: boolean | null;
  } | null;

  shots?: {
    total?: number | null;
    on?: number | null;
  } | null;

  goals?: {
    total?: number | null;
    assists?: number | null;
    conceded?: number | null;
    saves?: number | null;
  } | null;

  passes?: {
    total?: number | null;
    key?: number | null;
    accuracy?: string | number | null;
  } | null;

  tackles?: {
    total?: number | null;
    blocks?: number | null;
    interceptions?: number | null;
  } | null;

  duels?: {
    total?: number | null;
    won?: number | null;
  } | null;

  dribbles?: {
    attempts?: number | null;
    success?: number | null;
    past?: number | null;
  } | null;

  fouls?: {
    drawn?: number | null;
    committed?: number | null;
  } | null;

  cards?: {
    yellow?: number | null;
    red?: number | null;
  } | null;

  penalty?: {
    won?: number | null;
    commited?: number | null;
    scored?: number | null;
    missed?: number | null;
    saved?: number | null;
  } | null;
}

interface MatchPlayer {
  player: {
    id: number;
    name: string;
    photo?: string | null;
  };

  statistics?: PlayerStatistics[] | null;
}

interface PlayerTeam {
  team: {
    id: number;
    name: string;
    logo?: string | null;
  };

  players: MatchPlayer[];
}

/* END PLAYER PERFORMANCE TYPES */

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

  events: MatchEvent[];
  lineups: MatchLineup[];

  statistics: Array<{
    team: {
      name: string;
    };
    statistics: MatchStatistic[];
  }>;

  players?: PlayerTeam[];
}

interface EndpointDiagnostic {
  endpoint: string;
  success: boolean;
  results: number;
  message: string;
}

interface MatchResponse {
  success?: boolean;
  match?: MatchDetails;
  error?: unknown;

  diagnostics?: {
    events?: EndpointDiagnostic;
    lineups?: EndpointDiagnostic;
    statistics?: EndpointDiagnostic;
    players?: EndpointDiagnostic;
  };
}

interface MatchCentreClientProps {
  id: string;
}

interface StatisticRow {
  type: string;
  home: string | number | null;
  away: string | number | null;
}

const LIVE_STATUSES = [
  "1H",
  "HT",
  "2H",
  "ET",
  "BT",
  "P",
  "LIVE",
  "INT",
  "SUSP",
  "INTERRUPTED",
];

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string") {
      return message;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return "Unable to load match information.";
    }
  }

  return "Unable to load match information.";
}

function getNumericValue(
  value: string | number | null
): number | null {
  if (value === null) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const cleanedValue = value
    .replace(/,/g, "")
    .replace(/%/g, "")
    .trim();

  if (!cleanedValue || cleanedValue.includes("/")) {
    return null;
  }

  const parsed = Number(cleanedValue);

  return Number.isFinite(parsed) ? parsed : null;
}

function formatStatistic(
  value: string | number | null
): string {
  return value === null ? "—" : String(value);
}

function isPercentageStatistic(
  type: string,
  homeValue: string | number | null,
  awayValue: string | number | null
): boolean {
  const normalizedType = type.toLowerCase();

  const percentageTypes = [
    "possession",
    "percentage",
    "accuracy",
    "success rate",
    "pass %",
    "passes %",
  ];

  const hasPercentageLabel = percentageTypes.some((item) =>
    normalizedType.includes(item)
  );

  const hasPercentageValue =
    (typeof homeValue === "string" &&
      homeValue.includes("%")) ||
    (typeof awayValue === "string" &&
      awayValue.includes("%"));

  return hasPercentageLabel || hasPercentageValue;
}

function getStatisticRows(
  statistics: MatchDetails["statistics"],
  homeTeam: string,
  awayTeam: string
): StatisticRow[] {
  const homeStatistics = statistics.find(
    (item) =>
      item.team.name.toLowerCase() === homeTeam.toLowerCase()
  );

  const awayStatistics = statistics.find(
    (item) =>
      item.team.name.toLowerCase() === awayTeam.toLowerCase()
  );

  const rows = new Map<string, StatisticRow>();

  homeStatistics?.statistics.forEach((stat) => {
    rows.set(stat.type, {
      type: stat.type,
      home: stat.value,
      away: null,
    });
  });

  awayStatistics?.statistics.forEach((stat) => {
    const existing = rows.get(stat.type);

    if (existing) {
      existing.away = stat.value;
    } else {
      rows.set(stat.type, {
        type: stat.type,
        home: null,
        away: stat.value,
      });
    }
  });

  return Array.from(rows.values());
}

function StatisticComparison({
  stat,
}: {
  stat: StatisticRow;
}) {
  const homeValue = getNumericValue(stat.home);
  const awayValue = getNumericValue(stat.away);

  const canCompare =
    homeValue !== null && awayValue !== null;

  const isPercentage = isPercentageStatistic(
    stat.type,
    stat.home,
    stat.away
  );

  const total =
    canCompare ? homeValue + awayValue : 0;

  const homeWidth =
    canCompare && total > 0
      ? (homeValue / total) * 100
      : 0;

  const awayWidth =
    canCompare && total > 0
      ? (awayValue / total) * 100
      : 0;

  const homePercentageWidth =
    homeValue !== null
      ? Math.min(Math.max(homeValue, 0), 100)
      : 0;

  const awayPercentageWidth =
    awayValue !== null
      ? Math.min(Math.max(awayValue, 0), 100)
      : 0;

  return (
    <div className="rounded-lg bg-[#172638]/70 p-4">
      <div className="mb-3 grid grid-cols-3 items-center gap-2">
        <span className="break-words text-sm font-bold text-green-400">
          {formatStatistic(stat.home)}
        </span>

        <span className="text-center text-xs font-medium text-gray-400">
          {stat.type}
        </span>

        <span className="break-words text-right text-sm font-bold text-blue-400">
          {formatStatistic(stat.away)}
        </span>
      </div>

      {isPercentage ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-1 h-2 overflow-hidden rounded-full bg-[#26384c]">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{
                  width: `${homePercentageWidth}%`,
                }}
              />
            </div>

            <p className="text-[10px] text-gray-500">
              Home
            </p>
          </div>

          <div>
            <div className="mb-1 h-2 overflow-hidden rounded-full bg-[#26384c]">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{
                  width: `${awayPercentageWidth}%`,
                }}
              />
            </div>

            <p className="text-right text-[10px] text-gray-500">
              Away
            </p>
          </div>
        </div>
      ) : canCompare && total > 0 ? (
        <div className="flex h-2 overflow-hidden rounded-full bg-[#26384c]">
          <div
            className="h-full bg-green-500 transition-all"
            style={{
              width: `${homeWidth}%`,
            }}
          />

          <div
            className="h-full bg-blue-500 transition-all"
            style={{
              width: `${awayWidth}%`,
            }}
          />
        </div>
      ) : (
        <p className="text-center text-[10px] text-gray-500">
          Comparison unavailable
        </p>
      )}
    </div>
  );
}

export default function MatchCentreClient({
  id,
}: MatchCentreClientProps) {
  const [match, setMatch] = useState<MatchDetails | null>(null);

  const [diagnostics, setDiagnostics] =
    useState<MatchResponse["diagnostics"]>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("events");

  const loadMatch = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          `/api/football/match?id=${encodeURIComponent(id)}`,
          {
            cache: "no-store",
          }
        );

        const data: MatchResponse = await response.json();

        if (!response.ok || !data.success || !data.match) {
          throw new Error(getErrorMessage(data.error));
        }

        setMatch(data.match);
        setDiagnostics(data.diagnostics);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading this match."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    void loadMatch();
  }, [loadMatch]);

  const isLive = match
    ? LIVE_STATUSES.includes(
        match.fixture.status.short.toUpperCase()
      )
    : false;

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

    if (isLive && status.elapsed !== null) {
      return `${status.elapsed}'${
        status.extra ? ` + ${status.extra}` : ""
      }`;
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

  if (error && !match) {
    return (
      <main className="min-h-screen bg-[#08111e] text-white">
        <Header />

        <div className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="mb-4 text-2xl font-bold">
            Match Information Unavailable
          </h1>

          <p className="mb-8 text-gray-400">{error}</p>

          <button
            type="button"
            onClick={() => void loadMatch()}
            className="mr-3 rounded-lg bg-green-500 px-6 py-3 font-bold text-black"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="rounded-lg border border-white/20 px-6 py-3 font-bold"
          >
            Return Home
          </Link>
        </div>

        <Footer />
      </main>
    );
  }

  if (!match) return null;

  const homeTeam = match.teams.home.name;
  const awayTeam = match.teams.away.name;

  const events = match.events ?? [];
  const lineups = match.lineups ?? [];
  const statistics = match.statistics ?? [];
  const players = match.players ?? [];

  const statisticRows = getStatisticRows(
    statistics,
    homeTeam,
    awayTeam
  );

  const failedDiagnostics = Object.values(
    diagnostics ?? {}
  ).filter((item) => item && !item.success);

  return (
    <main className="min-h-screen bg-[#08111e] text-white">
      <Header />

      <div className="mx-auto max-w-6xl px-5 py-10">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-green-400 hover:text-green-300"
        >
          ← Back to LiveScore
        </Link>

        {/* MATCH OVERVIEW */}

        <section className="mb-8 rounded-2xl border border-white/10 bg-[#111c2b] p-6 md:p-10">
          <div className="mb-8 text-center">
            {match.league.logo && (
              <img
                src={match.league.logo}
                alt={match.league.name}
                className="mx-auto mb-3 h-12 w-12 object-contain"
              />
            )}

            <p className="text-sm font-bold text-green-400">
              {match.league.name}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {match.league.country} · {match.league.round}
            </p>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* HOME TEAM */}

            <div className="text-center">
              <img
                src={match.teams.home.logo}
                alt={homeTeam}
                className="mx-auto mb-4 h-16 w-16 object-contain md:h-24 md:w-24"
              />

              <h2 className="text-sm font-bold md:text-xl">
                {homeTeam}
              </h2>

              {match.teams.home.winner && (
                <span className="mt-2 inline-block text-xs text-green-400">
                  WINNER
                </span>
              )}
            </div>

            {/* SCORE */}

            <div className="text-center">
              <div className="text-4xl font-black md:text-6xl">
                {match.goals.home ?? "-"}
                <span className="mx-2 text-gray-500">:</span>
                {match.goals.away ?? "-"}
              </div>

              <p
                className={`mt-3 text-sm font-bold ${
                  isLive ? "text-red-400" : "text-green-400"
                }`}
              >
                {isLive && "● "}
                {getMatchTime()}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                {formatDate(match.fixture.date)}
              </p>
            </div>

            {/* AWAY TEAM */}

            <div className="text-center">
              <img
                src={match.teams.away.logo}
                alt={awayTeam}
                className="mx-auto mb-4 h-16 w-16 object-contain md:h-24 md:w-24"
              />

              <h2 className="text-sm font-bold md:text-xl">
                {awayTeam}
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

          <div className="mt-4 flex flex-wrap justify-center gap-8 text-sm text-gray-400">
            <p>
              Half-time: {match.score.halftime.home ?? "-"} :{" "}
              {match.score.halftime.away ?? "-"}
            </p>

            {match.score.fulltime.home !== null && (
              <p>
                Full-time: {match.score.fulltime.home ?? "-"} :{" "}
                {match.score.fulltime.away ?? "-"}
              </p>
            )}
          </div>
        </section>

        {/* REFRESH FEEDBACK */}

        {error && match && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            Refresh failed: {error}. Previously retrieved match
            information is still displayed.
          </div>
        )}

        {/* MATCH INSIGHTS */}

        <MatchInsights
          events={events}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          homeGoals={match.goals.home}
          awayGoals={match.goals.away}
          status={match.fixture.status.long}
          elapsed={match.fixture.status.elapsed}
        />

        {/* NAVIGATION TABS */}

        <div className="mb-6 mt-8 flex flex-wrap gap-3">
          {[
            { id: "events", label: "Match Events" },
            { id: "statistics", label: "Statistics" },
            { id: "players", label: "Player Performance" },
            { id: "lineups", label: "Lineups" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
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
            type="button"
            onClick={() => void loadMatch(true)}
            disabled={refreshing}
            className="ml-auto rounded-lg border border-white/10 px-5 py-3 text-sm font-bold text-green-400 hover:bg-white/5 disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* MATCH EVENTS */}

        {activeTab === "events" && (
          <EventTimeline
            events={events}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />
        )}

        {/* MATCH STATISTICS */}

        {activeTab === "statistics" && (
          <section className="rounded-xl border border-white/10 bg-[#111c2b] p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold">
                Match Statistics
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Compare the official statistics recorded for both teams.
              </p>
            </div>

            {statisticRows.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-2xl">📊</p>

                <p className="mt-3 text-sm text-gray-400">
                  Match statistics are not available.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-5 grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  <span className="text-green-400">
                    {homeTeam}
                  </span>

                  <span className="text-gray-400">
                    STATISTIC
                  </span>

                  <span className="text-blue-400">
                    {awayTeam}
                  </span>
                </div>

                <div className="space-y-3">
                  {statisticRows.map((stat) => (
                    <StatisticComparison
                      key={stat.type}
                      stat={stat}
                    />
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-6 border-t border-white/10 pt-5 text-xs text-gray-400">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Home team
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Away team
                  </span>
                </div>
              </>
            )}
          </section>
        )}

        {/* PLAYER PERFORMANCE */}

        {activeTab === "players" && (
          <section className="rounded-xl border border-white/10 bg-[#111c2b] p-5 md:p-6">
            <PlayerPerformance
              players={players}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
          </section>
        )}

        {/* TEAM LINEUPS WITH VISUAL PITCH */}

        {activeTab === "lineups" && (
          <section>
            {lineups.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-[#111c2b] p-8 text-center">
                <h3 className="font-bold">
                  Lineups Unavailable
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  Official team lineups have not been provided
                  for this match.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {lineups.map((lineup, index) => {
                  const startingPlayers = lineup.startXI ?? [];
                  const substitutes = lineup.substitutes ?? [];

                  return (
                    <div
                      key={`${lineup.team.name}-${index}`}
                      className="rounded-xl border border-white/10 bg-[#111c2b] p-5 md:p-6"
                    >
                      {/* TEAM AND FORMATION */}

                      <div className="mb-6 flex items-center gap-3">
                        {lineup.team.logo && (
                          <img
                            src={lineup.team.logo}
                            alt={lineup.team.name}
                            className="h-10 w-10 object-contain"
                          />
                        )}

                        <div>
                          <h3 className="font-bold">
                            {lineup.team.name}
                          </h3>

                          <p className="text-xs text-green-400">
                            Formation:{" "}
                            {lineup.formation || "Unavailable"}
                          </p>
                        </div>
                      </div>

                      {/* VISUAL STARTING XI */}

                      <div className="mb-6">
                        <h4 className="mb-3 text-sm font-bold text-gray-400">
                          Starting XI ({startingPlayers.length})
                        </h4>

                        <LineupPitch
                          players={startingPlayers}
                          formation={lineup.formation}
                        />
                      </div>

                      {/* SUBSTITUTES */}

                      <div className="border-t border-white/10 pt-5">
                        <h4 className="mb-4 text-sm font-bold text-gray-400">
                          Substitutes ({substitutes.length})
                        </h4>

                        {substitutes.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No substitute information available.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {substitutes.map(
                              (item, playerIndex) => (
                                <div
                                  key={`${item.player.id}-${playerIndex}`}
                                  className="flex items-center justify-between border-b border-white/5 pb-2 text-sm last:border-0"
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
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* API DATA DIAGNOSTICS */}

        {failedDiagnostics.length > 0 && (
          <section className="mt-8 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
            <h3 className="mb-3 font-bold text-yellow-400">
              Some Match Information Is Unavailable
            </h3>

            <p className="mb-4 text-sm text-gray-400">
              The main match information was retrieved, but
              some additional data could not be loaded.
            </p>

            <div className="space-y-3">
              {failedDiagnostics.map((item) => (
                <div
                  key={item.endpoint}
                  className="text-sm"
                >
                  <span className="font-semibold capitalize text-white">
                    {item.endpoint}:
                  </span>

                  <span className="ml-2 text-gray-400">
                    {item.message}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}