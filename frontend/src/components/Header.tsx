import Image from "next/image";
import Link from "next/link";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/search" },
  { label: "Live Scores", href: "/live" },
  { label: "Fixtures", href: "/fixtures" },
  { label: "Leagues", href: "/leagues" },
  { label: "Teams", href: "/teams" },
  { label: "News", href: "/news" },
  { label: "Highlights", href: "/highlights" },
  { label: "Favourites", href: "/favourites" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 shadow-lg shadow-black/10 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4 lg:px-6">
        <Link
          href="/"
          aria-label="LiveScore by Cheke home"
          className="flex min-w-0 shrink-0 items-center"
        >
          {/* Full logo on larger screens */}
          <Image
            src="/brand/livescore-logo.svg"
            alt="LiveScore by Cheke"
            width={230}
            height={67}
            priority
            className="hidden h-auto w-[190px] sm:w-[210px] lg:block"
          />

          {/* Compact branding on mobile */}
          <span className="flex items-center gap-2 lg:hidden">
            <Image
              src="/brand/livescore-icon.svg"
              alt=""
              width={44}
              height={44}
              priority
              className="h-10 w-10 sm:h-11 sm:w-11"
            />
            <span className="flex flex-col leading-none">
              <span className="text-base font-black tracking-tight text-white sm:text-lg">
                LIVESCORE
              </span>
              <span className="mt-1 text-[9px] font-bold tracking-[0.25em] text-emerald-400 sm:text-[10px]">
                BY CHEKE
              </span>
            </span>
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-4 text-sm font-semibold text-slate-300 xl:flex 2xl:gap-5"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap transition-colors hover:text-emerald-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="shrink-0 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-emerald-400 sm:px-5 sm:text-sm"
        >
          Sign In
        </button>
      </div>

      {/* Scrollable navigation for tablets and phones */}
      <nav
        aria-label="Mobile navigation"
        className="border-t border-slate-800 xl:hidden"
      >
        <div className="mobile-nav-scroll mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-3 text-xs font-semibold text-slate-300 sm:justify-center sm:gap-7 sm:px-5 sm:text-sm">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 whitespace-nowrap py-1 transition-colors hover:text-emerald-400"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
