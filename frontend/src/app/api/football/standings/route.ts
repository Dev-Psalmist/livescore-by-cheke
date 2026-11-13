import { connection, NextRequest, NextResponse } from "next/server";
import { fetchFootballApi, hasFootballApiErrors } from "@/lib/football-api";

interface StandingsPayload {
  errors?: unknown;
  results?: number;
  response?: unknown;
}

export async function GET(request: NextRequest) {
  await connection();
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Football API is not configured." },
        { status: 503 }
      );
    }

    const league = request.nextUrl.searchParams.get("league");
    const season = request.nextUrl.searchParams.get("season");
    if (!league || !season || !/^\d+$/.test(league) || !/^\d{4}$/.test(season)) {
      return NextResponse.json(
        { success: false, error: "A valid league ID and season are required." },
        { status: 400 }
      );
    }

    const url = new URL("https://v3.football.api-sports.io/standings");
    url.searchParams.set("league", league);
    url.searchParams.set("season", season);

    const response = await fetchFootballApi(url, {
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: 3600 },
    });

    let data: StandingsPayload;
    try {
      data = (await response.json()) as StandingsPayload;
    } catch {
      return NextResponse.json(
        { success: false, error: "The football data provider returned an invalid response." },
        { status: 502 }
      );
    }

    if (!response.ok || hasFootballApiErrors(data.errors)) {
      return NextResponse.json(
        { success: false, error: "Unable to retrieve league standings." },
        { status: response.ok ? 502 : response.status }
      );
    }

    if (!Array.isArray(data.response)) {
      return NextResponse.json(
        { success: false, error: "The football data provider returned unexpected standings data." },
        { status: 502 }
      );
    }

    const leagueData = (data.response[0] as { league?: { standings?: unknown } } | undefined)?.league;
    return NextResponse.json({
      success: true,
      results: typeof data.results === "number" ? data.results : data.response.length,
      league: leagueData || null,
      standings: Array.isArray(leagueData?.standings) ? leagueData.standings : [],
    });
  } catch (error) {
    console.error("Standings API error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong while retrieving standings." },
      { status: 502 }
    );
  }
}
