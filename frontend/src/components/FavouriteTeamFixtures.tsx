"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
interface TeamFixture {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null } };
  league: { name: string };
  teams: { home: { name: string }; away: { name: string } };
  goals: { home: number | null; away: number | null };
}
const LIVE = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE"];
const DONE = ["FT", "AET", "PEN"];
function kickoff(date: string) {
  return new Intl.DateTimeFormat("en-NG", { timeZone: "Africa/Lagos", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}
export default function FavouriteTeamFixtures({ teamId, teamName }: { teamId: number; teamName: string }) {
  const [matches, setMatches] = useState<TeamFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/football/team-fixtures?team=${teamId}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error("Unavailable");
        if (!cancelled) setMatches(data.matches || []);
      })
      .catch(() => { if (!cancelled) setFailed(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [teamId]);
  if (loading) return <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-500">Loading recent results and upcoming fixtures...</div>;
  if (failed) return <p className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-500">Team fixtures are temporarily unavailable.</p>;
  const live = matches.filter((m) => LIVE.includes(m.fixture.status.short));
  const upcoming = matches.filter((m) => ["NS", "TBD"].includes(m.fixture.status.short)).sort((a,b) => Date.parse(a.fixture.date)-Date.parse(b.fixture.date)).slice(0,2);
  const recent = matches.filter((m) => DONE.includes(m.fixture.status.short)).sort((a,b) => Date.parse(b.fixture.date)-Date.parse(a.fixture.date)).slice(0,2);
  const displayed = [...live, ...upcoming, ...recent].slice(0,5);
  return <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
    <div className="mb-3 flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-green-400">Fixtures & results</p><span className="text-[10px] text-slate-500">Nigeria time</span></div>
    {displayed.length === 0 ? <p className="text-xs text-slate-500">No recent or upcoming fixtures found for {teamName}.</p> :
      <div className="space-y-2">{displayed.map((m) => {
        const status=m.fixture.status.short, liveNow=LIVE.includes(status), done=DONE.includes(status);
        return <Link key={m.fixture.id} href={`/match/${m.fixture.id}`} className="block rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 hover:border-green-500/30">
          <div className="mb-2 flex items-center justify-between gap-2"><span className="truncate text-[10px] text-slate-500">{m.league.name}</span><span className={`shrink-0 text-[9px] font-bold uppercase ${liveNow ? "text-red-400" : done ? "text-slate-500" : "text-green-400"}`}>{liveNow ? "LIVE" : done ? "FT" : kickoff(m.fixture.date)}</span></div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2"><span className="truncate text-xs font-semibold text-white">{m.teams.home.name}</span><span className="text-sm font-black text-white">{m.goals.home ?? "-"} : {m.goals.away ?? "-"}</span><span className="truncate text-right text-xs font-semibold text-white">{m.teams.away.name}</span></div>
          {liveNow && m.fixture.status.elapsed !== null && <p className="mt-1 text-right text-[9px] font-bold text-red-400">{m.fixture.status.elapsed}&apos;</p>}
        </Link>;
      })}</div>}
  </div>;
}