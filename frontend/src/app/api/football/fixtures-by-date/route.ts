import { NextRequest, NextResponse } from "next/server";
import { fetchFootballApi, hasFootballApiErrors } from "@/lib/football-api";

const API = "https://v3.football.api-sports.io";
const youthPattern =
  /\b(u\s?17|u\s?18|u\s?19|u\s?20|u\s?21|u\s?23|under[- ]?(17|18|19|20|21|23)|youth|academy|reserve|reserves| ii\b|b team)\b/i;

interface FixturesPayload {
  errors?: unknown;
  response?: unknown;
}

export async function GET(request: NextRequest) {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    return NextResponse.json(
      { success: false, error: "Football API is not configured." },
      { status: 503 }
    );
  }

  const date = request.nextUrl.searchParams.get("date");
  const validDate =
    date &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) &&
    new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;

  if (!validDate) {
    return NextResponse.json(
      { success: false, error: "Provide a valid date in YYYY-MM-DD format." },
      { status: 400 }
    );
  }

  try {
    const url = new URL(`${API}/fixtures`);
    url.searchParams.set("date", date);
    url.searchParams.set("timezone", "Africa/Lagos");

    const response = await fetchFootballApi(url, {
      headers: { "x-apisports-key": key },
      next: { revalidate: 60 },
    });

    let data: FixturesPayload;
    try {
      data = (await response.json()) as FixturesPayload;
    } catch {
      return NextResponse.json(
        { success: false, error: "The football data provider returned an invalid response." },
        { status: 502 }
      );
    }

    if (!response.ok || hasFootballApiErrors(data.errors)) {
      return NextResponse.json(
        { success: false, error: "Unable to retrieve fixtures for this date." },
        { status: response.ok ? 502 : response.status }
      );
    }

    if (!Array.isArray(data.response)) {
      return NextResponse.json(
        { success: false, error: "The football data provider returned unexpected fixture data." },
        { status: 502 }
      );
    }

    const matches = data.response.filter((item: any) => {
      const competition = item.league?.name || "";
      const home = item.teams?.home?.name || "";
      const away = item.teams?.away?.name || "";
      return !youthPattern.test(`${competition} ${home} ${away}`);
    });

    return NextResponse.json({ success: true, date, results: matches.length, matches });
  } catch (error) {
    console.error("Fixtures-by-date API error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to fetch fixtures for this date. Please try again." },
      { status: 502 }
    );
  }
}
