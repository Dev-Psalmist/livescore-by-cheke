import { connection, NextRequest, NextResponse } from "next/server";
import { fetchFootballApi, hasFootballApiErrors } from "@/lib/football-api";

const API_BASE_URL = "https://v3.football.api-sports.io";

interface MatchEventsPayload {
  errors?: unknown;
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

    const matchId = request.nextUrl.searchParams.get("id");

    if (!matchId || !/^\d+$/.test(matchId)) {
      return NextResponse.json(
        { success: false, error: "A valid match ID is required." },
        { status: 400 }
      );
    }

    const eventsUrl = new URL(`${API_BASE_URL}/fixtures/events`);
    eventsUrl.searchParams.set("fixture", matchId);

    const response = await fetchFootballApi(eventsUrl, {
      method: "GET",
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: 30 },
    });

    let data: MatchEventsPayload;
    try {
      data = (await response.json()) as MatchEventsPayload;
    } catch {
      return NextResponse.json(
        { success: false, error: "The football data provider returned an invalid response." },
        { status: 502 }
      );
    }

    if (!response.ok || hasFootballApiErrors(data.errors)) {
      return NextResponse.json(
        { success: false, error: "Unable to retrieve the latest match events." },
        { status: response.ok ? 502 : response.status }
      );
    }

    if (!Array.isArray(data.response)) {
      return NextResponse.json(
        { success: false, error: "The football data provider returned unexpected match event data." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { success: true, events: data.response },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Match events refresh error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to refresh match events." },
      { status: 502 }
    );
  }
}
