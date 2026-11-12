import type { Metadata } from "next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import YouTubeHighlights from "@/components/YouTubeHighlights";

export const metadata: Metadata = {
  title: "Football Highlights | LiveScore by Cheke",
  description:
    "Watch official football match highlights and goal videos from approved YouTube channels.",
};

export default function HighlightsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />

      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40">
        <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-green-400">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Football Video Centre
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
              Relive Every
              <span className="block text-green-400">
                Big Moment.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              From spectacular goals to unforgettable match
              moments, catch up on the action with football
              highlights from official YouTube channels.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
                Match Highlights
              </span>

              <span className="rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
                Goals & Best Moments
              </span>

              <span className="rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
                Official Channels
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-400">
              Watch the Action
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Match Highlights
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Catch up on the biggest matches and unforgettable
              performances.
            </p>
          </div>

          <span className="rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-green-400">
            Full Highlights
          </span>
        </div>

        <YouTubeHighlights kind="full" limit={9} />
      </section>

      <section className="border-t border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-400">
                The Moments That Matter
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Goals & Best Moments
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Incredible finishes, decisive goals and moments
                worth watching again.
              </p>
            </div>

            <span className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-400">
              Goal Videos
            </span>
          </div>

          <YouTubeHighlights kind="goals" limit={9} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
