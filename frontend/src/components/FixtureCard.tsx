import Link from "next/link";
import { Match } from "@/types/football";

interface FixtureCardProps {
  match: Match;
}

export default function FixtureCard({ match }: FixtureCardProps) {
  return (
    <Link
      href={`/match/${match.id}`}
      className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-5 transition hover:bg-white/5 last:border-b-0"
    >
      <div>
        <p className="mb-2 text-xs text-gray-400">
          {match.league}
        </p>

        <p className="font-semibold">
          {match.homeTeam.name}
          <span className="text-gray-500"> vs </span>
          {match.awayTeam.name}
        </p>
      </div>

      <span className="rounded-lg bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400">
        {match.kickoff}
      </span>

      <span className="text-xs font-bold text-green-400">
        VIEW MATCH →
      </span>
    </Link>
  );
}