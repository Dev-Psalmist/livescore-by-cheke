"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { NewsArticle } from "@/types/news";

interface NewsResponse {
  success?: boolean;
  articles?: NewsArticle[];
  error?: string;
}

function timeAgo(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return minutes <= 1 ? "Just now" : `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function NewsImage({
  article,
  featured = false,
}: {
  article: NewsArticle;
  featured?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const imageHeight = featured ? "h-40" : "h-28";

  if (!article.imageUrl || failed) {
    return (
      <div
        role="img"
        aria-label={`Football news image unavailable for: ${article.title}`}
        className={`relative flex ${imageHeight} w-full items-center justify-center overflow-hidden rounded-lg border border-white/[0.06] bg-[radial-gradient(ellipse_at_50%_20%,rgba(0,230,118,0.20),transparent_65%),linear-gradient(135deg,#202b29,#111719)]`}
      >
        <span aria-hidden="true" className="text-4xl opacity-70">⚽</span>
        <span className="absolute bottom-2 left-3 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300/80">
          Around the game
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={article.imageUrl}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${imageHeight} w-full rounded-lg object-cover transition duration-300 group-hover:scale-[1.02] group-hover:opacity-90`}
    />
  );
}

export default function NewsSidebar() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNews = useCallback(async () => {
    try {
      const response = await fetch("/api/football/news", { cache: "no-store" });
      const data: NewsResponse = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "News is temporarily unavailable.");
      setArticles(data.articles || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "News is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNews();
    const timer = window.setInterval(() => void loadNews(), 10 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [loadNews]);

  const featured = articles[0];
  const remaining = articles.slice(1, 7);

  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#181a1d]">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-400">Around the game</p>
          <h2 className="mt-1 text-base font-extrabold text-white">Football News</h2>
        </div>
        <Link href="/news" className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300">All news →</Link>
      </div>

      <div className="p-3">
        {loading && (
          <div className="space-y-3" aria-live="polite">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-32 animate-pulse rounded-lg bg-white/[0.06]" />
                <div className="h-4 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.06]" />
              </div>
            ))}
          </div>
        )}
        {!loading && error && (
          <div className="rounded-lg bg-white/[0.04] p-3 text-xs leading-5 text-slate-400">
            {error}
            <button onClick={() => { setLoading(true); void loadNews(); }} className="mt-2 block font-bold text-emerald-400">Try again</button>
          </div>
        )}
        {!loading && !error && !featured && <p className="p-3 text-xs text-slate-400">No football stories are available right now.</p>}

        {!loading && !error && featured && (
          <article className="border-b border-white/[0.08] pb-4">
            <a href={featured.link} target="_blank" rel="noopener noreferrer" className="group block">
              <NewsImage article={featured} featured />
              <p className="mt-3 text-[9px] font-bold uppercase tracking-wider text-emerald-400">{featured.source} · {timeAgo(featured.publishedAt)}</p>
              <h3 className="mt-1 text-sm font-extrabold leading-5 text-white group-hover:text-emerald-300">{featured.title}</h3>
              {featured.summary && <p className="mt-2 line-clamp-3 text-[11px] leading-5 text-slate-400">{featured.summary}</p>}
            </a>
          </article>
        )}

        {!loading && !error && remaining.length > 0 && (
          <div className="space-y-4 pt-4">
            {remaining.map((article) => (
              <article key={article.id}>
                <a href={article.link} target="_blank" rel="noopener noreferrer" className="group block">
                  <NewsImage article={article} />
                  <p className="mt-2 text-[9px] font-semibold uppercase tracking-wide text-slate-500">{article.source} · {timeAgo(article.publishedAt)}</p>
                  <h3 className="mt-1 text-xs font-bold leading-5 text-slate-200 group-hover:text-emerald-300">{article.title}</h3>
                </a>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
