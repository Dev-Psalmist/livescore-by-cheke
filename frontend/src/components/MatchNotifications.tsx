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

const LIVE_EVENT_STATUSES = [
  "1H",
  "2H",
  "ET",
  "BT",
  "P",
  "LIVE",
];

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

  // Record the events already present when the Match Centre opens.
  // This prevents old goals and cards from triggering notifications.
  useEffect(() => {
    if (eventsInitialised.current) return;

    for (const event of events) {
      seenEvents.current.add(getEventKey(event));
    }

    eventsInitialised.current = true;
  }, [events]);

  // Read the browser's existing notification permission.
  useEffect(() => {
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

  // Detect half-time and full-time transitions using the existing
  // five-second match-status refresh.
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

  // Check for newly recorded goals and red cards every 30 seconds.
  // This runs only when notifications are enabled and the match is live.
  useEffect(() => {
    if (!enabled || !LIVE_EVENT_STATUSES.includes(status.toUpperCase())) {
      return;
    }

    let cancelled = false;
    let requestInFlight = false;

    async function refreshEvents() {
      if (requestInFlight || cancelled) return;

      requestInFlight = true;

      try {
        const response = await fetch(
          `/api/football/match-events?id=${encodeURIComponent(matchId)}`,
          { cache: "no-store" }
        );

        const data: EventsResponse = await response.json();

        if (!response.ok || !data.success || !Array.isArray(data.events)) {
          throw new Error("Unable to retrieve the latest match events.");
        }

        if (cancelled) return;

        for (const event of data.events) {
          const eventKey = getEventKey(event);

          if (seenEvents.current.has(eventKey)) {
            continue;
          }

          // Mark every newly seen event so it cannot be processed twice.
          seenEvents.current.add(eventKey);

          const type = event.type.toLowerCase();
          const detail = event.detail.toLowerCase();
          const minute = `${event.time.elapsed}'${
            event.time.extra ? `+${event.time.extra}` : ""
          }`;

          if (type === "goal") {
            const scorer = event.player?.name || "Unknown scorer";

            sendNotification(
              "GOAL!",
              `${event.team.name}: ${scorer} (${minute})`,
              `${matchId}-${eventKey}`
            );
          }

          if (
            type === "card" &&
            (detail.includes("red") || detail.includes("second yellow"))
          ) {
            const player = event.player?.name || "Unknown player";

            sendNotification(
              "Red card",
              `${event.team.name}: ${player} (${minute})`,
              `${matchId}-${eventKey}`
            );
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Match notification event check failed:", error);
        }
      } finally {
        requestInFlight = false;
      }
    }

    // Check immediately when notifications become active,
    // then continue checking every 30 seconds.
    void refreshEvents();

    const interval = window.setInterval(refreshEvents, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [enabled, matchId, status]);

  return (
    <section className="mb-6 rounded-xl border border-white/10 bg-[#111c2b] p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-bold text-white">
            Match Notifications
          </h3>

          <p className="mt-1 text-xs text-gray-400">
            Get alerts for goals, red cards, half-time and full-time.
          </p>
        </div>

        {enabled ? (
          <button
            type="button"
            onClick={disableNotifications}
            className="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10"
          >
            Turn Off
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void enableNotifications()}
            disabled={permission === "denied"}
            className="rounded-lg bg-green-500 px-4 py-2 text-sm font-bold text-black hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enable Notifications
          </button>
        )}
      </div>

      {message && (
        <p className="mt-3 text-xs text-gray-400" role="status">
          {message}
        </p>
      )}

      {enabled && (
        <p className="mt-3 text-xs text-green-400">
          Notifications are active. New match events are checked every
          30 seconds while the match is live.
        </p>
      )}
    </section>
  );
}
