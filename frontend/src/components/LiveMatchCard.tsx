import Link from "next/link";
import { Match } from "@/types/football";

interface LiveMatchCardProps {
  match: Match;
}

export default function LiveMatchCard({ match }: LiveMatchCardProps) {
  return (
    <Link
      href={`/match/${match.id}`}
      className="block rounded-xl border border-white/10 bg-[#111c2b] p-4 transition hover:border-green-500/40 sm:p-5"
    >
      <div className="mb-5 flex min-w-0 items-center justify-between gap-3">
        <p className="truncate text-xs font-bold tracking-wider text-gray-400">
          {match.league}
        </p>

        <span className="flex shrink-0 items-center gap-2 text-xs font-bold text-red-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          {match.minute}
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
        <div className="min-w-0 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#26384c] text-xs font-black text-green-400 sm:h-12 sm:w-12 sm:text-sm">
            {match.homeTeam.shortName}
          </div>

          <p className="break-words text-xs font-semibold sm:text-sm">
            {match.homeTeam.name}
          </p>
        </div>

        <div className="whitespace-nowrap text-xl font-black tracking-wide sm:text-3xl sm:tracking-widest">
          {match.homeScore} : {match.awayScore}
        </div>

        <div className="min-w-0 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#26384c] text-xs font-black text-green-400 sm:h-12 sm:w-12 sm:text-sm">
            {match.awayTeam.shortName}
          </div>

          <p className="break-words text-xs font-semibold sm:text-sm">
            {match.awayTeam.name}
          </p>
        </div>
      </div>

      <p className="mt-5 text-center text-xs font-bold tracking-wider text-green-400">
        VIEW MATCH CENTRE →
      </p>
    </Link>
  );
}
