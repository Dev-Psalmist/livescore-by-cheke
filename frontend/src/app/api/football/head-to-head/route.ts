import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "Football API key is missing." }, { status: 500 });
  }

  const home = request.nextUrl.searchParams.get("home");
  const away = request.nextUrl.searchParams.get("away");
  if (!home || !away || !/^\d+$/.test(home) || !/^\d+$/.test(away)) {
    return NextResponse.json({ success: false, error: "Valid home and away team IDs are required." }, { status: 400 });
  }

  try {
    const url = new URL("https://v3.football.api-sports.io/fixtures");
    url.searchParams.set("h2h", `${home}-${away}`);
    url.searchParams.set("last", "5");
    url.searchParams.set("timezone", "Africa/Lagos");

    const response = await fetch(url, {
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(10000),
    });
    const data = await response.json();
    if (!response.ok || (data.errors && Object.keys(data.errors).length > 0)) {
      return NextResponse.json({ success: false, error: "Head-to-head data is temporarily unavailable." }, { status: 502 });
    }

    const matches = (data.response || [])
      .filter((item: any) => ["FT", "AET", "PEN"].includes(item.fixture.status.short))
      .map((item: any) => ({
        id: item.fixture.id,
        date: item.fixture.date,
        home: item.teams.home.name,
        away: item.teams.away.name,
        homeId: item.teams.home.id,
        awayId: item.teams.away.id,
        homeLogo: item.teams.home.logo,
        awayLogo: item.teams.away.logo,
        homeGoals: item.goals.home,
        awayGoals: item.goals.away,
        competition: item.league.name,
      }));

    return NextResponse.json({ success: true, matches });
  } catch {
    return NextResponse.json({ success: false, error: "Unable to retrieve head-to-head results." }, { status: 502 });
  }
}
