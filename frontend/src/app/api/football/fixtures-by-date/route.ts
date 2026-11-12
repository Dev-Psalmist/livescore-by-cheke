import { NextRequest, NextResponse } from "next/server";

const API = "https://v3.football.api-sports.io";

const youthPattern = /\b(u\s?17|u\s?18|u\s?19|u\s?20|u\s?21|u\s?23|under[- ]?(17|18|19|20|21|23)|youth|academy|reserve|reserves| ii\b|b team)\b/i;

export async function GET(request: NextRequest) {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return NextResponse.json({ success: false, error: "Football API key is missing." }, { status: 500 });

  const date = request.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ success: false, error: "Provide a valid date in YYYY-MM-DD format." }, { status: 400 });
  }

  try {
    const url = new URL(`${API}/fixtures`);
    url.searchParams.set("date", date);
    url.searchParams.set("timezone", "Africa/Lagos");

    const response = await fetch(url, {
      headers: { "x-apisports-key": key },
      next: { revalidate: 60 },
    });
    const data = await response.json();

    if (!response.ok || (data.errors && Object.keys(data.errors).length)) {
      return NextResponse.json({ success: false, error: data.errors || "Unable to retrieve fixtures." }, { status: response.ok ? 502 : response.status });
    }

    const matches = (data.response || []).filter((item: any) => {
      const competition = item.league?.name || "";
      const home = item.teams?.home?.name || "";
      const away = item.teams?.away?.name || "";
      return !youthPattern.test(`${competition} ${home} ${away}`);
    });

    return NextResponse.json({ success: true, date, results: matches.length, matches });
  } catch {
    return NextResponse.json({ success: false, error: "Unable to fetch fixtures for this date." }, { status: 500 });
  }
}
