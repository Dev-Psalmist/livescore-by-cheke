"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Live", href: "/live" },
  { label: "Fixtures", href: "/fixtures" },
  { label: "Leagues", href: "/leagues" },
  { label: "Teams", href: "/teams" },
  { label: "News", href: "/news" },
  { label: "Highlights", href: "/highlights" },
];

export default function Header() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#101820]/95 backdrop-blur-xl">
      <div className="border-b border-white/5 bg-[#0b1118]">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:px-6">
          <span>Global Sports Coverage</span>

          <span className="flex items-center gap-2 text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Every sport. Every moment.
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-5 px-4 py-4 sm:px-6">
        <Link href="/" className="group shrink-0" aria-label="LiveScore by Cheke home">
          <div className="text-xl font-black tracking-tighter text-white sm:text-2xl">
            LIVE<span className="text-emerald-400">SCORE</span>
          </div>

          <div className="mt-1 text-[9px] font-bold tracking-[0.35em] text-slate-400">
            BY CHEKE
          </div>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {navigation.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/search"
            className={`hidden rounded-lg border px-4 py-2 text-sm font-semibold transition sm:block ${
              isActive("/search")
                ? "border-emerald-500 text-emerald-400"
                : "border-white/10 text-slate-300 hover:border-emerald-500 hover:text-emerald-400"
            }`}
          >
            Search
          </Link>

          <Link
            href="/favourites"
            aria-current={isActive("/favourites") ? "page" : undefined}
            className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-black text-[#101820] transition hover:bg-emerald-400 sm:px-4 sm:text-sm"
          >
            ♥ Favourites
          </Link>
        </div>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="border-t border-white/5 lg:hidden"
      >
        <div className="mobile-nav-scroll flex items-center gap-2 overflow-x-auto px-4 py-3">
          {navigation.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                  active
                    ? "bg-emerald-500 text-[#101820]"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/search"
            aria-current={isActive("/search") ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
              isActive("/search")
                ? "bg-emerald-500 text-[#101820]"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            Search
          </Link>
        </div>
      </nav>
    </header>
  );
}