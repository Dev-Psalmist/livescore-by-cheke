import type { Metadata } from "next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsFeed from "@/components/NewsFeed";

export const metadata: Metadata = {
  title: "Football News",
  description:
    "Read the latest football headlines, transfer stories and news from around the world.",
};

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />

      <section className="border-b border-slate-800 bg-gradient-to-br from-green-950 via-slate-950 to-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-green-400">
            LiveScore by Cheke
          </p>

          <h1 className="text-3xl font-black sm:text-4xl md:text-6xl">
            Football News
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 sm:text-base sm:leading-8 text-slate-300">
            The latest headlines, transfer developments and
            football stories from around the world, gathered
            in one place.
          </p>
        </div>
      </section>

      <NewsFeed />

      <Footer />
    </main>
  );
}