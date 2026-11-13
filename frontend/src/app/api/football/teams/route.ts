import { connection, NextRequest, NextResponse } from "next/server";
import { fetchFootballApi, hasFootballApiErrors } from "@/lib/football-api";

export async function GET(request: NextRequest) {
  await connection();
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Football API key is missing.",
        },
        { status: 500 }
      );
    }

    const search = request.nextUrl.searchParams
      .get("search")
      ?.trim();

    if (!search || search.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: "Enter at least three characters to search for a team.",
        },
        { status: 400 }
      );
    }

    const url = new URL(
      "https://v3.football.api-sports.io/teams"
    );

    url.searchParams.set("search", search);

    const response = await fetchFootballApi(url.toString(), {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey,
      },
      next: { revalidate: 60 },
    });

    const data = await response.json();

    if (
      !response.ok ||
      hasFootballApiErrors(data.errors)
    ) {
      const errorMessage =
        typeof data.errors === "object"
          ? JSON.stringify(data.errors)
          : "Unable to retrieve teams.";

      const isRateLimited =
        response.status === 429 ||
        errorMessage.toLowerCase().includes("request limit");

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

    return NextResponse.json({
      success: true,
      results: data.results,
      teams: data.response || [],
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong while searching for teams.",
      },
      { status: 500 }
    );
  }
}