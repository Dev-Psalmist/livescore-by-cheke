import Link from "next/link";
import { Match } from "@/types/football";

interface FixtureCardProps {
  match: Match;
}

export default function FixtureCard({ match }: FixtureCardProps) {
  return (
    <Link
      href={`/match/${match.id}`}
      className="flex flex-col gap-3 border-b border-white/10 p-4 transition hover:bg-white/5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5"
    >
      <div className="min-w-0 flex-1">
        <p className="mb-2 text-xs text-gray-400">
          {match.league}
        </p>

        <p className="break-words text-sm font-semibold sm:text-base">
          {match.homeTeam.name}
          <span className="text-gray-500"> vs </span>
          {match.awayTeam.name}
        </p>
      </div>

      <span className="w-full rounded-lg bg-green-500/10 px-4 py-2 text-center text-sm font-bold text-green-400 sm:w-auto">
        {match.kickoff}
      </span>

      <span className="self-end text-xs font-bold text-green-400 sm:self-auto">
        VIEW MATCH →
      </span>
    </Link>
  );
}
