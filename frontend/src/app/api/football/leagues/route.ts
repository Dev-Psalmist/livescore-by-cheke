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

    const url = new URL(
      "https://v3.football.api-sports.io/leagues"
    );

    url.searchParams.set("current", "true");

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
        { error: data.errors || "Unable to retrieve leagues." },
        { status: response.status || 502 }
      );
    }

    return NextResponse.json({
      success: true,
      results: data.results,
      leagues: data.response,
    });

  } catch {
    return NextResponse.json(
      { error: "Something went wrong while retrieving leagues." },
      { status: 500 }
    );
  }
}