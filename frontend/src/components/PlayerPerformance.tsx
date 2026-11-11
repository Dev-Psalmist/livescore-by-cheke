"use client";

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
  cards?: {
    yellow?: number | null;
    red?: number | null;
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

interface PlayerPerformanceProps {
  players?: PlayerTeam[] | null;
  homeTeam: string;
  awayTeam: string;
}

function displayValue(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return value;
}

function getRating(rating: string | number | null | undefined) {
  if (rating === null || rating === undefined || rating === "") {
    return null;
  }

  const numericRating = Number(rating);

  return Number.isFinite(numericRating)
    ? numericRating.toFixed(1)
    : String(rating);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function PlayerCard({ player }: { player: MatchPlayer }) {
  const stats = player.statistics?.[0];
  const rating = getRating(stats?.games?.rating);

  const metrics = [
    {
      label: "Minutes",
      value:
        stats?.games?.minutes !== null &&
        stats?.games?.minutes !== undefined
          ? `${stats.games.minutes}'`
          : null,
    },
    {
      label: "Goals",
      value: stats?.goals?.total,
    },
    {
      label: "Assists",
      value: stats?.goals?.assists,
    },
    {
      label: "Shots",
      value: stats?.shots?.total,
    },
    {
      label: "On target",
      value: stats?.shots?.on,
    },
    {
      label: "Passes",
      value: stats?.passes?.total,
    },
    {
      label: "Key passes",
      value: stats?.passes?.key,
    },
    {
      label: "Tackles",
      value: stats?.tackles?.total,
    },
    {
      label: "Yellow cards",
      value: stats?.cards?.yellow,
    },
    {
      label: "Red cards",
      value: stats?.cards?.red,
    },
  ].filter((metric) => metric.value !== null && metric.value !== undefined);

  return (
    <article className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
      <div className="flex items-center gap-3">
        {player.player.photo ? (
          <img
            src={player.player.photo}
            alt={player.player.name}
            className="h-12 w-12 rounded-full border border-white/10 object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-white">
            {getInitials(player.player.name)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold text-white">
            {player.player.name}
          </h4>

          <p className="text-xs text-slate-400">
            {stats?.games?.position || "Position unavailable"}
            {stats?.games?.number != null
              ? ` · Shirt ${stats.games.number}`
              : ""}
            {stats?.games?.captain ? " · Captain" : ""}
            {stats?.games?.substitute ? " · Substitute" : ""}
          </p>
        </div>

        {rating !== null && (
          <div className="rounded-lg bg-emerald-500/15 px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-emerald-300">
              Rating
            </p>
            <p className="text-lg font-bold text-emerald-400">{rating}</p>
          </div>
        )}
      </div>

      {metrics.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg bg-slate-800/80 px-3 py-2"
            >
              <p className="text-xs text-slate-400">{metric.label}</p>
              <p className="mt-1 font-semibold text-white">
                {displayValue(metric.value)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-lg bg-slate-800/70 p-3 text-sm text-slate-400">
          Individual statistics are not available for this player.
        </p>
      )}

      {stats?.passes?.accuracy !== null &&
        stats?.passes?.accuracy !== undefined && (
          <p className="mt-3 text-xs text-slate-400">
            Passing accuracy:{" "}
            <span className="font-semibold text-white">
              {stats.passes.accuracy}%
            </span>
          </p>
        )}
    </article>
  );
}

function TeamPlayers({
  team,
}: {
  team: PlayerTeam;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        {team.team.logo && (
          <img
            src={team.team.logo}
            alt=""
            className="h-8 w-8 object-contain"
          />
        )}

        <h3 className="font-bold text-white">{team.team.name}</h3>

        <span className="ml-auto text-xs text-slate-400">
          {team.players.length} players
        </span>
      </div>

      {team.players.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {team.players.map((player) => (
            <PlayerCard key={player.player.id} player={player} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          No player statistics are available for this team.
        </p>
      )}
    </section>
  );
}

export default function PlayerPerformance({
  players,
  homeTeam,
  awayTeam,
}: PlayerPerformanceProps) {
  if (!players || players.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 text-center">
        <h3 className="font-semibold text-white">
          Player statistics unavailable
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          API-Football has not provided individual player statistics for this
          match. These statistics may become available during or after the
          match.
        </p>
      </div>
    );
  }

  const homePlayers = players.filter(
    (team) => team.team.name.toLowerCase() === homeTeam.toLowerCase()
  );

  const awayPlayers = players.filter(
    (team) => team.team.name.toLowerCase() === awayTeam.toLowerCase()
  );

  const displayedTeams = [...homePlayers, ...awayPlayers];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white">
          Player Performance
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Individual match statistics supplied by API-Football.
        </p>
      </div>

      {displayedTeams.length > 0 ? (
        displayedTeams.map((team) => (
          <TeamPlayers key={team.team.id} team={team} />
        ))
      ) : (
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 text-sm text-slate-400">
          Player data was returned, but the teams could not be matched to this
          fixture.
        </div>
      )}
    </div>
  );
}