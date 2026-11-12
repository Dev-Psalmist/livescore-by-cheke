"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LineupPitch from "@/components/LineupPitch";
import EventTimeline from "@/components/EventTimeline";
import MatchInsights from "@/components/MatchInsights";
import PlayerPerformance from "@/components/PlayerPerformance";
import MatchNotifications from "@/components/MatchNotifications";
import YouTubeHighlights from "@/components/YouTubeHighlights";

interface MatchEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: { name: string };
  player: { name: string | null };
  assist: { name: string | null } | null;
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
    id: number;
    season: number;
    name: string;
    country: string;
    logo: string;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
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
    team: { name: string };
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

interface MatchStatusResponse {
  success?: boolean;
  status?: MatchDetails["fixture"]["status"];
  goals?: MatchDetails["goals"];
  error?: unknown;
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

const TABS = [
  { id: "overview", label: "Overview", icon: "⌂" },
  { id: "lineups", label: "Lineups", icon: "⚽" },
  { id: "table", label: "Table", icon: "🏆" },
  { id: "statistics", label: "Stats", icon: "📊" },
  { id: "news", label: "News", icon: "📰" },
  { id: "betting", label: "Betting", icon: "📈" },
  { id: "players", label: "Players", icon: "👤" },
  { id: "highlights", label: "Highlights", icon: "▶" },
];

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;

  if (error instanceof Error) return error.message;

  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string") return message;

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
  if (value === null) return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const cleanedValue = value
    .replace(/,/g, "")
    .replace(/%/g, "")
    .trim();

  if (!cleanedValue || cleanedValue.includes("/")) return null;

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

  return (
    percentageTypes.some((item) => normalizedType.includes(item)) ||
    (typeof homeValue === "string" && homeValue.includes("%")) ||
    (typeof awayValue === "string" && awayValue.includes("%"))
  );
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

function StatisticComparison({ stat }: { stat: StatisticRow }) {
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
    <div className="rounded-xl border border-white/[0.06] bg-[#0c1725] p-4 transition hover:border-white/10">
      <div className="mb-3 grid grid-cols-3 items-center gap-2">
        <span className="break-words text-sm font-bold text-emerald-400">
          {formatStatistic(stat.home)}
        </span>

        <span className="text-center text-xs font-medium text-slate-400">
          {stat.type}
        </span>

        <span className="break-words text-right text-sm font-bold text-blue-400">
          {formatStatistic(stat.away)}
        </span>
      </div>

      {isPercentage ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-1 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${homePercentageWidth}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500">Home</p>
          </div>

          <div>
            <div className="mb-1 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${awayPercentageWidth}%` }}
              />
            </div>
            <p className="text-right text-[10px] text-slate-500">
              Away
            </p>
          </div>
        </div>
      ) : canCompare && total > 0 ? (
        <div className="flex h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${homeWidth}%` }}
          />
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${awayWidth}%` }}
          />
        </div>
      ) : (
        <p className="text-center text-[10px] text-slate-500">
          Comparison unavailable
        </p>
      )}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
        {eyebrow}
      </p>
      <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm text-slate-400">
          {description}
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
  const [statusRefreshError, setStatusRefreshError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [standings, setStandings] = useState<Array<{ rank:number; team:{id:number;name:string;logo:string}; points:number; goalsDiff:number; all:{played:number;win:number;draw:number;lose:number}; form?:string|null }>>([]);
  const [tableError, setTableError] = useState("");
  const [matchNews, setMatchNews] = useState<Array<{id:string;title:string;link:string;source:string;publishedAt:string;summary?:string}>>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  const [teamForm, setTeamForm] = useState<{ home: Array<{id:number;opponent:string;result:"W"|"D"|"L"}>; away: Array<{id:number;opponent:string;result:"W"|"D"|"L"}> } | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const statusRefreshInFlight = useRef(false);

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
          { cache: "no-store" }
        );

        const data: MatchResponse = await response.json();

        if (!response.ok || !data.success || !data.match) {
          throw new Error(getErrorMessage(data.error));
        }

        setMatch(data.match);
        setDiagnostics(data.diagnostics);
        setStatusRefreshError("");
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

  // Live score polling: 5 seconds during play and 15 seconds at half-time.
  useEffect(() => {
    if (!match) return;

    const currentStatus =
      match.fixture.status.short.toUpperCase();

    if (!LIVE_STATUSES.includes(currentStatus)) return;

    const intervalMs =
      currentStatus === "HT" ? 15000 : 5000;

    let cancelled = false;

    const refreshMatchStatus = async () => {
      if (statusRefreshInFlight.current) return;

      statusRefreshInFlight.current = true;

      try {
        const response = await fetch(
          `/api/football/match-status?id=${encodeURIComponent(id)}`,
          { cache: "no-store" }
        );

        const data: MatchStatusResponse = await response.json();

        if (
          !response.ok ||
          !data.success ||
          !data.status ||
          !data.goals
        ) {
          throw new Error(
            getErrorMessage(data.error) ||
              "Unable to retrieve the latest score."
          );
        }

        if (cancelled) return;

        setMatch((currentMatch) => {
          if (!currentMatch) return currentMatch;

          return {
            ...currentMatch,
            fixture: {
              ...currentMatch.fixture,
              status: data.status!,
            },
            goals: data.goals!,
          };
        });

        setStatusRefreshError("");
      } catch (refreshError) {
        if (!cancelled) {
          setStatusRefreshError(
            getErrorMessage(refreshError)
          );
        }
      } finally {
        statusRefreshInFlight.current = false;
      }
    };

    const interval = window.setInterval(
      refreshMatchStatus,
      intervalMs
    );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [id, match?.fixture.status.short]);

  useEffect(() => {
    if (!match) return;
    let cancelled = false;
    fetch(`/api/football/team-form?home=${match.teams.home.id}&away=${match.teams.away.id}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Recent form unavailable.");
        if (!cancelled) setTeamForm({ home: data.home || [], away: data.away || [] });
      })
      .catch(() => { if (!cancelled) setTeamForm(null); });
    return () => { cancelled = true; };
  }, [match?.teams.home.id, match?.teams.away.id]);

  useEffect(() => {
    if (!match || !match.league.id || !match.league.season) return;
    let cancelled = false;
    fetch(`/api/football/standings?league=${match.league.id}&season=${match.league.season}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error("Competition table is unavailable.");
        const rows = data.standings?.[0] || [];
        if (!cancelled) setStandings(rows);
      })
      .catch((err) => { if (!cancelled) setTableError(err instanceof Error ? err.message : "Competition table is unavailable."); });
    return () => { cancelled = true; };
  }, [match?.league.id, match?.league.season]);

  useEffect(() => {
    if (!match) return;
    let cancelled = false;
    setNewsLoading(true);
    fetch("/api/football/news", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error("Football news is unavailable.");
        const terms = [match.teams.home.name, match.teams.away.name, match.league.name].map((term) => term.toLowerCase());
        const relevant = (data.articles || []).filter((article: {title?:string;summary?:string}) => {
          const text = `${article.title || ""} ${article.summary || ""}`.toLowerCase();
          return terms.some((term) => term.length > 2 && text.includes(term));
        }).slice(0, 10);
        if (!cancelled) setMatchNews(relevant);
      })
      .catch(() => { if (!cancelled) setMatchNews([]); })
      .finally(() => { if (!cancelled) setNewsLoading(false); });
    return () => { cancelled = true; };
  }, [match?.teams.home.name, match?.teams.away.name, match?.league.name]);

  const isLive = match
    ? LIVE_STATUSES.includes(match.fixture.status.short.toUpperCase())
    : false;
  const isScheduled = match && ["NS", "TBD"].includes(match.fixture.status.short.toUpperCase());
  const kickoffTime = match ? new Date(match.fixture.date).getTime() : 0;
  const remaining = Math.max(0, kickoffTime - now);
  const countdown = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining % 86400000) / 3600000),
    minutes: Math.floor((remaining % 3600000) / 60000),
    seconds: Math.floor((remaining % 60000) / 1000),
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-NG", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Africa/Lagos",
    });

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
      <main className="min-h-screen bg-[#070f1b] text-white">
        <Header />
        <div className="flex min-h-[65vh] items-center justify-center px-5">
          <div className="text-center">
            <div className="relative mx-auto mb-6 h-14 w-14">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
              <div className="absolute inset-2 animate-spin rounded-full border-[3px] border-emerald-500 border-t-transparent" />
            </div>
            <p className="text-sm font-semibold text-slate-300">
              Preparing your Match Centre
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Fetching match information...
            </p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error && !match) {
    return (
      <main className="min-h-screen bg-[#070f1b] text-white">
        <Header />
        <div className="mx-auto max-w-3xl px-5 py-24 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-2xl">
            !
          </div>
          <h1 className="mb-3 text-2xl font-black">
            Match Information Unavailable
          </h1>
          <p className="mb-8 text-sm text-slate-400">{error}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => void loadMatch()}
              className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="rounded-xl border border-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/5"
            >
              Return Home
            </Link>
          </div>
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

  const isFinished = ["FT", "AET", "PEN"].includes(
    match.fixture.status.short.toUpperCase()
  );

  return (
    <main className="min-h-screen bg-[#070f1b] text-white">
      <Header />

      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-emerald-400"
          >
            <span>←</span>
            Back to LiveScore
          </Link>

          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Match Centre
          </div>
        </div>

        {/* MATCH SCOREBOARD */}
        <section className="relative mb-7 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#101d2d] shadow-2xl shadow-black/20">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-blue-500" />
          <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-emerald-500/[0.06] blur-3xl" />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-blue-500/[0.06] blur-3xl" />

          <div className="relative px-4 py-7 sm:px-8 sm:py-9 lg:px-12">
            {/* Competition */}
            <div className="mb-8 flex flex-col items-center text-center">
              {match.league.logo && (
                <img
                  src={match.league.logo}
                  alt={match.league.name}
                  className="mb-3 h-12 w-12 object-contain"
                />
              )}

              <p className="text-sm font-bold text-white">
                {match.league.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {match.league.country}
                {match.league.round
                  ? ` · ${match.league.round}`
                  : ""}
              </p>
            </div>

            {/* Teams and score */}
            <div className="mx-auto grid max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-8">
              <div className="min-w-0 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] p-2 sm:h-24 sm:w-24 sm:rounded-3xl sm:p-4">
                  <img
                    src={match.teams.home.logo}
                    alt={homeTeam}
                    className="h-full w-full object-contain"
                  />
                </div>

                <h2 className="break-words text-sm font-black text-white sm:text-xl lg:text-2xl">
                  {homeTeam}
                </h2>

                {match.teams.home.winner && (
                  <span className="mt-2 inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-[9px] font-black tracking-wider text-emerald-400">
                    WINNER
                  </span>
                )}
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  Home
                </p>
              </div>

              <div className="min-w-[110px] text-center sm:min-w-[190px]">
                <div className="flex items-center justify-center gap-2 text-4xl font-black tracking-tighter text-white sm:gap-4 sm:text-6xl lg:text-7xl">
                  <span>{match.goals.home ?? "-"}</span>
                  <span className="text-slate-600">:</span>
                  <span>{match.goals.away ?? "-"}</span>
                </div>

                <div className="mt-4 flex justify-center">
                  {isLive ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-black text-red-400">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                      {getMatchTime()}
                    </span>
                  ) : (
                    <span
                      className={`rounded-full px-4 py-2 text-xs font-bold ${
                        isFinished
                          ? "border border-slate-700 bg-slate-800 text-slate-300"
                          : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {getMatchTime()}
                    </span>
                  )}
                </div>

                <p className="mt-4 text-[10px] leading-relaxed text-slate-500 sm:text-xs">
                  {formatDate(match.fixture.date)}
                </p>
              </div>

              <div className="min-w-0 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] p-2 sm:h-24 sm:w-24 sm:rounded-3xl sm:p-4">
                  <img
                    src={match.teams.away.logo}
                    alt={awayTeam}
                    className="h-full w-full object-contain"
                  />
                </div>

                <h2 className="break-words text-sm font-black text-white sm:text-xl lg:text-2xl">
                  {awayTeam}
                </h2>

                {match.teams.away.winner && (
                  <span className="mt-2 inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-[9px] font-black tracking-wider text-emerald-400">
                    WINNER
                  </span>
                )}
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  Away
                </p>
              </div>
            </div>

            {/* Match information */}
            <div className="mt-8 grid gap-3 border-t border-white/[0.07] pt-6 sm:grid-cols-3">
              <div className="rounded-xl bg-black/10 px-4 py-3 text-center">
                <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  Venue
                </p>
                <p className="text-xs font-semibold text-slate-300">
                  {match.fixture.venue.name || "Venue unavailable"}
                </p>
                {match.fixture.venue.city && (
                  <p className="mt-1 text-[10px] text-slate-500">
                    {match.fixture.venue.city}
                  </p>
                )}
              </div>

              <div className="rounded-xl bg-black/10 px-4 py-3 text-center">
                <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  Half-time
                </p>
                <p className="text-lg font-black text-white">
                  {match.score.halftime.home ?? "-"}
                  <span className="mx-2 text-slate-600">:</span>
                  {match.score.halftime.away ?? "-"}
                </p>
              </div>

              <div className="rounded-xl bg-black/10 px-4 py-3 text-center">
                <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  Full-time
                </p>
                <p className="text-lg font-black text-white">
                  {match.score.fulltime.home ?? "-"}
                  <span className="mx-2 text-slate-600">:</span>
                  {match.score.fulltime.away ?? "-"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RECENT FORM */}
        <section className="mb-7 rounded-2xl border border-white/[0.07] bg-[#101d2d] p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Team performance</p>
              <h2 className="mt-1 text-lg font-black">Last five matches</h2>
            </div>
            {isScheduled && remaining > 0 && (
              <div className="flex gap-2 text-center">
                {Object.entries(countdown).map(([unit, value]) => (
                  <div key={unit} className="min-w-12 rounded-lg bg-[#0b1624] px-2 py-2">
                    <div className="text-lg font-black text-emerald-400">{String(value).padStart(2,"0")}</div>
                    <div className="text-[8px] font-bold uppercase text-slate-500">{unit}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {([{name:homeTeam, form:teamForm?.home}, {name:awayTeam, form:teamForm?.away}] as const).map((team) => (
              <div key={team.name} className="rounded-xl bg-[#0b1624] p-4">
                <p className="mb-3 text-sm font-bold text-white">{team.name}</p>
                <div className="flex flex-wrap gap-2">
                  {team.form?.length ? team.form.map((game) => (
                    <span key={game.id} title={`vs ${game.opponent}`} className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white ${game.result === "W" ? "bg-emerald-600" : game.result === "L" ? "bg-red-600" : "bg-amber-500"}`}>{game.result}</span>
                  )) : <span className="text-xs text-slate-500">Recent results unavailable</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* REFRESH FEEDBACK */}
        {error && match && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            Refresh failed: {error}. Previously retrieved match
            information is still displayed.
          </div>
        )}

        {statusRefreshError && (
          <div className="mb-5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-300">
            Automatic score refresh failed: {statusRefreshError}.
            The last successfully retrieved score remains displayed.
          </div>
        )}

        {/* MATCH INSIGHTS */}
        <section className="mb-7">
          <MatchInsights
            events={events}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            homeGoals={match.goals.home}
            awayGoals={match.goals.away}
            status={match.fixture.status.short}
            elapsed={match.fixture.status.elapsed}
          />
        </section>

        {/* MATCH NOTIFICATIONS */}
        <section className="mb-8">
          <MatchNotifications
            matchId={id}
            events={events}
            status={match.fixture.status.short}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />
        </section>

        {/* CONTENT NAVIGATION */}
        <section className="mb-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                Match coverage
              </p>
              <h2 className="text-xl font-black text-white sm:text-2xl">
                Match Centre
              </h2>
            </div>

            <button
              type="button"
              onClick={() => void loadMatch(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-emerald-400 transition hover:border-emerald-500/30 hover:bg-emerald-500/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className={refreshing ? "animate-spin" : ""}>
                ↻
              </span>
              {refreshing ? "Refreshing..." : "Refresh match"}
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#101d2d] p-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition sm:px-5 sm:text-sm ${
                  activeTab === tab.id
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* MATCH EVENTS */}
        {activeTab === "overview" && (
          <section className="rounded-2xl border border-white/[0.07] bg-[#101d2d] p-4 sm:p-6">
            <SectionHeading
              eyebrow="Match overview"
              title="Match Events"
              description="Follow goals, cards, substitutions and important moments."
            />

            <EventTimeline
              events={events}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
          </section>
        )}

        {/* MATCH STATISTICS */}
        {activeTab === "statistics" && (
          <section className="rounded-2xl border border-white/[0.07] bg-[#101d2d] p-4 sm:p-6">
            <SectionHeading
              eyebrow="Numbers that matter"
              title="Match Statistics"
              description="Compare the official statistics recorded for both teams."
            />

            {statisticRows.length === 0 ? (
              <div className="rounded-xl border border-white/[0.06] bg-[#0c1725] py-12 text-center">
                <p className="text-3xl">📊</p>
                <p className="mt-3 text-sm font-semibold text-slate-300">
                  Match statistics are not available
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Statistics may appear when the match data becomes available.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-5 grid grid-cols-3 gap-2 rounded-xl bg-[#0c1725] p-4 text-center text-xs font-bold">
                  <span className="break-words text-emerald-400">
                    {homeTeam}
                  </span>
                  <span className="text-slate-500">STATISTIC</span>
                  <span className="break-words text-blue-400">
                    {awayTeam}
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {statisticRows.map((stat) => (
                    <StatisticComparison
                      key={stat.type}
                      stat={stat}
                    />
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-6 border-t border-white/[0.06] pt-5 text-xs text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
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
          <section className="rounded-2xl border border-white/[0.07] bg-[#101d2d] p-4 sm:p-6">
            <SectionHeading
              eyebrow="Individual impact"
              title="Player Performance"
              description="Explore individual player statistics and contributions."
            />

            <PlayerPerformance
              players={players}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
          </section>
        )}

        {/* TEAM LINEUPS */}
        {activeTab === "lineups" && (
          <section>
            <SectionHeading
              eyebrow="The starting eleven"
              title="Team Lineups"
              description="Explore formations, starting players and substitutes."
            />

            {lineups.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.07] bg-[#101d2d] p-8 text-center">
                <p className="text-3xl">⚽</p>
                <h3 className="mt-4 font-bold text-white">
                  Lineups Unavailable
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Official team lineups have not been provided for this match.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 xl:grid-cols-2">
                {lineups.map((lineup, index) => {
                  const startingPlayers = lineup.startXI ?? [];
                  const substitutes = lineup.substitutes ?? [];

                  return (
                    <div
                      key={`${lineup.team.name}-${index}`}
                      className="rounded-2xl border border-white/[0.07] bg-[#101d2d] p-4 sm:p-6"
                    >
                      <div className="mb-6 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {lineup.team.logo && (
                            <img
                              src={lineup.team.logo}
                              alt={lineup.team.name}
                              className="h-11 w-11 object-contain"
                            />
                          )}
                          <div className="min-w-0">
                            <h3 className="truncate font-black text-white">
                              {lineup.team.name}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              Starting XI · {startingPlayers.length} players
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-400">
                          {lineup.formation || "N/A"}
                        </span>
                      </div>

                      <div className="mb-7">
                        <LineupPitch
                          players={startingPlayers}
                          formation={lineup.formation}
                        />
                      </div>

                      <div className="border-t border-white/[0.07] pt-5">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white">
                            Substitutes
                          </h4>
                          <span className="text-xs text-slate-500">
                            {substitutes.length} players
                          </span>
                        </div>

                        {substitutes.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            No substitute information available.
                          </p>
                        ) : (
                          <div className="grid gap-2 sm:grid-cols-2">
                            {substitutes.map((item, playerIndex) => (
                              <div
                                key={`${item.player.id}-${playerIndex}`}
                                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-[#0c1725] px-3 py-3 text-sm"
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-xs font-bold text-slate-400">
                                    {item.player.number}
                                  </span>
                                  <span className="truncate font-medium text-slate-200">
                                    {item.player.name}
                                  </span>
                                </div>
                                <span className="shrink-0 text-[10px] font-bold text-slate-500">
                                  {item.player.pos}
                                </span>
                              </div>
                            ))}
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

        {/* MATCH HIGHLIGHTS */}
        {activeTab === "highlights" && (
          <section className="rounded-2xl border border-white/[0.07] bg-[#101d2d] p-4 sm:p-6">
            <SectionHeading
              eyebrow="Watch the action"
              title="Match Highlights"
              description={`Video highlights and coverage for ${homeTeam} vs ${awayTeam}.`}
            />

            <YouTubeHighlights
              kind="all"
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              league={match.league.name}
              limit={6}
            />
          </section>
        )}

        {activeTab === "table" && (
          <section className="rounded-2xl border border-white/[0.07] bg-[#101d2d] p-4 sm:p-6">
            <SectionHeading eyebrow={match.league.name} title="Competition Table" description="Official standings returned by the football data provider." />
            {tableError ? <p className="rounded-xl bg-[#0c1725] p-5 text-sm text-slate-400">{tableError}</p> : standings.length === 0 ? <p className="rounded-xl bg-[#0c1725] p-5 text-sm text-slate-400">Standings are not available for this competition or season.</p> : (
              <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="p-3">Pos</th><th className="p-3">Club</th><th className="p-3">P</th><th className="p-3">W</th><th className="p-3">D</th><th className="p-3">L</th><th className="p-3">GD</th><th className="p-3">Pts</th></tr></thead><tbody>{standings.map((row) => <tr key={row.team.id} className={`border-t border-white/[0.06] ${row.team.id === match.teams.home.id || row.team.id === match.teams.away.id ? "bg-emerald-500/[0.06]" : ""}`}><td className="p-3 font-bold text-slate-400">{row.rank}</td><td className="p-3 font-semibold text-white"><span className="flex items-center gap-2">{row.team.logo && <img src={row.team.logo} alt="" className="h-5 w-5 object-contain" />}{row.team.name}</span></td><td className="p-3">{row.all.played}</td><td className="p-3">{row.all.win}</td><td className="p-3">{row.all.draw}</td><td className="p-3">{row.all.lose}</td><td className="p-3">{row.goalsDiff}</td><td className="p-3 font-black text-emerald-400">{row.points}</td></tr>)}</tbody></table></div>
            )}
          </section>
        )}

        {activeTab === "news" && (
          <section className="rounded-2xl border border-white/[0.07] bg-[#101d2d] p-4 sm:p-6">
            <SectionHeading eyebrow="Team coverage" title="Related Football News" description={`Headlines mentioning ${homeTeam}, ${awayTeam} or ${match.league.name}.`} />
            {newsLoading ? <p className="p-8 text-center text-sm text-slate-400">Loading related news...</p> : matchNews.length === 0 ? <p className="rounded-xl bg-[#0c1725] p-5 text-sm text-slate-400">No related headlines are currently available. Unrelated football stories are hidden.</p> : <div className="grid gap-3 md:grid-cols-2">{matchNews.map((article) => <a key={article.id} href={article.link} target="_blank" rel="noreferrer" className="rounded-xl border border-white/[0.06] bg-[#0c1725] p-4 transition hover:border-emerald-500/30"><p className="text-sm font-bold text-white">{article.title}</p>{article.summary && <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">{article.summary}</p>}<p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-400">{article.source} · {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("en-NG") : "Latest"}</p></a>)}</div>}
            <div className="mt-6 border-t border-white/[0.06] pt-5"><h3 className="mb-3 text-sm font-bold text-white">Video highlights</h3><YouTubeHighlights kind="all" homeTeam={homeTeam} awayTeam={awayTeam} league={match.league.name} limit={4} /></div>
          </section>
        )}

        {activeTab === "betting" && (
          <section className="rounded-2xl border border-white/[0.07] bg-[#101d2d] p-6 sm:p-8"><SectionHeading eyebrow="Match markets" title="Betting Odds" description="Odds are shown only when a verified odds provider is connected." /><div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5"><p className="font-bold text-amber-300">Odds provider not configured</p><p className="mt-2 text-sm leading-6 text-slate-400">LiveScore by Cheke does not currently have a verified betting-odds data source. We will not display estimated or invented odds.</p></div></section>
        )}

        {/* API DATA DIAGNOSTICS */}
        {failedDiagnostics.length > 0 && (
          <section className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.05] p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
                !
              </span>
              <h3 className="font-bold text-yellow-400">
                Some Match Information Is Unavailable
              </h3>
            </div>

            <p className="mb-4 text-sm text-slate-400">
              The main match information was retrieved, but some additional
              data could not be loaded.
            </p>

            <div className="space-y-3">
              {failedDiagnostics.map((item) => (
                <div
                  key={item.endpoint}
                  className="rounded-lg bg-black/10 p-3 text-sm"
                >
                  <span className="font-semibold capitalize text-white">
                    {item.endpoint}:
                  </span>
                  <span className="ml-2 text-slate-400">
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