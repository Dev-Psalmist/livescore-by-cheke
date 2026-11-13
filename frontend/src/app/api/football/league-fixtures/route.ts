import { connection, NextRequest, NextResponse } from "next/server";
import { fetchFootballApi, hasFootballApiErrors } from "@/lib/football-api";

interface LeagueFixturesPayload {
  errors?: unknown;
  results?: number;
  response?: unknown;
}

function getLagosDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export async function GET(request: NextRequest) {
  await connection();
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Football API is not configured." }, { status: 503 });
    }

    const league = request.nextUrl.searchParams.get("league");
    const season = request.nextUrl.searchParams.get("season");
    if (!league || !season || !/^\d+$/.test(league) || !/^\d{4}$/.test(season)) {
      return NextResponse.json({ success: false, error: "A valid league ID and season are required." }, { status: 400 });
    }

    const today = new Date();
    const futureDate = new Date();
    futureDate.setUTCDate(futureDate.getUTCDate() + 14);

    const url = new URL("https://v3.football.api-sports.io/fixtures");
    url.searchParams.set("league", league);
    url.searchParams.set("season", season);
    url.searchParams.set("from", getLagosDate(today));
    url.searchParams.set("to", getLagosDate(futureDate));
    url.searchParams.set("status", "NS");
    url.searchParams.set("timezone", "Africa/Lagos");

    const response = await fetchFootballApi(url, {
      method: "GET",
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: 900 },
    });

    let data: LeagueFixturesPayload;
    try {
      data = (await response.json()) as LeagueFixturesPayload;
    } catch {
      return NextResponse.json({ success: false, error: "The football data provider returned an invalid response." }, { status: 502 });
    }

    if (!response.ok || hasFootballApiErrors(data.errors)) {
      return NextResponse.json(
        { success: false, error: "Unable to retrieve league fixtures." },
        { status: response.ok ? 502 : response.status }
      );
    }

    if (!Array.isArray(data.response)) {
      return NextResponse.json({ success: false, error: "The football data provider returned unexpected fixture data." }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      results: typeof data.results === "number" ? data.results : data.response.length,
      matches: data.response,
    });
  } catch (error) {
    console.error("League fixtures API error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong while retrieving league fixtures." },
      { status: 502 }
    );
  }
}
