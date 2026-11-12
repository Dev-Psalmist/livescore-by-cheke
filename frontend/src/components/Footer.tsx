"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const exploreLinks = [
    { label: "Home", href: "/" },
    { label: "Live Scores", href: "/live" },
    { label: "Fixtures", href: "/fixtures" },
    { label: "Leagues", href: "/leagues" },
    { label: "Teams", href: "/teams" },
    { label: "News", href: "/news" },
    { label: "Highlights", href: "/highlights" },
    { label: "Search", href: "/search" },
    { label: "Favourites", href: "/favourites" },
  ];

  return (
    <footer className="mt-16 border-t border-white/10 bg-[#080d13] text-slate-400">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Link href="/" className="inline-flex flex-col">
            <span className="text-xl font-black tracking-[0.18em] text-white">
              LIVESCORE
            </span>
            <span className="text-xs font-bold tracking-[0.35em] text-emerald-400">
              BY CHEKE
            </span>
          </Link>

          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-400">
            Every sport. Every moment. Your destination for live scores,
            fixtures, competitions and sports updates.
          </p>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
            Explore
          </h3>

          <div className="grid grid-cols-2 gap-x-5 gap-y-3">
            {exploreLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm transition-colors hover:text-emerald-400"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
            Our Promise
          </h3>

          <p className="text-sm leading-7 text-slate-400">
            Bringing sports closer to you with match information, performance
            insights and updates from around the world.
          </p>

          <p className="mt-5 text-xs font-bold tracking-[0.2em] text-emerald-400">
            EVERY SPORT. EVERY MOMENT.
          </p>
        </div>
      </div>

      <div className="border-t border-white/5 px-5 py-5 text-center text-xs text-slate-600">
        © {year} LiveScore by Cheke. All rights reserved.
      </div>
    </footer>
  );
}