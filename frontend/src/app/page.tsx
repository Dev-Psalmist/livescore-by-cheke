"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DateFixtureBrowser from "@/components/DateFixtureBrowser";
import PopularCompetitions from "@/components/PopularCompetitions";
import NewsSidebar from "@/components/NewsSidebar";
import YouTubeHighlights from "@/components/YouTubeHighlights";
import { useFavourites } from "@/hooks/useFavourites";
import { useFavouriteLeagues } from "@/hooks/useFavouriteLeagues";

export default function HomePage() {
  const { favourites, loaded: favouritesLoaded } = useFavourites();
  const { favourites: followedLeagues, loaded: followedLeaguesLoaded } = useFavouriteLeagues();

  return (
    <main className="min-h-screen bg-[#101214] text-white">
      <Header />

      <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 lg:px-6 lg:py-6">
        <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[210px_minmax(420px,1fr)] xl:grid-cols-[220px_minmax(480px,1fr)_320px]">
          <aside className="hidden min-w-0 lg:block">
            <div className="sticky top-[112px]">
              <PopularCompetitions />
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">LiveScore by Cheke</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Football Scores</h1>
                <p className="mt-1 text-xs text-slate-400">Live scores, results and upcoming fixtures from competitions around the world.</p>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <Link href="/live" className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-400/50 hover:text-emerald-300">Live now</Link>
                <Link href="/fixtures" className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-400/50 hover:text-emerald-300">All fixtures</Link>
              </div>
            </div>

            {favouritesLoaded && favourites.length > 0 && (
              <div className="mb-4 rounded-xl border border-white/[0.08] bg-[#181a1d] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-xs font-bold text-white">Your teams</h2>
                  <Link href="/favourites" className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300">Manage</Link>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {favourites.slice(0, 12).map((item) => (
                    <Link key={item.team.id} href="/favourites" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#242629] px-3 py-2 text-xs font-medium text-slate-200 hover:bg-[#303337]">
                      {item.team.logo && <img src={item.team.logo} alt="" className="h-4 w-4 object-contain" />}
                      {item.team.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {followedLeaguesLoaded && followedLeagues.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {followedLeagues.slice(0, 8).map((item) => (
                  <Link key={item.league.id} href={`/leagues?league=${item.league.id}`} className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#181a1d] px-3 py-2 text-[11px] text-slate-300 hover:border-emerald-400/40">
                    {item.league.logo && <img src={item.league.logo} alt="" className="h-4 w-4 object-contain" />}
                    {item.league.name}
                  </Link>
                ))}
              </div>
            )}

            <DateFixtureBrowser />
          </section>

          <aside className="hidden min-w-0 xl:block">
            <div className="sticky top-[112px]">
              <NewsSidebar />
            </div>
          </aside>
        </div>

        <section className="mt-8 xl:hidden">
          <NewsSidebar />
        </section>

        <section className="mt-8">
          <YouTubeHighlights kind="all" limit={6} />
        </section>
      </div>
      <Footer />
    </main>
  );
}
