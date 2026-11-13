import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://v3.football.api-sports.io";

export async function GET(request: NextRequest) {
  const fixtureId = request.nextUrl.searchParams.get("id");

  if (!fixtureId || !/^\d+$/.test(fixtureId)) {
    return NextResponse.json(
      { success: false, error: "A valid match ID is required." },
      { status: 400 }
    );
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "Football API is not configured." },
      { status: 503 }
    );
  }

  try {
    const url = new URL(`${API_BASE_URL}/odds`);
    url.searchParams.set("fixture", fixtureId);

    const response = await fetch(url.toString(), {
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: 10800 },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json({ success: true, available: false, bookmakers: [] });
    }

    const payload = await response.json();
    const apiErrors = payload?.errors;
    const hasErrors = Array.isArray(apiErrors)
      ? apiErrors.length > 0
      : apiErrors && typeof apiErrors === "object"
        ? Object.keys(apiErrors).length > 0
        : Boolean(apiErrors);

    if (hasErrors || !Array.isArray(payload?.response)) {
      return NextResponse.json({ success: true, available: false, bookmakers: [] });
    }

    const fixtureOdds =
      payload.response.find(
        (item: any) => String(item?.fixture?.id ?? fixtureId) === fixtureId
      ) ?? payload.response[0];

    const bookmakers = Array.isArray(fixtureOdds?.bookmakers)
      ? fixtureOdds.bookmakers
          .map((bookmaker: any) => ({
            id: bookmaker.id,
            name: bookmaker.name,
            bets: Array.isArray(bookmaker.bets)
              ? bookmaker.bets
                  .map((bet: any) => ({
                    id: bet.id,
                    name: bet.name,
                    values: Array.isArray(bet.values)
                      ? bet.values
                          .filter((value: any) => value?.value && value?.odd)
                          .map((value: any) => ({
                            label: String(value.value),
                            odd: String(value.odd),
                          }))
                      : [],
                  }))
                  .filter((bet: any) => bet.values.length > 0)
              : [],
          }))
          .filter((bookmaker: any) => bookmaker.bets.length > 0)
      : [];

    return NextResponse.json({
      success: true,
      available: bookmakers.length > 0,
      updatedAt: fixtureOdds?.update ?? null,
      bookmakers,
    });
  } catch (error) {
    console.error("Match odds API error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load match odds right now. Please try again." },
      { status: 502 }
    );
  }
}
