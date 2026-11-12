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
  position: string;
  players: LineupPlayer[];
}

type PositionGroup = "F" | "M" | "D" | "G" | "OTHER";

const POSITION_LABELS: Record<PositionGroup, string> = {
  F: "Forwards",
  M: "Midfielders",
  D: "Defenders",
  G: "Goalkeeper",
  OTHER: "Other players",
};

function getPosition(position: string): PositionGroup {
  const normalized = position?.trim().toUpperCase() || "";

  if (["F", "FW", "FWD", "FORWARD", "ATTACKER"].includes(normalized)) {
    return "F";
  }

  if (["M", "MF", "MID", "MIDFIELDER"].includes(normalized)) {
    return "M";
  }

  if (["D", "DF", "DEF", "DEFENDER"].includes(normalized)) {
    return "D";
  }

  if (["G", "GK", "GOALKEEPER"].includes(normalized)) {
    return "G";
  }

  return "OTHER";
}

function groupPlayers(players: LineupPlayer[]) {
  return {
    F: players.filter((item) => getPosition(item.player.pos) === "F"),
    M: players.filter((item) => getPosition(item.player.pos) === "M"),
    D: players.filter((item) => getPosition(item.player.pos) === "D"),
    G: players.filter((item) => getPosition(item.player.pos) === "G"),
    OTHER: players.filter((item) => getPosition(item.player.pos) === "OTHER"),
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

  const goalkeeper = [...groups.G];
  const defenders = [...groups.D];
  const midfielders = [...groups.M];
  const forwards = [...groups.F];

  const rows: PlayerRow[] = [];

  // Formation is written defence-to-attack,
  // but the pitch displays attack at the top.
  const attackingToDefending = [...formationNumbers].reverse();

  for (let index = 0; index < attackingToDefending.length; index++) {
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
      position,
      players: selectedPlayers,
    });
  }

  // A valid formation must account for every starting player.
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
    position: "G",
    players: goalkeeper,
  });

  return rows;
}

function buildPositionRows(players: LineupPlayer[]): PlayerRow[] {
  const groups = groupPlayers(players);

  const order: PositionGroup[] = ["F", "M", "D", "G", "OTHER"];

  return order
    .filter((position) => groups[position].length > 0)
    .map((position) => ({
      label: POSITION_LABELS[position],
      position,
      players: groups[position],
    }));
}

function PlayerMarker({ item }: { item: LineupPlayer }) {
  const player = item.player;

  return (
    <div
      className="group flex min-w-0 flex-col items-center text-center"
      title={`${player.name} · ${player.pos || "Position unavailable"}`}
    >
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white/90 bg-white text-sm font-black text-emerald-950 shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition duration-200 group-hover:scale-110 group-hover:border-emerald-300 sm:h-10 sm:w-10">
        {player.number ?? "—"}
      </div>

      <span className="mt-1.5 block w-full max-w-[100px] break-words rounded-md border border-white/10 bg-slate-950/90 px-1.5 py-1 text-[9px] font-semibold leading-tight text-white shadow-md sm:text-[10px]">
        {player.name}
      </span>

      <span className="mt-0.5 text-[8px] font-medium uppercase tracking-wider text-emerald-100/70">
        {player.pos || "N/A"}
      </span>
    </div>
  );
}

export default function LineupPitch({
  players,
  formation,
}: LineupPitchProps) {
  if (!players || players.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-2xl">
          ⚽
        </div>
        <p className="text-sm font-semibold text-white">
          Starting lineup unavailable
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Player formation data has not been provided for this team.
        </p>
      </div>
    );
  }

  const formationRows = buildFormationRows(players, formation);
  const rows = formationRows ?? buildPositionRows(players);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-900/80 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
            Tactical formation
          </p>
          <h3 className="mt-1 text-sm font-bold text-white">
            Starting XI
          </h3>
        </div>

        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
          {formationRows
            ? formation
            : "Position-based arrangement"}
        </span>
      </div>

      {/* Pitch */}
      <div className="p-3 sm:p-5">
        <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
          <span>Attack</span>
          <span>↑</span>
        </div>

        <div className="relative isolate overflow-hidden rounded-xl border-2 border-white/35 bg-gradient-to-b from-[#176b45] via-[#105638] to-[#0b422e]">
          {/* Pitch grass stripes */}
          <div className="pointer-events-none absolute inset-0 -z-10 grid grid-rows-6 opacity-20">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={index % 2 === 0 ? "bg-white/10" : ""}
              />
            ))}
          </div>

          {/* Pitch boundary */}
          <div className="pointer-events-none absolute inset-3 rounded-sm border border-white/40" />

          {/* Halfway line */}
          <div className="pointer-events-none absolute left-3 right-3 top-1/2 border-t border-white/40" />

          {/* Centre circle */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 sm:h-32 sm:w-32" />

          {/* Centre spot */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />

          {/* Top penalty area */}
          <div className="pointer-events-none absolute left-1/2 top-3 h-16 w-40 max-w-[65%] -translate-x-1/2 border-b border-l border-r border-white/40 sm:h-20 sm:w-48" />

          {/* Bottom penalty area */}
          <div className="pointer-events-none absolute bottom-3 left-1/2 h-16 w-40 max-w-[65%] -translate-x-1/2 border-l border-r border-t border-white/40 sm:h-20 sm:w-48" />

          {/* Goal areas */}
          <div className="pointer-events-none absolute left-1/2 top-3 h-6 w-20 max-w-[35%] -translate-x-1/2 border-b border-l border-r border-white/30 sm:w-24" />

          <div className="pointer-events-none absolute bottom-3 left-1/2 h-6 w-20 max-w-[35%] -translate-x-1/2 border-l border-r border-t border-white/30 sm:w-24" />

          {/* Players */}
          <div className="relative z-10 flex min-h-[510px] flex-col justify-around gap-5 px-1 py-8 sm:min-h-[590px] sm:px-4 sm:py-9">
            {rows.map((row, rowIndex) => (
              <div
                key={`${row.position}-${rowIndex}`}
                className="grid w-full items-center justify-items-center gap-x-1 gap-y-3 sm:gap-x-3"
                style={{
                  gridTemplateColumns: `repeat(${row.players.length}, minmax(0, 1fr))`,
                }}
              >
                {row.players.map((item, playerIndex) => (
                  <div
                    key={`${item.player.id}-${playerIndex}`}
                    className="w-full min-w-0"
                  >
                    <PlayerMarker item={item} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
          <span>↓</span>
          <span>Goalkeeper</span>
        </div>
      </div>

      {/* Position summary */}
      <div className="border-t border-white/10 bg-slate-900/70 px-4 py-4">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-5">
          {rows.map((row, index) => (
            <div
              key={`${row.position}-${index}`}
              className="flex items-center gap-2 text-xs"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-slate-400">{row.label}</span>
              <span className="font-bold text-white">
                {row.players.length}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-3 text-center text-[10px] text-slate-500">
          {players.length} players displayed
        </p>

        {!formationRows && formation && (
          <p className="mt-3 text-center text-xs text-amber-300">
            Formation layout unavailable. Players are grouped using their
            position data instead.
          </p>
        )}

        {rows.some((row) => row.position === "OTHER") && (
          <p className="mt-3 text-center text-xs text-amber-300">
            Some players have unrecognised position data and are displayed
            separately.
          </p>
        )}
      </div>
    </div>
  );
}