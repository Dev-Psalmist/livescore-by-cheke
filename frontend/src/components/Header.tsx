"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#101820]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-5 px-4 py-4 sm:px-6">
        <Link href="/" className="group shrink-0" aria-label="LiveScore by Cheke home">
          <div className="text-xl font-black tracking-tighter text-white sm:text-2xl">
            LIVE<span className="text-emerald-400">SCORE</span>
          </div>

          <div className="mt-1 text-[9px] font-bold tracking-[0.35em] text-slate-400">
            BY CHEKE
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/search"
            className="hidden rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-emerald-500 hover:text-emerald-400 sm:block"
          >
            Search
          </Link>

          <Link
            href="/favourites"
            className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-black text-[#101820] transition hover:bg-emerald-400 sm:px-4 sm:text-sm"
          >
            ♥ Favourites
          </Link>
        </div>
      </div>

    </header>
  );
}