import { NextRequest, NextResponse } from "next/server";
import { fetchFootballApi, hasFootballApiErrors } from "@/lib/football-api";

interface HeadToHeadPayload {
  errors?: unknown;
  response?: unknown;
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "Football API is not configured." }, { status: 503 });
  }

  const home = request.nextUrl.searchParams.get("home");
  const away = request.nextUrl.searchParams.get("away");
  if (!home || !away || !/^\d+$/.test(home) || !/^\d+$/.test(away) || home === away) {
    return NextResponse.json({ success: false, error: "Valid, different home and away team IDs are required." }, { status: 400 });
  }

  try {
    const url = new URL("https://v3.football.api-sports.io/fixtures");
    url.searchParams.set("h2h", `${home}-${away}`);
    url.searchParams.set("last", "5");
    url.searchParams.set("timezone", "Africa/Lagos");

    const response = await fetchFootballApi(url, {
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: 900 },
    });

    let data: HeadToHeadPayload;
    try {
      data = (await response.json()) as HeadToHeadPayload;
    } catch {
      return NextResponse.json({ success: false, error: "The football data provider returned an invalid response." }, { status: 502 });
    }

    if (!response.ok || hasFootballApiErrors(data.errors)) {
      return NextResponse.json({ success: false, error: "Head-to-head data is temporarily unavailable." }, { status: response.ok ? 502 : response.status });
    }

    if (!Array.isArray(data.response)) {
      return NextResponse.json({ success: false, error: "The football data provider returned unexpected match data." }, { status: 502 });
    }

    const matches = data.response
      .filter((item: any) => ["FT", "AET", "PEN"].includes(item?.fixture?.status?.short))
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
  } catch (error) {
    console.error("Head-to-head API error:", error);
    return NextResponse.json({ success: false, error: "Unable to retrieve head-to-head results." }, { status: 502 });
  }
}
