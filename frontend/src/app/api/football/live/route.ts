import { connection, NextResponse } from "next/server";
import { fetchFootballApi, hasFootballApiErrors } from "@/lib/football-api";

export async function GET() {
  await connection();

  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Football API is not configured." },
        { status: 503 }
      );
    }

    const response = await fetchFootballApi(
      "https://v3.football.api-sports.io/fixtures?live=all",
      {
        method: "GET",
        headers: { "x-apisports-key": apiKey },
        next: { revalidate: 60 },
      }
    );

    let data: { errors?: unknown; results?: number; response?: unknown };
    try {
      data = await response.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "The football provider returned an invalid response." },
        { status: 502 }
      );
    }

    if (!response.ok || hasFootballApiErrors(data.errors)) {
      console.error("API-Football live request failed:", response.status);
      return NextResponse.json(
        { success: false, error: "Unable to retrieve live football data." },
        { status: response.status === 429 ? 429 : 502 }
      );
    }

    if (!Array.isArray(data.response)) {
      return NextResponse.json(
        { success: false, error: "The football provider returned unexpected live match data." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      results: data.results,
      matches: data.response,
    });
  } catch (error) {
    console.error("Live football route failed:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong while fetching live matches." },
      { status: 502 }
    );
  }
}
