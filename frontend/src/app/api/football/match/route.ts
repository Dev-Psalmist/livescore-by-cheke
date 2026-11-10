import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://v3.football.api-sports.io";

async function fetchOptionalMatchData(
  endpoint: string,
  matchId: string
) {
  try {
    const url = new URL(`${API_BASE_URL}/${endpoint}`);
    url.searchParams.set("fixture", matchId);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-apisports-key": process.env.API_FOOTBALL_KEY || "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (data.errors && Object.keys(data.errors).length > 0) {
      return [];
    }

    return Array.isArray(data.response) ? data.response : [];
  } catch {
    // Optional information should not prevent the Match Centre loading.
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Football API key is missing." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("id");

    if (!matchId || !/^\d+$/.test(matchId)) {
      return NextResponse.json(
        { error: "A valid match ID is required." },
        { status: 400 }
      );
    }

    // First, retrieve the main fixture information.
    const fixtureUrl = new URL(`${API_BASE_URL}/fixtures`);
    fixtureUrl.searchParams.set("id", matchId);

    const fixtureResponse = await fetch(fixtureUrl.toString(), {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey,
      },
      cache: "no-store",
    });

    const fixtureData = await fixtureResponse.json();

    if (
      !fixtureResponse.ok ||
      (fixtureData.errors &&
        Object.keys(fixtureData.errors).length > 0)
    ) {
      return NextResponse.json(
        {
          error:
            fixtureData.errors ||
            "Unable to retrieve match information.",
        },
        { status: fixtureResponse.ok ? 502 : fixtureResponse.status }
      );
    }

    const match = fixtureData.response?.[0];

    if (!match) {
      return NextResponse.json(
        { error: "Match information was not found." },
        { status: 404 }
      );
    }

    // Retrieve events, lineups and statistics independently.
    const [events, lineups, statistics] = await Promise.all([
      fetchOptionalMatchData("fixtures/events", matchId),
      fetchOptionalMatchData("fixtures/lineups", matchId),
      fetchOptionalMatchData("fixtures/statistics", matchId),
    ]);

    // Return everything in one Match Centre response.
    return NextResponse.json({
      success: true,
      match: {
        ...match,
        events,
        lineups,
        statistics,
      },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Something went wrong while retrieving match information.",
      },
      { status: 500 }
    );
  }
}