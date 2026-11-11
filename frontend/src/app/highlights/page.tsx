import type { Metadata } from "next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import YouTubeHighlights from "@/components/YouTubeHighlights";

export const metadata: Metadata = {
  title: "Football Highlights",
  description:
    "Watch official football match highlights and goal videos from approved YouTube channels.",
};

export default function HighlightsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />

      <section className="border-b border-slate-800 bg-gradient-to-br from-green-950 via-slate-950 to-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-green-400">
            LiveScore by Cheke
          </p>

          <h1 className="text-4xl font-black md:text-6xl">
            Football Highlights
          </h1>

          <p className="mt-5 max-w-2xl leading-8 text-slate-300">
            Relive the important moments, watch match highlights
            and catch up on goals from official football channels.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6">
        <YouTubeHighlights kind="full" limit={9} />

        <div className="border-t border-slate-800">
          <YouTubeHighlights kind="goals" limit={9} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
