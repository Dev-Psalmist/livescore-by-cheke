import { connection, NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://v3.football.api-sports.io";

function hasApiErrors(errors: unknown): boolean {
  if (!errors) return false;

  if (Array.isArray(errors)) {
    return errors.length > 0;
  }

  if (typeof errors === "object") {
    return Object.keys(errors).length > 0;
  }

  return Boolean(errors);
}

export async function GET(request: NextRequest) {
  await connection();
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Football API key is missing." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("id");

    if (!matchId || !/^\d+$/.test(matchId)) {
      return NextResponse.json(
        { success: false, error: "A valid match ID is required." },
        { status: 400 }
      );
    }

    const fixtureUrl = new URL(`${API_BASE_URL}/fixtures`);
    fixtureUrl.searchParams.set("id", matchId);

    const response = await fetch(fixtureUrl.toString(), {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || hasApiErrors(data.errors)) {
      return NextResponse.json(
        {
          success: false,
          error:
            data.errors ||
            "Unable to retrieve the latest match status.",
        },
        { status: response.ok ? 502 : response.status }
      );
    }

    const match = data.response?.[0];

    if (!match) {
      return NextResponse.json(
        { success: false, error: "Match information was not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        status: match.fixture.status,
        goals: match.goals,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Match status refresh error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to refresh the latest match status.",
      },
      { status: 500 }
    );
  }
}
