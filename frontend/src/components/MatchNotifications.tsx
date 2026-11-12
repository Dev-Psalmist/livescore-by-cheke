"use client";

import { useEffect, useRef, useState } from "react";

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

interface EventsResponse {
  success?: boolean;
  events?: MatchEvent[];
  error?: unknown;
}

interface MatchNotificationsProps {
  matchId: string;
  events: MatchEvent[];
  status: string;
  homeTeam: string;
  awayTeam: string;
}

const LIVE_EVENT_STATUSES = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE"];

const FINISHED_STATUSES = ["FT", "AET", "PEN"];

function getEventKey(event: MatchEvent): string {
  return [
    event.type,
    event.detail,
    event.time.elapsed,
    event.time.extra ?? "",
    event.team.name,
    event.player?.name ?? "",
  ].join("|");
}

function sendNotification(title: string, body: string, tag: string) {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  new Notification(title, {
    body,
    tag,
    icon: "/favicon.ico",
  });
}

export default function MatchNotifications({
  matchId,
  events,
  status,
  homeTeam,
  awayTeam,
}: MatchNotificationsProps) {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState("default");
  const [message, setMessage] = useState("");

  const seenEvents = useRef<Set<string>>(new Set());
  const eventsInitialised = useRef(false);
  const previousStatus = useRef(status.toUpperCase());

  // Seed existing events without notifying for moments that happened
  // before the user opened the Match Centre. Later updates are live events.
  useEffect(() => {
    if (!eventsInitialised.current) {
      for (const event of events) {
        seenEvents.current.add(getEventKey(event));
      }
      eventsInitialised.current = true;
      return;
    }

    for (const event of events) {
      const eventKey = getEventKey(event);
      if (seenEvents.current.has(eventKey)) continue;

      seenEvents.current.add(eventKey);
      if (!enabled) continue;

      const type = event.type.toLowerCase();
      const detail = event.detail.toLowerCase();
      const minute = `${event.time.elapsed}'${event.time.extra ? `+${event.time.extra}` : ""}`;

      if (type === "goal") {
        sendNotification(
          "GOAL!",
          `${event.team.name}: ${event.player?.name || "Unknown scorer"} (${minute})`,
          `${matchId}-${eventKey}`
        );
      }

      if (
        type === "card" &&
        (detail.includes("red") || detail.includes("second yellow"))
      ) {
        sendNotification(
          "Red card",
          `${event.team.name}: ${event.player?.name || "Unknown player"} (${minute})`,
          `${matchId}-${eventKey}`
        );
      }
    }
  }, [events, enabled, homeTeam, awayTeam, matchId]);

  // Read existing browser notification permission.
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("Notification" in window) {
      setPermission(Notification.permission);
    } else {
      setMessage("This browser does not support notifications.");
    }
  }, []);

  async function enableNotifications() {
    if (!("Notification" in window)) {
      setMessage("This browser does not support notifications.");
      return;
    }

    let result = Notification.permission;

    if (result === "default") {
      result = await Notification.requestPermission();
    }

    setPermission(result);

    if (result === "granted") {
      setEnabled(true);
      setMessage("Notifications are enabled for this match.");
    } else if (result === "denied") {
      setEnabled(false);
      setMessage(
        "Notifications are blocked. Allow them in your browser settings."
      );
    } else {
      setEnabled(false);
      setMessage("Notification permission was not granted.");
    }
  }

  function disableNotifications() {
    setEnabled(false);
    setMessage("Notifications are paused.");
  }

  // Detect half-time and full-time transitions.
  useEffect(() => {
    const currentStatus = status.toUpperCase();
    const oldStatus = previousStatus.current;

    if (currentStatus !== oldStatus && enabled) {
      if (currentStatus === "HT") {
        sendNotification(
          "Half-time",
          `${homeTeam} vs ${awayTeam} has reached half-time.`,
          `${matchId}-halftime`
        );
      }

      if (FINISHED_STATUSES.includes(currentStatus)) {
        sendNotification(
          "Full-time",
          `${homeTeam} vs ${awayTeam} — the match has finished.`,
          `${matchId}-fulltime`
        );
      }
    }

    previousStatus.current = currentStatus;
  }, [status, enabled, homeTeam, awayTeam, matchId]);

  const isLive = LIVE_EVENT_STATUSES.includes(status.toUpperCase());

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-[#111c2b] to-slate-950 shadow-lg">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              enabled
                ? "border-emerald-400/30 bg-emerald-400/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className={`h-5 w-5 ${
                enabled ? "text-emerald-400" : "text-slate-400"
              }`}
              aria-hidden="true"
            >
              <path
                d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-white">
                Match Notifications
              </h3>

              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                  enabled
                    ? "bg-emerald-400/10 text-emerald-400"
                    : "bg-slate-700/70 text-slate-400"
                }`}
              >
                {enabled ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Get instant browser alerts for goals, red cards,
              half-time and full-time.
            </p>

            <p className="mt-2 text-[10px] font-medium text-slate-500">
              {homeTeam} <span className="text-emerald-400">vs</span>{" "}
              {awayTeam}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {enabled ? (
            <button
              type="button"
              onClick={disableNotifications}
              className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-xs font-bold text-red-400 transition hover:border-red-500/60 hover:bg-red-500/20 sm:w-auto"
            >
              Turn Off Alerts
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void enableNotifications()}
              disabled={permission === "denied"}
              className="w-full rounded-xl bg-emerald-400 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              Enable Notifications
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-white/5 bg-black/10 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Goals
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              Red cards
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Half-time
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Full-time
            </span>
          </div>

          <span className="text-[10px] text-slate-500">
            {isLive
              ? "Live match events refresh automatically"
              : "Alerts activate when the match is live"}
          </span>
        </div>

        {message && (
          <p
            className="mt-3 border-t border-white/5 pt-3 text-xs text-slate-400"
            role="status"
          >
            {message}
          </p>
        )}

        {enabled && (
          <p className="mt-2 text-[10px] font-medium text-emerald-400">
            Browser notifications are enabled for this match.
          </p>
        )}
      </div>
    </section>
  );
}