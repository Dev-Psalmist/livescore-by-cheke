import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          LIVE SCORE
          <span className="text-green-400"> BY CHEKE</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
          <Link href="/" className="transition hover:text-green-400">
            Home
          </Link>

          <Link href="/live" className="transition hover:text-green-400">
            Live Scores
          </Link>

          <Link href="/fixtures" className="transition hover:text-green-400">
            Fixtures
          </Link>

          <Link href="/leagues" className="transition hover:text-green-400">
            Leagues
          </Link>
        </nav>

        <button className="rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-green-400">
          Sign In
        </button>
      </div>
    </header>
  );
}