import { NextRequest, NextResponse } from "next/server";
import { fetchFootballApi } from "@/lib/football-api";
const API = "https://v3.football.api-sports.io";
const YOUTH = /\b(u\s?17|u\s?18|u\s?19|u\s?20|u\s?21|u\s?23|under[- ]?(17|18|19|20|21|23)|youth|academy|reserve|reserves| ii\b|b team)\b/i;
function lagosDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
export async function GET(request: NextRequest) {
  const key = process.env.API_FOOTBALL_KEY;
  const team = request.nextUrl.searchParams.get("team");
  if (!key) return NextResponse.json({ success: false, error: "Unable to load team fixtures." }, { status: 500 });
  if (!team || !/^\d+$/.test(team)) return NextResponse.json({ success: false, error: "A valid team ID is required." }, { status: 400 });
  const from = new Date();
  const to = new Date();
  from.setUTCDate(from.getUTCDate() - 10);
  to.setUTCDate(to.getUTCDate() + 21);
  try {
    const url = new URL(`${API}/fixtures`);
    url.searchParams.set("team", team);
    url.searchParams.set("from", lagosDate(from));
    url.searchParams.set("to", lagosDate(to));
    url.searchParams.set("timezone", "Africa/Lagos");
    const response = await fetchFootballApi(url, { headers: { "x-apisports-key": key }, next: { revalidate: 900 } });
    const data = await response.json();
    const hasErrors = data.errors && (Array.isArray(data.errors) ? data.errors.length > 0 : Object.keys(data.errors).length > 0);
    if (!response.ok || hasErrors) return NextResponse.json({ success: false, error: "Unable to load team fixtures." }, { status: response.ok ? 502 : response.status });
    const matches = (data.response || []).filter((item: any) => !YOUTH.test(`${item.league?.name || ""} ${item.teams?.home?.name || ""} ${item.teams?.away?.name || ""}`));
    return NextResponse.json({ success: true, matches });
  } catch {
    return NextResponse.json({ success: false, error: "Unable to load team fixtures." }, { status: 500 });
  }
}