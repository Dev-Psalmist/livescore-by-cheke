import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://v3.football.api-sports.io";

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
      { success: false, error: "Unable to load data right now. Please try again later." },
      { status: 503 }
    );
  }

  try {
    const url = new URL(`${API_BASE}/players`);
    url.searchParams.set("id", playerId);
    url.searchParams.set("season", season);

    const response = await fetch(url.toString(), {
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: 21600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Unable to load data right now. Please try again later." },
        { status: 502 }
      );
    }

    const payload = await response.json();
    const hasErrors = payload?.errors && (
      Array.isArray(payload.errors)
        ? payload.errors.length > 0
        : Object.keys(payload.errors).length > 0
    );

    if (hasErrors || !Array.isArray(payload?.response)) {
      return NextResponse.json(
        { success: false, error: "Unable to load data right now. Please try again later." },
        { status: 502 }
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
      { success: false, error: "Unable to load data right now. Please try again later." },
      { status: 502 }
    );
  }
}
