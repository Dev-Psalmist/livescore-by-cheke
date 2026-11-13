import { connection, NextRequest, NextResponse } from "next/server";
import { fetchFootballApi } from "@/lib/football-api";

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

    const response = await fetchFootballApi(fixtureUrl.toString(), {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
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

    // Only request event data once the match is in progress or finished.
    // Scheduled fixtures still refresh their status without extra event calls.
    let events: any[] | null = null;
    const eventEligibleStatuses = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT", "SUSP", "INTERRUPTED", "FT", "AET", "PEN"];
    if (eventEligibleStatuses.includes(match.fixture.status.short)) {
      try {
        const eventsUrl = new URL(`${API_BASE_URL}/fixtures/events`);
        eventsUrl.searchParams.set("fixture", matchId);
        const eventsResponse = await fetchFootballApi(eventsUrl.toString(), {
          method: "GET",
          headers: { "x-apisports-key": apiKey },
          next: { revalidate: 60 },
          signal: AbortSignal.timeout(10000),
        });
        const eventsData = await eventsResponse.json();
        if (
          eventsResponse.ok &&
          !hasApiErrors(eventsData.errors) &&
          Array.isArray(eventsData.response)
        ) {
          events = eventsData.response;
        }
      } catch {
        // Keep the score/status response usable if event data is unavailable.
      }
    }

    return NextResponse.json(
      {
        success: true,
        status: match.fixture.status,
        goals: match.goals,
        events,
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
