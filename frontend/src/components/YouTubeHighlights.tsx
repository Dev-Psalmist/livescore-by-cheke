"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type {
  HighlightKind,
  HighlightVideo,
  HighlightsResponse,
} from "@/types/highlights";

interface YouTubeHighlightsProps {
  kind?: HighlightKind;
  homeTeam?: string;
  awayTeam?: string;
  league?: string;
  limit?: number;
  compact?: boolean;
}

function formatPublishedDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "Africa/Lagos",
  }).format(date);
}

export default function YouTubeHighlights({
  kind = "all",
  homeTeam,
  awayTeam,
  league,
  limit,
  compact = false,
}: YouTubeHighlightsProps) {
  const [videos, setVideos] = useState<HighlightVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [failedSources, setFailedSources] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadHighlights() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({ kind });

        if (homeTeam) params.set("home", homeTeam);
        if (awayTeam) params.set("away", awayTeam);
        if (league) params.set("league", league);

        const response = await fetch(
          `/api/youtube/highlights?${params.toString()}`,
          { cache: "no-store" },
        );

        const data: HighlightsResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to retrieve highlights.",
          );
        }

        if (!cancelled) {
          setVideos(data.videos || []);
          setFailedSources(data.failedSources || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load YouTube highlights.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadHighlights();

    return () => {
      cancelled = true;
    };
  }, [kind, homeTeam, awayTeam, league]);

  const visibleVideos =
    typeof limit === "number"
      ? videos.slice(0, limit)
      : videos;

  const heading =
    kind === "full"
      ? "Full-Match Highlights"
      : kind === "goals"
        ? "Goal Highlights"
        : "Latest Football Highlights";

  return (
    <section className={compact ? "py-8" : "mx-auto max-w-7xl px-6 py-12"}>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-green-400">
            Official YouTube Videos
          </p>

          <h2 className="text-2xl font-black text-white md:text-3xl">
            {heading}
          </h2>

          {homeTeam && awayTeam && (
            <p className="mt-2 text-sm text-slate-400">
              {homeTeam} vs {awayTeam}
            </p>
          )}
        </div>

        {compact && (
          <Link
            href="/highlights"
            className="rounded-lg bg-green-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-green-400"
          >
            All Highlights →
          </Link>
        )}
      </div>

      {loading && (
        <div
          className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center"
          role="status"
        >
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-green-400" />
          <p className="text-sm text-slate-400">
            Finding official football highlights...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
          <h3 className="font-bold text-red-400">
            Highlights unavailable
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && visibleVideos.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
          <p className="text-4xl">🎬</p>
          <h3 className="mt-4 text-lg font-bold text-white">
            No Highlights Found
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            No matching videos are currently available from our approved channels.
          </p>
        </div>
      )}

      {!loading && !error && visibleVideos.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleVideos.map((video) => (
            <article
              key={video.id}
              className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition hover:border-green-500/60"
            >
              <div className="aspect-video bg-black">
                <iframe
                  src={video.embedUrl}
                  title={video.title}
                  className="h-full w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>

              <div className="p-5">
                <p className="mb-2 text-xs font-semibold text-green-400">
                  {video.channelTitle}
                </p>

                <h3 className="line-clamp-2 font-bold leading-6 text-white">
                  {video.title}
                </h3>

                <p className="mt-3 text-xs text-slate-500">
                  Published {formatPublishedDate(video.publishedAt)}
                </p>

                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-400 hover:text-green-300"
                >
                  Watch on YouTube ↗
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && failedSources.length > 0 && (
        <p className="mt-5 text-xs text-slate-500">
          Some sources could not be reached: {failedSources.join(", ")}.
        </p>
      )}
    </section>
  );
}
