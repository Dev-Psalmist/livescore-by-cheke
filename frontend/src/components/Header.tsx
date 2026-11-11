import Link from "next/link";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/search" },
  { label: "Live Scores", href: "/live" },
  { label: "Fixtures", href: "/fixtures" },
  { label: "Leagues", href: "/leagues" },
  { label: "Teams", href: "/teams" },
  { label: "Favourites", href: "/favourites" },
];

export default function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight md:text-2xl"
        >
          LIVE SCORE
          <span className="text-green-400"> BY CHEKE</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-300 xl:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-green-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-green-400"
        >
          Sign In
        </button>
      </div>

      <nav className="flex flex-wrap justify-center gap-x-5 gap-y-3 border-t border-slate-800 px-4 py-3 text-xs font-medium text-slate-300 xl:hidden">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="transition hover:text-green-400"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}