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
        {loading && <div className="space-y-3" aria-live="polite"><div className="h-32 animate-pulse rounded-lg bg-white/[0.06]" /><div className="h-14 animate-pulse rounded-lg bg-white/[0.06]" /><div className="h-14 animate-pulse rounded-lg bg-white/[0.06]" /></div>}
        {!loading && error && <div className="rounded-lg bg-white/[0.04] p-3 text-xs leading-5 text-slate-400">{error}<button onClick={() => { setLoading(true); void loadNews(); }} className="mt-2 block font-bold text-emerald-400">Try again</button></div>}
        {!loading && !error && !featured && <p className="p-3 text-xs text-slate-400">No football stories are available right now.</p>}

        {!loading && !error && featured && (
          <article>
            <a href={featured.link} target="_blank" rel="noopener noreferrer" className="group block">
              {featured.imageUrl ? <img src={featured.imageUrl} alt="" loading="lazy" className="h-40 w-full rounded-lg object-cover transition group-hover:opacity-90" /> : <div className="flex h-28 items-center justify-center rounded-lg bg-[#242629] text-3xl">⚽</div>}
              <p className="mt-3 text-[9px] font-bold uppercase tracking-wider text-emerald-400">{featured.source} · {timeAgo(featured.publishedAt)}</p>
              <h3 className="mt-1 text-sm font-extrabold leading-5 text-white group-hover:text-emerald-300">{featured.title}</h3>
              {featured.summary && <p className="mt-2 line-clamp-3 text-[11px] leading-5 text-slate-400">{featured.summary}</p>}
            </a>
          </article>
        )}

        {!loading && !error && remaining.length > 0 && (
          <div className="mt-3 divide-y divide-white/[0.07] border-t border-white/[0.08]">
            {remaining.map((article) => (
              <article key={article.id} className="py-3 first:pt-3 last:pb-1">
                <a href={article.link} target="_blank" rel="noopener noreferrer" className="group block">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">{article.source} · {timeAgo(article.publishedAt)}</p>
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
