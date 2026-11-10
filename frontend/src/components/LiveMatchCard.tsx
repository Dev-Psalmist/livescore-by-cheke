import Link from "next/link";
import { Match } from "@/types/football";

interface LiveMatchCardProps {
  match: Match;
}

export default function LiveMatchCard({ match }: LiveMatchCardProps) {
  return (
    <Link
      href={`/match/${match.id}`}
      className="block rounded-xl border border-white/10 bg-[#111c2b] p-5 transition hover:border-green-500/40"
    >
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs font-bold tracking-wider text-gray-400">
          {match.league}
        </p>

        <span className="flex items-center gap-2 text-xs font-bold text-red-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
          {match.minute}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#26384c] text-sm font-black text-green-400">
            {match.homeTeam.shortName}
          </div>

          <p className="text-sm font-semibold">
            {match.homeTeam.name}
          </p>
        </div>

        <div className="text-3xl font-black tracking-widest">
          {match.homeScore} : {match.awayScore}
        </div>

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#26384c] text-sm font-black text-green-400">
            {match.awayTeam.shortName}
          </div>

          <p className="text-sm font-semibold">
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