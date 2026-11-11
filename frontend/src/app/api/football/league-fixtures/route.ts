import { connection, NextRequest, NextResponse } from "next/server";

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

    const today = new Date();
    const futureDate = new Date();

    futureDate.setUTCDate(futureDate.getUTCDate() + 14);

    const from = getLagosDate(today);
    const to = getLagosDate(futureDate);

    const url = new URL(
      "https://v3.football.api-sports.io/fixtures"
    );

    url.searchParams.set("league", league);
    url.searchParams.set("season", season);
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);
    url.searchParams.set("status", "NS");
    url.searchParams.set("timezone", "Africa/Lagos");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || (data.errors && Object.keys(data.errors).length > 0)) {
      return NextResponse.json(
        { error: data.errors || "Unable to retrieve league fixtures." },
        { status: response.ok ? 502 : response.status }
      );
    }

    return NextResponse.json({
      success: true,
      results: data.results,
      matches: data.response,
    });

  } catch {
    return NextResponse.json(
      { error: "Something went wrong while retrieving league fixtures." },
      { status: 500 }
    );
  }
}