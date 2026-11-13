import { NextRequest, NextResponse } from "next/server";
import { fetchFootballApi, hasFootballApiErrors } from "@/lib/football-api";

interface TeamFormPayload {
  errors?: unknown;
  response?: unknown;
}

export async function GET(request: NextRequest) {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    return NextResponse.json({ success: false, error: "Football API is not configured." }, { status: 503 });
  }

  const home = request.nextUrl.searchParams.get("home");
  const away = request.nextUrl.searchParams.get("away");
  if (!home || !away || !/^\d+$/.test(home) || !/^\d+$/.test(away) || home === away) {
    return NextResponse.json({ success: false, error: "Valid, different home and away team IDs are required." }, { status: 400 });
  }

  const fetchForm = async (team: string) => {
    const url = new URL("https://v3.football.api-sports.io/fixtures");
    url.searchParams.set("team", team);
    url.searchParams.set("last", "10");
    url.searchParams.set("timezone", "Africa/Lagos");

    const response = await fetchFootballApi(url, {
      headers: { "x-apisports-key": key },
      next: { revalidate: 900 },
    });

    let data: TeamFormPayload;
    try {
      data = (await response.json()) as TeamFormPayload;
    } catch {
      throw new Error("The football data provider returned an invalid response.");
    }

    if (!response.ok || hasFootballApiErrors(data.errors)) {
      throw new Error("Recent form is temporarily unavailable.");
    }
    if (!Array.isArray(data.response)) {
      throw new Error("The football data provider returned unexpected fixture data.");
    }

    return data.response
      .filter((item: any) => ["FT", "AET", "PEN"].includes(item?.fixture?.status?.short))
      .slice(0, 5)
      .map((item: any) => {
        const isHome = item.teams.home.id === Number(team);
        const goalsFor = isHome ? item.goals.home : item.goals.away;
        const goalsAgainst = isHome ? item.goals.away : item.goals.home;
        return {
          id: item.fixture.id,
          date: item.fixture.date,
          opponent: isHome ? item.teams.away.name : item.teams.home.name,
          goalsFor,
          goalsAgainst,
          result: goalsFor > goalsAgainst ? "W" : goalsFor < goalsAgainst ? "L" : "D",
        };
      });
  };

  try {
    const [homeForm, awayForm] = await Promise.all([fetchForm(home), fetchForm(away)]);
    return NextResponse.json({ success: true, home: homeForm, away: awayForm });
  } catch (error) {
    console.error("Team form API error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load recent form right now. Please try again." },
      { status: 502 }
    );
  }
}
