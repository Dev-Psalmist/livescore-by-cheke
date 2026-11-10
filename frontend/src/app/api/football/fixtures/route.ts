import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Football API key is missing." },
        { status: 500 }
      );
    }

    // Get today's date in Nigeria.
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Lagos",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const url = new URL(
      "https://v3.football.api-sports.io/fixtures"
    );

    url.searchParams.set("date", today);
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
        { error: data.errors || "Unable to retrieve fixtures." },
        { status: response.status || 502 }
      );
    }

    return NextResponse.json({
      success: true,
      results: data.results,
      matches: data.response,
    });

  } catch {
    return NextResponse.json(
      { error: "Something went wrong while fetching fixtures." },
      { status: 500 }
    );
  }
}