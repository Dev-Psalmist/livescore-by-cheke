import type { Metadata } from "next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsFeed from "@/components/NewsFeed";

export const metadata: Metadata = {
  title: "Football News | LiveScore by Cheke",
  description:
    "Read the latest football headlines, transfer stories and news from around the world.",
};

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />

      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40">
        <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              The Football Newsroom
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
              The Game
              <span className="block text-green-400">
                Beyond the Score.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              Stay connected to the stories shaping football.
              Follow the latest headlines, transfer developments,
              club updates and major moments from across the
              global game.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
                Latest Headlines
              </span>

              <span className="rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
                Transfer Updates
              </span>

              <span className="rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
                Club Stories
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-400">
              Around the Football World
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Latest Football Stories
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Your daily connection to the beautiful game.
            </p>
          </div>

          <div className="rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-green-400">
            LiveScore News
          </div>
        </div>

        <NewsFeed />
      </section>

      <Footer />
    </main>
  );
}