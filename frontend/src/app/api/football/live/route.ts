import { connection, NextResponse } from "next/server";
import { fetchFootballApi, hasFootballApiErrors } from "@/lib/football-api";

export async function GET() {
  await connection();
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      console.error("API_FOOTBALL_KEY is missing.");

      return NextResponse.json(
        { error: "Football API key is missing." },
        { status: 500 }
      );
    }

    const response = await fetchFootballApi(
      "https://v3.football.api-sports.io/fixtures?live=all",
      {
        method: "GET",
        headers: {
          "x-apisports-key": apiKey,
        },
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(10000),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("API-Football HTTP error:", response.status);

      return NextResponse.json(
        { error: "Unable to retrieve live football data." },
        { status: response.status }
      );
    }

    if hasFootballApiErrors(data.errors) {
      console.error("API-Football returned errors:", data.errors);

      return NextResponse.json(
        { error: "Unable to retrieve live football data." },
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
      { error: "Something went wrong while fetching live matches." },
      { status: 500 }
    );
  }
}