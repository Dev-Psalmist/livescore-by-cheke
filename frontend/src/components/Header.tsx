"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthNavigation from "@/components/auth/AuthNavigation";

const navLinks = [
  { label: "Home", href: "/" }, { label: "Live", href: "/live" },
  { label: "Fixtures", href: "/fixtures" }, { label: "Leagues", href: "/leagues" },
  { label: "Teams", href: "/teams" }, { label: "News", href: "/news" },
  { label: "Highlights", href: "/highlights" }, { label: "Search", href: "/search" },
  { label: "Favourites", href: "/favourites" },
];
const mobileLinks = [
  { label: "Home", href: "/", icon: "⌂" },
  { label: "Live", href: "/live", icon: "●" },
  { label: "Fixtures", href: "/fixtures", icon: "▦" },
  { label: "Favourites", href: "/favourites", icon: "♥" },
  { label: "Leagues", href: "/leagues", icon: "♜" },
];
function isCurrent(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}
function PrimaryNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary navigation" className="desktop-primary-navigation border-t border-white/[0.06]">
      <div className="mobile-nav-scroll mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto px-3 py-2 sm:px-6">
        {navLinks.map((item) => {
          const active = isCurrent(pathname, item.href);
          return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${active ? "bg-emerald-500/10 text-emerald-300" : "text-slate-400 hover:bg-white/[0.05] hover:text-white"}`}>
            {item.label}
          </Link>;
        })}
      </div>
    </nav>
  );
}
function NavigationFallback() {
  return <nav aria-label="Primary navigation" className="desktop-primary-navigation border-t border-white/[0.06]">
    <div className="mobile-nav-scroll mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto px-3 py-2 sm:px-6">
      {navLinks.map((item) => <Link key={item.href} href={item.href} className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400">{item.label}</Link>)}
    </div>
  </nav>;
}
function MobileBottomNavigation() {
  const pathname = usePathname();
  return <nav aria-label="Mobile navigation" className="mobile-bottom-nav">
    {mobileLinks.map((item) => {
      const active = isCurrent(pathname, item.href);
      return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
        <span className="mobile-nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
      </Link>;
    })}
  </nav>;
}
export default function Header() {
  return <>
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#101820]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-5 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="group relative isolate flex shrink-0 items-center overflow-hidden rounded-xl border border-white/[0.10] bg-white/[0.035] px-2 py-1 shadow-[0_0_24px_rgba(0,230,118,0.08)] backdrop-blur-xl transition duration-300 hover:border-emerald-400/30 hover:shadow-[0_0_30px_rgba(0,230,118,0.16)]"
          aria-label="LiveScore by Cheke home"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_25%_50%,rgba(0,230,118,0.13),transparent_65%)]"
          />
          <img
            src="/brand/livescore-logo.svg"
            alt="LiveScore by Cheke"
            className="relative z-10 block h-auto w-[154px] object-contain drop-shadow-[0_0_8px_rgba(0,230,118,0.16)] sm:w-[196px]"
            fetchPriority="high"
          />
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/search" className="hidden rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-emerald-500 hover:text-emerald-400 sm:block">Search</Link>
          <Link href="/favourites" className="hidden rounded-lg bg-emerald-500 px-3 py-2 text-xs font-black text-[#101820] transition hover:bg-emerald-400 sm:block sm:px-4 sm:text-sm">♥ Favourites</Link>
          <AuthNavigation />
        </div>
      </div>
      <Suspense fallback={<NavigationFallback />}><PrimaryNavigation /></Suspense>
    </header>
    <Suspense fallback={null}><MobileBottomNavigation /></Suspense>
  </>;
}
