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

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Lagos",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const url = new URL("https://v3.football.api-sports.io/fixtures");
    url.searchParams.set("date", today);
    url.searchParams.set("status", "NS");
    url.searchParams.set("timezone", "Africa/Lagos");

    const response = await fetchFootballApi(url, {
      method: "GET",
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: 60 },
    });

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
      return NextResponse.json(
        { success: false, error: "Unable to retrieve fixtures." },
        { status: response.status === 429 ? 429 : 502 }
      );
    }

    if (!Array.isArray(data.response)) {
      return NextResponse.json(
        { success: false, error: "The football provider returned unexpected fixture data." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      results: data.results,
      matches: data.response,
    });
  } catch (error) {
    console.error("Fixtures route failed:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong while fetching fixtures." },
      { status: 502 }
    );
  }
}
