import Link from "next/link";
import { Match } from "@/types/football";

interface LiveMatchCardProps {
  match: Match;
}

export default function LiveMatchCard({ match }: LiveMatchCardProps) {
  return (
    <Link
      href={`/match/${match.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/[0.08] bg-[#151f2b] p-4 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-[#192634] hover:shadow-emerald-950/20 sm:p-5"
    >
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent opacity-60 transition-opacity group-hover:opacity-100" />

      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
          <p className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {match.league}
          </p>
        </div>

        <span className="flex shrink-0 items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-red-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
          {match.minute}
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
        <div className="min-w-0 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#263849] to-[#1b2937] text-sm font-black text-emerald-400 shadow-inner transition-transform group-hover:scale-105 sm:h-16 sm:w-16 sm:text-base">
            {match.homeTeam.shortName}
          </div>

          <p className="break-words text-xs font-bold leading-snug text-slate-200 sm:text-sm">
            {match.homeTeam.name}
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Home
          </p>
        </div>

        <div className="min-w-0 text-center">
          <div className="rounded-xl border border-white/[0.06] bg-[#0d1722] px-3 py-3 shadow-inner sm:px-5 sm:py-4">
            <p className="whitespace-nowrap text-2xl font-black tracking-tight text-white sm:text-3xl">
              {match.homeScore}
              <span className="mx-2 text-slate-600">:</span>
              {match.awayScore}
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-red-400">
              Live
            </p>
          </div>
        </div>

        <div className="min-w-0 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#263849] to-[#1b2937] text-sm font-black text-emerald-400 shadow-inner transition-transform group-hover:scale-105 sm:h-16 sm:w-16 sm:text-base">
            {match.awayTeam.shortName}
          </div>

          <p className="break-words text-xs font-bold leading-snug text-slate-200 sm:text-sm">
            {match.awayTeam.name}
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Away
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Match in progress
        </span>

        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 transition-all group-hover:translate-x-1">
          Match Centre →
        </span>
      </div>
    </Link>
  );
}