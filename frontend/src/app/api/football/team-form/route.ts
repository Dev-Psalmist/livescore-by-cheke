import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return NextResponse.json({ success: false, error: "Football API key is missing." }, { status: 500 });
  const home = request.nextUrl.searchParams.get("home");
  const away = request.nextUrl.searchParams.get("away");
  if (!home || !away || !/^\d+$/.test(home) || !/^\d+$/.test(away)) {
    return NextResponse.json({ success: false, error: "Valid home and away team IDs are required." }, { status: 400 });
  }
  const fetchForm = async (team: string) => {
    const url = new URL("https://v3.football.api-sports.io/fixtures");
    url.searchParams.set("team", team);
    url.searchParams.set("last", "5");
    url.searchParams.set("status", "FT-AET-PEN");
    url.searchParams.set("timezone", "Africa/Lagos");
    const response = await fetch(url, { headers: { "x-apisports-key": key }, next: { revalidate: 900 } });
    const data = await response.json();
    if (!response.ok || (data.errors && Object.keys(data.errors).length)) throw new Error("Recent form is temporarily unavailable.");
    return (data.response || []).map((item: any) => ({
      id: item.fixture.id,
      date: item.fixture.date,
      opponent: item.teams.home.id === Number(team) ? item.teams.away.name : item.teams.home.name,
      goalsFor: item.teams.home.id === Number(team) ? item.goals.home : item.goals.away,
      goalsAgainst: item.teams.home.id === Number(team) ? item.goals.away : item.goals.home,
      result: item.teams.home.id === Number(team)
        ? (item.goals.home > item.goals.away ? "W" : item.goals.home < item.goals.away ? "L" : "D")
        : (item.goals.away > item.goals.home ? "W" : item.goals.away < item.goals.home ? "L" : "D"),
    }));
  };
  try {
    const [homeForm, awayForm] = await Promise.all([fetchForm(home), fetchForm(away)]);
    return NextResponse.json({ success: true, home: homeForm, away: awayForm });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to load recent form." }, { status: 502 });
  }
}
