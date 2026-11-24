import { connection, NextResponse } from "next/server";
import { fetchFootballApiData, FootballApiRequestError } from "@/lib/football-api";
import { FOOTBALL_CACHE_SECONDS, getLagosDate } from "@/lib/football-plan";

const API = "https://v3.football.api-sports.io";

export async function GET() {
  await connection();

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "Football API is not configured." },
      { status: 503 }
    );
  }

  const url = new URL(`${API}/fixtures`);
  url.searchParams.set("date", getLagosDate());
  url.searchParams.set("timezone", "Africa/Lagos");

  try {
    // Fetch the same cached daily payload used by the other match endpoints.
    // Filter locally so this route does not consume another API request.
    const data = await fetchFootballApiData<{
      fixture: { status?: { short?: string } };
    }>(url, apiKey, {
      method: "GET",
      next: { revalidate: FOOTBALL_CACHE_SECONDS },
    });

    const matches = data.response.filter((item) =>
      ["NS", "TBD"].includes(item.fixture?.status?.short ?? "")
    );

    return NextResponse.json({
      success: true,
      results: matches.length,
      matches,
      date: getLagosDate(),
    });
  } catch (error) {
    console.error("Fixtures route failed:", error);
    const status = error instanceof FootballApiRequestError ? error.status : 502;
    return NextResponse.json(
      {
        success: false,
        error: status === 429
          ? "The football data provider has reached its request limit."
          : "Unable to retrieve today's fixtures.",
      },
      { status }
    );
  }
}
