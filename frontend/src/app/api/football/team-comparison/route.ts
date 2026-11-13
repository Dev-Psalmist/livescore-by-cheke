import { NextRequest, NextResponse } from "next/server";
import { fetchFootballApi } from "@/lib/football-api";

const API_BASE = "https://v3.football.api-sports.io";
const FINISHED = new Set(["FT", "AET", "PEN"]);

type HeadToHeadMatch = {
  id: number; date: string; homeId: number; awayId: number; home: string; away: string;
  homeLogo: string; awayLogo: string; homeGoals: number | null;
  awayGoals: number | null; competition: string;
};

type Fixture = {
  fixture: { id: number; date: string; status: { short: string } };
  league: { name: string; country: string };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
};

function summarize(teamId: number, fixtures: Fixture[]) {
  const played = fixtures
    .filter((match) => FINISHED.has(match.fixture.status.short))
    .sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime())
    .slice(0, 10);

  let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0, cleanSheets = 0;
  const form: { id: number; date: string; opponent: string; goalsFor: number; goalsAgainst: number; result: "W" | "D" | "L" }[] = [];

  for (const match of played) {
    const isHome = match.teams.home.id === teamId;
    const scored = (isHome ? match.goals.home : match.goals.away) ?? 0;
    const conceded = (isHome ? match.goals.away : match.goals.home) ?? 0;
    const opponent = isHome ? match.teams.away.name : match.teams.home.name;
    const result = scored > conceded ? "W" : scored < conceded ? "L" : "D";
    if (result === "W") wins++;
    else if (result === "D") draws++;
    else losses++;
    goalsFor += scored;
    goalsAgainst += conceded;
    if (conceded === 0) cleanSheets++;
    form.push({ id: match.fixture.id, date: match.fixture.date, opponent, goalsFor: scored, goalsAgainst: conceded, result });
  }

  const latest = played[0];
  const team = latest
    ? (latest.teams.home.id === teamId ? latest.teams.home : latest.teams.away)
    : null;

  return {
    team: team ? { id: team.id, name: team.name, logo: team.logo } : { id: teamId, name: "Team", logo: "" },
    matchesPlayed: played.length,
    wins, draws, losses, goalsFor, goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    cleanSheets,
    averageGoalsFor: played.length ? Number((goalsFor / played.length).toFixed(2)) : 0,
    averageGoalsAgainst: played.length ? Number((goalsAgainst / played.length).toFixed(2)) : 0,
    form,
  };
}

export async function GET(request: NextRequest) {
  const home = request.nextUrl.searchParams.get("home");
  const away = request.nextUrl.searchParams.get("away");
  if (!home || !away || !/^[0-9]+$/.test(home) || !/^[0-9]+$/.test(away) || home === away) {
    return NextResponse.json({ success: false, error: "Select two different valid teams." }, { status: 400 });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "Unable to load data right now. Please try again later." }, { status: 503 });
  }

  try {
    const fetchTeamFixtures = async (teamId: string): Promise<Fixture[]> => {
      const url = new URL(`${API_BASE}/fixtures`);
      url.searchParams.set("team", teamId);
      url.searchParams.set("last", "10");
      url.searchParams.set("timezone", "Africa/Lagos");
      const response = await fetchFootballApi(url, {
        headers: { "x-apisports-key": apiKey },
        next: { revalidate: 900 },
      });
      if (!response.ok) throw new Error("Provider request failed");
      const payload = await response.json();
      const hasErrors = payload?.errors && Object.keys(payload.errors).length > 0;
      if (hasErrors || !Array.isArray(payload?.response)) throw new Error("Invalid provider response");
      return payload.response as Fixture[];
    };

    const fetchHeadToHead = async (): Promise<HeadToHeadMatch[]> => {
      const url = new URL(`${API_BASE}/fixtures`);
      url.searchParams.set("h2h", `${home}-${away}`);
      url.searchParams.set("last", "5");
      url.searchParams.set("timezone", "Africa/Lagos");
      const response = await fetchFootballApi(url, {
        headers: { "x-apisports-key": apiKey },
        next: { revalidate: 900 },
      });
      if (!response.ok) throw new Error("Provider request failed");
      const payload = await response.json();
      const hasErrors = payload?.errors && Object.keys(payload.errors).length > 0;
      if (hasErrors || !Array.isArray(payload?.response)) throw new Error("Invalid provider response");
      return payload.response
        .filter((item: any) => FINISHED.has(item.fixture.status.short))
        .map((item: any) => ({
          id: item.fixture.id,
          date: item.fixture.date,
          homeId: item.teams.home.id,
          awayId: item.teams.away.id,
          home: item.teams.home.name,
          away: item.teams.away.name,
          homeLogo: item.teams.home.logo,
          awayLogo: item.teams.away.logo,
          homeGoals: item.goals.home,
          awayGoals: item.goals.away,
          competition: item.league.name,
        }));
    };

    const [homeFixtures, awayFixtures, headToHead] = await Promise.all([
      fetchTeamFixtures(home),
      fetchTeamFixtures(away),
      fetchHeadToHead(),
    ]);
    const homeSummary = summarize(Number(home), homeFixtures);
    const awaySummary = summarize(Number(away), awayFixtures);
    return NextResponse.json({
      success: true,
      home: homeSummary,
      away: awaySummary,
      headToHead,
    });
  } catch (error) {
    console.error("Team comparison API error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load data right now. Please try again later." },
      { status: 502 }
    );
  }
}
