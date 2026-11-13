import { connection, NextRequest, NextResponse } from "next/server";
import { fetchFootballApi, hasFootballApiErrors } from "@/lib/football-api";

const API_BASE_URL = "https://v3.football.api-sports.io";

type EndpointResult = {
  data: any[];
  diagnostic: {
    endpoint: string;
    httpStatus: number | null;
    success: boolean;
    results: number;
    errors: any;
    message: string;
  };
};

// Fetch optional match information and retain diagnostic details.
async function fetchOptionalMatchData(
  endpoint: string,
  matchId: string,
  apiKey: string
): Promise<EndpointResult> {
  try {
    const url = new URL(`${API_BASE_URL}/${endpoint}`);
    url.searchParams.set("fixture", matchId);

    const revalidateSeconds =
      endpoint === "fixtures/events"
        ? 60
        : endpoint === "fixtures/lineups"
          ? 3600
          : endpoint === "injuries"
            ? 600
            : 300;

    const response = await fetchFootballApi(url.toString(), {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey,
      },
      next: { revalidate: revalidateSeconds },
      signal: AbortSignal.timeout(10000),
    });

    let data: any;

    try {
      data = await response.json();
    } catch {
      return {
        data: [],
        diagnostic: {
          endpoint,
          httpStatus: response.status,
          success: false,
          results: 0,
          errors: null,
          message: "The API returned an invalid JSON response.",
        },
      };
    }

    const apiErrors = data.errors ?? null;
    const hasApiErrors = hasFootballApiErrors(apiErrors);

    const results = Array.isArray(data.response)
      ? data.response
      : [];

    if (!response.ok || hasApiErrors) {
      return {
        data: [],
        diagnostic: {
          endpoint,
          httpStatus: response.status,
          success: false,
          results: 0,
          errors: apiErrors,
          message: "The API request failed or returned an error.",
        },
      };
    }

    return {
      data: results,
      diagnostic: {
        endpoint,
        httpStatus: response.status,
        success: true,
        results: results.length,
        errors: null,
        message:
          results.length > 0
            ? "Data retrieved successfully."
            : "The API request succeeded but returned no data.",
      },
    };
  } catch (error) {
    return {
      data: [],
      diagnostic: {
        endpoint,
        httpStatus: null,
        success: false,
        results: 0,
        errors: null,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected network error occurred.",
      },
    };
  }
}

function skippedOptionalMatchData(endpoint: string): EndpointResult {
  return {
    data: [],
    diagnostic: {
      endpoint,
      httpStatus: null,
      success: true,
      results: 0,
      errors: null,
      message: "Skipped because the fixture has not started.",
    },
  };
}

export async function GET(request: NextRequest) {
  await connection();
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Football API key is missing." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("id");

    if (!matchId || !/^\d+$/.test(matchId)) {
      return NextResponse.json(
        { error: "A valid match ID is required." },
        { status: 400 }
      );
    }

    // 1. Retrieve the main fixture.
    const fixtureUrl = new URL(`${API_BASE_URL}/fixtures`);
    fixtureUrl.searchParams.set("id", matchId);

    const fixtureResponse = await fetchFootballApi(fixtureUrl.toString(), {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey,
      },
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(10000),
    });

    const fixtureData = await fixtureResponse.json();

    if (
      !fixtureResponse.ok ||
      hasFootballApiErrors(fixtureData.errors)
    ) {
      return NextResponse.json(
        {
          error: "Unable to retrieve match information.",
        },
        {
          status: fixtureResponse.ok
            ? 502
            : fixtureResponse.status,
        }
      );
    }

    const match = fixtureData.response?.[0];

    if (!match) {
      return NextResponse.json(
        { error: "Match information was not found." },
        { status: 404 }
      );
    }

    // 2. Retrieve optional match information independently.
    // A failure in one optional endpoint will not prevent
    // the other match information from being returned.
    const isScheduled = ["NS", "TBD"].includes(
      String(match.fixture?.status?.short || "").toUpperCase()
    );

    // Before kickoff, statistics, player ratings and events are not useful.
    // Deferring those three requests reduces scheduled-match loads from six
    // provider calls to four while keeping lineups and injury information.
    const [
      eventsResult,
      lineupsResult,
      statisticsResult,
      playersResult,
      injuriesResult,
    ] = await Promise.all([
      isScheduled
        ? Promise.resolve(skippedOptionalMatchData("fixtures/events"))
        : fetchOptionalMatchData("fixtures/events", matchId, apiKey),
      fetchOptionalMatchData("fixtures/lineups", matchId, apiKey),
      isScheduled
        ? Promise.resolve(skippedOptionalMatchData("fixtures/statistics"))
        : fetchOptionalMatchData("fixtures/statistics", matchId, apiKey),
      isScheduled
        ? Promise.resolve(skippedOptionalMatchData("fixtures/players"))
        : fetchOptionalMatchData("fixtures/players", matchId, apiKey),
      fetchOptionalMatchData("injuries", matchId, apiKey),
    ]);

    // 3. Return match data and diagnostics.
    return NextResponse.json({
      success: true,

      match: {
        ...match,
        events: eventsResult.data,
        lineups: lineupsResult.data,
        statistics: statisticsResult.data,
        players: playersResult.data,
        injuries: injuriesResult.data,
      },

      diagnostics: {
        events: eventsResult.diagnostic,
        lineups: lineupsResult.diagnostic,
        statistics: statisticsResult.diagnostic,
        players: playersResult.diagnostic,
        injuries: injuriesResult.diagnostic,
      },
    });
  } catch (error) {
    console.error("Match Centre API error:", error);

    return NextResponse.json(
      {
        error:
          "Something went wrong while retrieving match information.",
      },
      { status: 500 }
    );
  }
}