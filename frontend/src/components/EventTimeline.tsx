"use client";

import { useState } from "react";

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

interface EventTimelineProps {
  events: MatchEvent[];
  homeTeam: string;
  awayTeam: string;
}

type EventFilter = "all" | "goals" | "cards" | "substitutions" | "var";

function getMinuteLabel(event: MatchEvent): string {
  return `${event.time.elapsed}'${
    event.time.extra ? `+${event.time.extra}` : ""
  }`;
}

function getEventIcon(event: MatchEvent): string {
  const type = event.type.toLowerCase();
  const detail = event.detail.toLowerCase();

  if (type === "goal") {
    if (detail.includes("own goal")) return "🥅";
    return "⚽";
  }

  if (type === "card") {
    if (detail.includes("red")) return "🟥";
    if (detail.includes("yellow")) return "🟨";
    return "🃏";
  }

  if (type === "subst") return "🔄";
  if (type === "var") return "📺";

  return "📌";
}

function getEventStyle(event: MatchEvent): string {
  const type = event.type.toLowerCase();
  const detail = event.detail.toLowerCase();

  if (type === "goal") {
    return "border-green-500/30 bg-green-500/10";
  }

  if (type === "card" && detail.includes("red")) {
    return "border-red-500/30 bg-red-500/10";
  }

  if (type === "card") {
    return "border-yellow-500/30 bg-yellow-500/10";
  }

  if (type === "subst") {
    return "border-blue-500/30 bg-blue-500/10";
  }

  return "border-white/10 bg-[#172638]";
}

function getEventTitle(event: MatchEvent): string {
  const type = event.type.toLowerCase();

  if (type === "goal") return "GOAL";
  if (type === "card") return event.detail.toUpperCase();
  if (type === "subst") return "SUBSTITUTION";
  if (type === "var") return "VAR";

  return event.type.toUpperCase();
}

function getGoalDescription(event: MatchEvent): string {
  const detail = event.detail.toLowerCase();

  if (detail.includes("own goal")) return "Own Goal";
  if (detail.includes("penalty")) return "Penalty";

  return "Goal";
}

function GoalScorer({
  event,
}: {
  event: MatchEvent;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/5 py-3 last:border-0">
      <div className="min-w-0">
        <p className="break-words text-sm font-bold text-white">
          ⚽ {event.player?.name || "Unknown scorer"}
        </p>

        <p className="mt-1 text-xs text-gray-400">
          {getGoalDescription(event)}
          {event.assist?.name
            ? ` · Assist: ${event.assist.name}`
            : ""}
        </p>
      </div>

      <span className="shrink-0 rounded-md bg-green-500/10 px-2 py-1 text-xs font-bold text-green-400">
        {getMinuteLabel(event)}
      </span>
    </div>
  );
}

export default function EventTimeline({
  events,
  homeTeam,
  awayTeam,
}: EventTimelineProps) {
  // NEW: Track the currently selected event filter.
  const [activeFilter, setActiveFilter] =
    useState<EventFilter>("all");

  const sortedEvents = [...events].sort((a, b) => {
    const firstMinute =
      a.time.elapsed * 100 + (a.time.extra ?? 0);

    const secondMinute =
      b.time.elapsed * 100 + (b.time.extra ?? 0);

    return firstMinute - secondMinute;
  });

  const goalEvents = sortedEvents.filter(
    (event) => event.type.toLowerCase() === "goal"
  );

  const homeGoals = goalEvents.filter(
    (event) =>
      event.team.name.toLowerCase() === homeTeam.toLowerCase()
  );

  const awayGoals = goalEvents.filter(
    (event) =>
      event.team.name.toLowerCase() === awayTeam.toLowerCase()
  );

  // NEW: Filter events without changing the original event collection.
  const filteredEvents = sortedEvents.filter((event) => {
    const type = event.type.toLowerCase();

    switch (activeFilter) {
      case "goals":
        return type === "goal";

      case "cards":
        return type === "card";

      case "substitutions":
        return type === "subst" || type === "substitution";

      case "var":
        return type === "var";

      case "all":
      default:
        return true;
    }
  });

  // NEW: Filter button definitions.
  const filters: {
    label: string;
    value: EventFilter;
    icon: string;
  }[] = [
    { label: "All Events", value: "all", icon: "📋" },
    { label: "Goals", value: "goals", icon: "⚽" },
    { label: "Cards", value: "cards", icon: "🟨" },
    {
      label: "Substitutions",
      value: "substitutions",
      icon: "🔄",
    },
    { label: "VAR", value: "var", icon: "📺" },
  ];

  return (
    <section className="space-y-6">
      {/* GOAL SCORERS SUMMARY */}

      <div className="rounded-xl border border-white/10 bg-[#111c2b] p-5 md:p-7">
        <div className="mb-5">
          <h3 className="text-lg font-bold">
            Goal Scorers
          </h3>

          <p className="mt-1 text-xs text-gray-400">
            Scoring information recorded by the match data provider.
          </p>
        </div>

        {goalEvents.length === 0 ? (
          <p className="py-5 text-center text-sm text-gray-400">
            No goal events have been returned for this match.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* HOME TEAM SCORERS */}

            <div>
              <h4 className="mb-2 border-b border-white/10 pb-3 text-sm font-bold text-green-400">
                {homeTeam}
              </h4>

              {homeGoals.length === 0 ? (
                <p className="py-3 text-sm text-gray-500">
                  No goal events recorded.
                </p>
              ) : (
                homeGoals.map((event, index) => (
                  <GoalScorer
                    key={`home-goal-${event.time.elapsed}-${index}`}
                    event={event}
                  />
                ))
              )}
            </div>

            {/* AWAY TEAM SCORERS */}

            <div>
              <h4 className="mb-2 border-b border-white/10 pb-3 text-sm font-bold text-blue-400">
                {awayTeam}
              </h4>

              {awayGoals.length === 0 ? (
                <p className="py-3 text-sm text-gray-500">
                  No goal events recorded.
                </p>
              ) : (
                awayGoals.map((event, index) => (
                  <GoalScorer
                    key={`away-goal-${event.time.elapsed}-${index}`}
                    event={event}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* MATCH TIMELINE */}

      <div className="rounded-xl border border-white/10 bg-[#111c2b] p-5 md:p-7">
        <div className="mb-8">
          <h3 className="text-lg font-bold">
            Match Timeline
          </h3>

          <p className="mt-1 text-xs text-gray-400">
            Official events recorded during the match.
          </p>
        </div>

        {/* NEW: INTERACTIVE EVENT FILTERS */}

        <div className="mb-7">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Filter events
          </p>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  aria-pressed={isActive}
                  className={`rounded-lg border px-3 py-2 text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? "border-green-500 bg-green-500/15 text-green-400"
                      : "border-white/10 bg-[#172638] text-gray-400 hover:border-white/30 hover:text-white"
                  }`}
                >
                  <span className="mr-1.5">{filter.icon}</span>
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {sortedEvents.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mb-3 text-3xl">⚽</div>

            <h4 className="font-bold">
              No Match Events Yet
            </h4>

            <p className="mt-2 text-sm text-gray-400">
              Official match events are not currently available.
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          // NEW: Empty state for a filter with no matching events.
          <div className="rounded-lg border border-white/10 bg-[#172638] py-8 text-center">
            <div className="mb-3 text-3xl">🔎</div>

            <h4 className="font-bold text-white">
              No {filters.find((filter) => filter.value === activeFilter)?.label} Found
            </h4>

            <p className="mt-2 text-sm text-gray-400">
              There are no recorded events in this category.
            </p>

            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-bold text-green-400 transition hover:bg-green-500/20"
            >
              Show All Events
            </button>
          </div>
        ) : (
          <>
            {/* TEAM HEADERS */}

            <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-bold">
              <span className="text-left text-green-400">
                {homeTeam}
              </span>

              <span className="text-gray-500">
                MINUTE
              </span>

              <span className="text-right text-blue-400">
                {awayTeam}
              </span>
            </div>

            {/* TIMELINE */}

            <div className="relative space-y-5">
              <div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-white/10" />

              {filteredEvents.map((event, index) => {
                const isHome =
                  event.team.name.toLowerCase() ===
                  homeTeam.toLowerCase();

                const isAway =
                  event.team.name.toLowerCase() ===
                  awayTeam.toLowerCase();

                const icon = getEventIcon(event);
                const style = getEventStyle(event);
                const title = getEventTitle(event);

                const eventCard = (
                  <div
                    className={`rounded-lg border p-3 ${style}`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-lg">{icon}</span>

                      <span className="text-[10px] font-black tracking-wide text-gray-300">
                        {title}
                      </span>
                    </div>

                    <p className="break-words text-sm font-bold text-white">
                      {event.player?.name || event.detail}
                    </p>

                    {event.type.toLowerCase() === "subst" &&
                      event.assist?.name && (
                        <p className="mt-1 text-xs text-gray-400">
                          Replaced: {event.assist.name}
                        </p>
                      )}

                    {event.type.toLowerCase() === "goal" &&
                      event.assist?.name && (
                        <p className="mt-1 text-xs text-gray-400">
                          Assist: {event.assist.name}
                        </p>
                      )}

                    {event.comments && (
                      <p className="mt-2 text-xs text-gray-400">
                        {event.comments}
                      </p>
                    )}

                    {event.detail &&
                      event.type.toLowerCase() !== "card" && (
                        <p className="mt-1 text-[10px] text-gray-500">
                          {event.detail}
                        </p>
                      )}
                  </div>
                );

                return (
                  <div
                    key={`${event.time.elapsed}-${event.type}-${index}`}
                    className="relative grid grid-cols-[1fr_54px_1fr] items-center gap-2"
                  >
                    {/* HOME SIDE */}

                    <div className="flex justify-end">
                      {isHome && (
                        <div className="w-full max-w-[260px]">
                          {eventCard}
                        </div>
                      )}
                    </div>

                    {/* MATCH MINUTE */}

                    <div className="relative z-10 flex justify-center">
                      <span className="flex min-h-9 min-w-11 items-center justify-center rounded-full border border-white/20 bg-[#26384c] px-2 text-xs font-black text-green-400">
                        {getMinuteLabel(event)}
                      </span>
                    </div>

                    {/* AWAY SIDE */}

                    <div className="flex justify-start">
                      {isAway && (
                        <div className="w-full max-w-[260px]">
                          {eventCard}
                        </div>
                      )}

                      {!isHome && !isAway && (
                        <div className="w-full max-w-[260px] rounded-lg border border-white/10 bg-[#172638] p-3">
                          <p className="text-xs font-bold text-gray-300">
                            {event.team.name}
                          </p>

                          <p className="mt-1 text-sm text-white">
                            {event.detail}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* TIMELINE FOOTER */}

        <div className="mt-8 border-t border-white/10 pt-5">
          <div className="flex flex-wrap justify-center gap-5 text-xs text-gray-400">
            <span>⚽ Goals</span>
            <span>🟨 Yellow cards</span>
            <span>🟥 Red cards</span>
            <span>🔄 Substitutions</span>
            <span>📺 VAR</span>
          </div>

          <p className="mt-4 text-center text-xs text-gray-500">
            {filteredEvents.length} of {sortedEvents.length} recorded events shown
          </p>
        </div>
      </div>
    </section>
  );
}
