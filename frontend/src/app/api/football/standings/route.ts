import { connection, NextRequest, NextResponse } from "next/server";
import { fetchFootballApi, hasFootballApiErrors } from "@/lib/football-api";

export async function GET(request: NextRequest) {
  await connection();
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Football API key is missing." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);

    const league = searchParams.get("league");
    const season = searchParams.get("season");

    if (
      !league ||
      !season ||
      !/^\d+$/.test(league) ||
      !/^\d{4}$/.test(season)
    ) {
      return NextResponse.json(
        { error: "A valid league ID and season are required." },
        { status: 400 }
      );
    }

    const url = new URL(
      "https://v3.football.api-sports.io/standings"
    );

    url.searchParams.set("league", league);
    url.searchParams.set("season", season);

    const response = await fetchFootballApi(url.toString(), {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey,
      },
      next: {
        revalidate: 3600,
      },
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();

    if (!response.ok || hasFootballApiErrors(data.errors)) {
      return NextResponse.json(
        { error: "Unable to retrieve league standings." },
        { status: response.ok ? 502 : response.status }
      );
    }

    const leagueData = data.response?.[0]?.league;

    return NextResponse.json({
      success: true,
      results: data.results,
      league: leagueData || null,
      standings: leagueData?.standings || [],
    });

  } catch {
    return NextResponse.json(
      { error: "Something went wrong while retrieving standings." },
      { status: 500 }
    );
  }
}