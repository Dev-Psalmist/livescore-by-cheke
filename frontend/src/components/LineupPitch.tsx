interface LineupPlayer {
  player: {
    id: number;
    name: string;
    number: number;
    pos: string;
  };
}

interface LineupPitchProps {
  players: LineupPlayer[];
  formation?: string;
}

interface PlayerRow {
  label: string;
  players: LineupPlayer[];
}

const POSITION_LABELS: Record<string, string> = {
  F: "Forwards",
  M: "Midfielders",
  D: "Defenders",
  G: "Goalkeeper",
  OTHER: "Other players",
};

function getPosition(position: string): string {
  return position?.trim().toUpperCase() || "OTHER";
}

function groupPlayers(players: LineupPlayer[]) {
  return {
    F: players.filter(
      (item) => getPosition(item.player.pos) === "F"
    ),
    M: players.filter(
      (item) => getPosition(item.player.pos) === "M"
    ),
    D: players.filter(
      (item) => getPosition(item.player.pos) === "D"
    ),
    G: players.filter(
      (item) => getPosition(item.player.pos) === "G"
    ),
    OTHER: players.filter(
      (item) =>
        !["F", "M", "D", "G"].includes(
          getPosition(item.player.pos)
        )
    ),
  };
}

function buildFormationRows(
  players: LineupPlayer[],
  formation?: string
): PlayerRow[] | null {
  if (!formation?.trim()) return null;

  const formationNumbers = formation
    .trim()
    .split("-")
    .map(Number);

  if (
    formationNumbers.length < 3 ||
    formationNumbers.some(
      (number) => !Number.isInteger(number) || number <= 0
    )
  ) {
    return null;
  }

  const groups = groupPlayers(players);

  const goalkeeper = groups.G;
  const defenders = [...groups.D];
  const midfielders = [...groups.M];
  const forwards = [...groups.F];

  const rows: PlayerRow[] = [];

  // Formation numbers are written from defence to attack.
  // Reverse them because the pitch displays attack at the top.
  const attackingToDefending = [...formationNumbers].reverse();

  for (
    let index = 0;
    index < attackingToDefending.length;
    index++
  ) {
    const count = attackingToDefending[index];

    let position: "F" | "M" | "D";

    if (index === 0) {
      position = "F";
    } else if (index === attackingToDefending.length - 1) {
      position = "D";
    } else {
      position = "M";
    }

    let selectedPlayers: LineupPlayer[];

    if (position === "F") {
      selectedPlayers = forwards.splice(0, count);
    } else if (position === "D") {
      selectedPlayers = defenders.splice(0, count);
    } else {
      selectedPlayers = midfielders.splice(0, count);
    }

    if (selectedPlayers.length !== count) {
      return null;
    }

    rows.push({
      label: POSITION_LABELS[position],
      players: selectedPlayers,
    });
  }

  // Every starting player must fit into the formation.
  if (
    forwards.length > 0 ||
    midfielders.length > 0 ||
    defenders.length > 0 ||
    goalkeeper.length !== 1 ||
    groups.OTHER.length > 0
  ) {
    return null;
  }

  rows.push({
    label: POSITION_LABELS.G,
    players: goalkeeper,
  });

  return rows;
}

function buildPositionRows(
  players: LineupPlayer[]
): PlayerRow[] {
  const groups = groupPlayers(players);

  const rows: PlayerRow[] = [];

  const order: Array<keyof typeof groups> = [
    "F",
    "M",
    "D",
    "G",
    "OTHER",
  ];

  for (const position of order) {
    if (groups[position].length > 0) {
      rows.push({
        label: POSITION_LABELS[position],
        players: groups[position],
      });
    }
  }

  return rows;
}

function PlayerMarker({
  item,
}: {
  item: LineupPlayer;
}) {
  return (
    <div
      className="flex min-w-0 flex-col items-center text-center"
      title={`${item.player.name} · ${item.player.pos || "Position unavailable"}`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white text-sm font-black text-green-900 shadow-lg transition-transform duration-200 hover:scale-110 sm:h-10 sm:w-10">
        {item.player.number ?? "—"}
      </div>

      <span className="mt-1 w-full break-words rounded bg-black/75 px-1 py-1 text-[9px] font-semibold leading-tight text-white sm:px-2 sm:text-[10px]">
        {item.player.name}
      </span>
    </div>
  );
}

export default function LineupPitch({
  players,
  formation,
}: LineupPitchProps) {
  if (players.length === 0) {
    return (
      <div className="rounded-xl bg-slate-900 p-6 text-center text-sm text-gray-400">
        Starting lineup unavailable.
      </div>
    );
  }

  const formationRows = buildFormationRows(players, formation);

  const rows = formationRows ?? buildPositionRows(players);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#123d32] p-3 sm:p-4">
      {/* PITCH HEADER */}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-green-100">
        <span className="font-bold tracking-wider">
          ATTACK ↑
        </span>

        <span className="rounded-full bg-black/20 px-3 py-1">
          {formationRows
            ? `Formation: ${formation}`
            : "Position-based arrangement"}
        </span>
      </div>

      {/* FOOTBALL PITCH */}

      <div className="relative overflow-hidden rounded-lg border-2 border-white/50 bg-gradient-to-b from-green-800 to-green-950">
        {/* Pitch markings */}

        <div className="absolute inset-3 border border-white/50" />

        <div className="absolute left-0 right-0 top-1/2 border-t border-white/50" />

        <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50" />

        <div className="absolute left-1/2 top-0 h-16 w-44 max-w-[70%] -translate-x-1/2 border-b border-l border-r border-white/50" />

        <div className="absolute bottom-0 left-1/2 h-16 w-44 max-w-[70%] -translate-x-1/2 border-l border-r border-t border-white/50" />

        {/* Players */}

        <div className="relative z-10 flex min-h-[520px] flex-col justify-around gap-5 px-1 py-7 sm:px-3">
          {rows.map((row, rowIndex) => (
            <div
              key={`${row.label}-${rowIndex}`}
              className="grid w-full items-center justify-items-center gap-x-1 gap-y-3 sm:gap-x-3"
              style={{
                gridTemplateColumns: `repeat(${row.players.length}, minmax(0, 1fr))`,
              }}
            >
              {row.players.map((item, playerIndex) => (
                <div
                  key={`${item.player.id}-${playerIndex}`}
                  className="w-full min-w-0 max-w-[100px]"
                >
                  <PlayerMarker item={item} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* PITCH FOOTER */}

      <div className="mt-3 flex items-center justify-between text-xs text-green-100">
        <span className="font-bold tracking-wider">
          GOALKEEPER ↓
        </span>

        <span>{players.length} players displayed</span>
      </div>

      {/* POSITION SUMMARY */}

      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {rows.map((row, index) => (
          <div
            key={`${row.label}-${index}`}
            className="text-xs text-white"
          >
            <span className="font-bold">{row.label}:</span>{" "}
            {row.players.length}
          </div>
        ))}
      </div>

      {!formationRows && formation && (
        <p className="mt-3 text-center text-xs text-yellow-200">
          Formation layout unavailable. Players are grouped
          using their official position data instead.
        </p>
      )}

      {rows.some((row) => row.label === "Other players") && (
        <p className="mt-3 text-center text-xs text-yellow-200">
          Some players have unavailable or unrecognised position
          data. They are displayed separately.
        </p>
      )}
    </div>
  );
}