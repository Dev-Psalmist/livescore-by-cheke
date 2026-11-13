import { connection, NextResponse } from "next/server";
import { fetchFootballApi } from "@/lib/football-api";

export async function GET() {
  await connection();
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

    const response = await fetchFootballApi(url.toString(), {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey,
      },
      next: { revalidate: 3600 },
    });

    const data = await response.json();

    if (!response.ok || (data.errors && Object.keys(data.errors).length > 0)) {
      return NextResponse.json(
        { error: data.errors || "Unable to retrieve leagues." },
        { status: response.ok ? 502 : response.status }
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