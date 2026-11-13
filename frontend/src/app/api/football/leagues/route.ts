import { connection, NextResponse } from "next/server";
import { fetchFootballApi, hasFootballApiErrors } from "@/lib/football-api";

interface LeaguesPayload {
  errors?: unknown;
  results?: number;
  response?: unknown;
}

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

    const url = new URL("https://v3.football.api-sports.io/leagues");
    url.searchParams.set("current", "true");

    const response = await fetchFootballApi(url, {
      method: "GET",
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: 3600 },
    });

    let data: LeaguesPayload;
    try {
      data = (await response.json()) as LeaguesPayload;
    } catch {
      return NextResponse.json(
        { success: false, error: "The football data provider returned an invalid response." },
        { status: 502 }
      );
    }

    if (!response.ok || hasFootballApiErrors(data.errors)) {
      return NextResponse.json(
        { success: false, error: "Unable to retrieve leagues right now." },
        { status: response.ok ? 502 : response.status }
      );
    }

    if (!Array.isArray(data.response)) {
      return NextResponse.json(
        { success: false, error: "The football data provider returned unexpected league data." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      results: typeof data.results === "number" ? data.results : data.response.length,
      leagues: data.response,
    });
  } catch (error) {
    console.error("Football leagues API error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong while retrieving leagues." },
      { status: 502 }
    );
  }
}
