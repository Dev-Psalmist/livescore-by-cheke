import { NextRequest, NextResponse } from "next/server";
import { fetchFootballApi, hasFootballApiErrors } from "@/lib/football-api";

const API_BASE = "https://v3.football.api-sports.io";

interface PlayerPayload {
  errors?: unknown;
  response?: unknown;
}

export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get("id");
  const requestedSeason = request.nextUrl.searchParams.get("season");
  const season = requestedSeason || String(new Date().getFullYear());

  if (!playerId || !/^\d+$/.test(playerId) || !/^\d{4}$/.test(season)) {
    return NextResponse.json(
      { success: false, error: "A valid player ID and season are required." },
      { status: 400 }
    );
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "Football API is not configured." },
      { status: 503 }
    );
  }

  try {
    const url = new URL(`${API_BASE}/players`);
    url.searchParams.set("id", playerId);
    url.searchParams.set("season", season);

    const response = await fetchFootballApi(url, {
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: 21600 },
    });

    let payload: PlayerPayload;
    try {
      payload = (await response.json()) as PlayerPayload;
    } catch {
      return NextResponse.json(
        { success: false, error: "The football data provider returned an invalid response." },
        { status: 502 }
      );
    }

    if (!response.ok || hasFootballApiErrors(payload.errors) || !Array.isArray(payload.response)) {
      return NextResponse.json(
        { success: false, error: "Unable to load player data right now." },
        { status: response.ok ? 502 : response.status }
      );
    }

    return NextResponse.json({
      success: true,
      season,
      player: payload.response[0] ?? null,
    });
  } catch (error) {
    console.error("Player profile API error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load player data right now. Please try again." },
      { status: 502 }
    );
  }
}
