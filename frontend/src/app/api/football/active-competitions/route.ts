import { NextResponse } from "next/server";

const API = "https://v3.football.api-sports.io";
const excluded = /\b(u\s?17|u\s?18|u\s?19|u\s?20|u\s?21|u\s?23|under[- ]?(17|18|19|20|21|23)|youth|academy|reserve|reserves| ii\b|b team)\b/i;

export async function GET() {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return NextResponse.json({ success: false, error: "Football API key is missing." }, { status: 500 });
  try {
    const headers = { "x-apisports-key": key };
    const urls = ["next=100", "live=all"].map((query) => `${API}/fixtures?${query}&timezone=Africa%2FLagos`);
    const responses = await Promise.all(urls.map((url) => fetch(url, { headers, next: { revalidate: 900 } })));
    const payloads = await Promise.all(responses.map((response) => response.json()));
    for (let index = 0; index < responses.length; index++) {
      if (!responses[index].ok || (payloads[index].errors && Object.keys(payloads[index].errors).length)) {
        throw new Error("Competition data is temporarily unavailable.");
      }
    }
    const unique = new Map<number, any>();
    for (const fixture of payloads.flatMap((payload) => payload.response || [])) {
      const league = fixture.league;
      if (!league?.id || excluded.test(`${league.name || ""} ${fixture.teams?.home?.name || ""} ${fixture.teams?.away?.name || ""}`)) continue;
      if (!unique.has(league.id)) unique.set(league.id, { id: league.id, name: league.name, country: league.country, logo: league.logo, season: league.season, nextMatch: fixture.fixture?.date });
    }
    const competitions = [...unique.values()].sort((a,b) => a.name.localeCompare(b.name));
    return NextResponse.json({ success: true, competitions });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to load active competitions." }, { status: 502 });
  }
}
