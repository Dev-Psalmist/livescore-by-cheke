import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      console.error("API_FOOTBALL_KEY is missing.");

      return NextResponse.json(
        { error: "Football API key is missing." },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://v3.football.api-sports.io/fixtures?live=all",
      {
        method: "GET",
        headers: {
          "x-apisports-key": apiKey,
        },
        cache: "no-store",
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

    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error("API-Football returned errors:", data.errors);

      return NextResponse.json(
        { error: data.errors },
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