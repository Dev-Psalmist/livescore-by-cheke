import { connection, NextResponse } from "next/server";
import { fetchFootballApi, hasFootballApiErrors } from "@/lib/football-api";

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

    // Get today's date in Nigeria.
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Lagos",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const url = new URL(
      "https://v3.football.api-sports.io/fixtures"
    );

    url.searchParams.set("date", today);
    url.searchParams.set("status", "NS");
    url.searchParams.set("timezone", "Africa/Lagos");

    const response = await fetchFootballApi(url.toString(), {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey,
      },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();

    if (!response.ok || hasFootballApiErrors(data.errors)) {
      return NextResponse.json(
        { error: "Unable to retrieve fixtures." },
        { status: response.ok ? 502 : response.status }
      );
    }

    return NextResponse.json({
      success: true,
      results: data.results,
      matches: data.response,
    });

  } catch {
    return NextResponse.json(
      { error: "Something went wrong while fetching fixtures." },
      { status: 500 }
    );
  }
}