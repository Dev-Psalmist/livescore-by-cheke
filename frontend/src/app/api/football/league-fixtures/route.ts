import { connection, NextRequest, NextResponse } from "next/server";
import { fetchFootballApiData, FootballApiRequestError } from "@/lib/football-api";
import { FREE_PLAN_TODAY_ONLY, FOOTBALL_CACHE_SECONDS, getLagosDate } from "@/lib/football-plan";

function getDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export async function GET(request: NextRequest) {
  await connection();

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "Football API is not configured." },
      { status: 503 }
    );
  }

  const league = request.nextUrl.searchParams.get("league");
  const season = request.nextUrl.searchParams.get("season");
  if (
    !league ||
    !season ||
    !/^\d+$/.test(league) ||
    Number(league) <= 0 ||
    !/^\d{4}$/.test(season)
  ) {
    return NextResponse.json(
      { success: false, error: "A valid league ID and season are required." },
      { status: 400 }
    );
  }

  const url = new URL("https://v3.football.api-sports.io/fixtures");

  if (FREE_PLAN_TODAY_ONLY) {
    // Fetch the shared daily fixture list, then select this competition locally.
    // This avoids the unsupported current-season parameter on the free API plan.
    url.searchParams.set("date", getLagosDate());
  } else {
    // Preserve the existing multi-day, season-specific behaviour for paid plans.
    const today = new Date();
    const futureDate = new Date();
    futureDate.setUTCDate(futureDate.getUTCDate() + 14);

    url.searchParams.set("league", league);
    url.searchParams.set("season", season);
    url.searchParams.set("from", getDate(today));
    url.searchParams.set("to", getDate(futureDate));
    url.searchParams.set("status", "NS");
  }

  url.searchParams.set("timezone", "Africa/Lagos");

  try {
    const data = await fetchFootballApiData<unknown>(url, apiKey, {
      next: { revalidate: FREE_PLAN_TODAY_ONLY ? FOOTBALL_CACHE_SECONDS : 900 },
    });

    const matches = FREE_PLAN_TODAY_ONLY
      ? data.response.filter((item) => {
          if (typeof item !== "object" || item === null || !("league" in item)) {
            return false;
          }
          const matchLeague = (item as { league?: { id?: unknown } }).league;
          return matchLeague?.id === Number(league);
        })
      : data.response;

    return NextResponse.json({
      success: true,
      results: matches.length,
      matches,
      date: FREE_PLAN_TODAY_ONLY ? getLagosDate() : undefined,
    });
  } catch (error) {
    console.error("League fixtures API error:", error);
    const status = error instanceof FootballApiRequestError ? error.status : 502;
    return NextResponse.json(
      {
        success: false,
        error: status === 429
          ? "The football data provider has reached its request limit."
          : "Unable to retrieve league fixtures.",
      },
      { status }
    );
  }
}
