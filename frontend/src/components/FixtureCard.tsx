import Link from "next/link";
import { Match } from "@/types/football";

interface FixtureCardProps {
  match: Match;
}

export default function FixtureCard({ match }: FixtureCardProps) {
  return (
    <Link
      href={`/match/${match.id}`}
      className="group flex flex-col gap-4 border-b border-white/[0.06] p-4 transition-all duration-300 last:border-b-0 hover:bg-white/[0.035] sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-5 sm:py-5"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-[#1d2b39] text-xs font-black text-emerald-400 transition-colors group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10">
          VS
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-2 truncate text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
            {match.league}
          </p>

          <p className="break-words text-sm font-bold leading-relaxed text-slate-200 transition-colors group-hover:text-white sm:text-base">
            {match.homeTeam.name}
            <span className="mx-2 font-medium text-slate-600">vs</span>
            {match.awayTeam.name}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.07] px-4 py-2.5 text-center">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
            Kick-off
          </p>
          <p className="mt-0.5 whitespace-nowrap text-sm font-black text-emerald-400">
            {match.kickoff}
          </p>
        </div>

        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 transition-all group-hover:translate-x-1 group-hover:text-emerald-400">
          View →
        </span>
      </div>
    </Link>
  );
}