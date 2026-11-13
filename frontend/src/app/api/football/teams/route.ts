import { connection, NextRequest, NextResponse } from "next/server";
import { fetchFootballApi, hasFootballApiErrors } from "@/lib/football-api";

interface TeamsPayload {
  errors?: unknown;
  results?: number;
  response?: unknown;
}

export async function GET(request: NextRequest) {
  await connection();
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Football API is not configured." }, { status: 503 });
    }

    const search = request.nextUrl.searchParams.get("search")?.trim();
    if (!search || search.length < 3 || search.length > 80) {
      return NextResponse.json(
        { success: false, error: "Enter between 3 and 80 characters to search for a team." },
        { status: 400 }
      );
    }

    const url = new URL("https://v3.football.api-sports.io/teams");
    url.searchParams.set("search", search);

    const response = await fetchFootballApi(url, {
      method: "GET",
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: 60 },
    });

    let data: TeamsPayload;
    try {
      data = (await response.json()) as TeamsPayload;
    } catch {
      return NextResponse.json({ success: false, error: "The football data provider returned an invalid response." }, { status: 502 });
    }

    if (!response.ok || hasFootballApiErrors(data.errors)) {
      const errorMessage = JSON.stringify(data.errors ?? "");
      const isRateLimited = response.status === 429 || errorMessage.toLowerCase().includes("request limit");
      return NextResponse.json(
        {
          success: false,
          error: isRateLimited
            ? "The football data provider has reached its request limit. Please try again later."
            : "Unable to retrieve teams right now. Please try again later.",
        },
        { status: isRateLimited ? 429 : response.ok ? 502 : response.status }
      );
    }

    if (!Array.isArray(data.response)) {
      return NextResponse.json({ success: false, error: "The football data provider returned unexpected team data." }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      results: typeof data.results === "number" ? data.results : data.response.length,
      teams: data.response,
    });
  } catch (error) {
    console.error("Team search API error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong while searching for teams." },
      { status: 502 }
    );
  }
}
