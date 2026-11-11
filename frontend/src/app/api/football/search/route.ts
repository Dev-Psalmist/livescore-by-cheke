import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://v3.football.api-sports.io";

type SearchType = "all" | "teams" | "leagues" | "matches";

async function fetchFootballData(
  endpoint: string,
  apiKey: string
) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "GET",
    headers: {
      "x-apisports-key": apiKey,
    },
    cache: "no-store",
  });

  const data = await response.json();

  const providerErrors =
    data.errors && Object.keys(data.errors).length > 0
      ? JSON.stringify(data.errors)
      : "";

  if (!response.ok || providerErrors) {
    const message =
      providerErrors || "The football data provider returned an error.";

    const rateLimited =
      response.status === 429 ||
      message.toLowerCase().includes("request limit");

    throw new Error(
      rateLimited
        ? "The football data provider has reached its request limit. Please try again later."
        : message
    );
  }

  return data.response || [];
}

export async function GET(request: NextRequest) {
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

    const query = request.nextUrl.searchParams
      .get("query")
      ?.trim();

    const type =
      (request.nextUrl.searchParams.get("type") || "all") as SearchType;

    if (!query || query.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: "Enter at least three characters to search.",
        },
        { status: 400 }
      );
    }

    if (!["all", "teams", "leagues", "matches"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid search category.",
        },
        { status: 400 }
      );
    }

    const encodedQuery = encodeURIComponent(query);

    if (type === "teams") {
      const teams = await fetchFootballData(
        `/teams?search=${encodedQuery}`,
        apiKey
      );

      return NextResponse.json({
        success: true,
        type,
        teams,
      });
    }

    if (type === "leagues") {
      const leagues = await fetchFootballData(
        `/leagues?search=${encodedQuery}`,
        apiKey
      );

      return NextResponse.json({
        success: true,
        type,
        leagues,
      });
    }

    if (type === "matches") {
      // First, find the team so we can use its API-Football ID.
      const teams = await fetchFootballData(
        `/teams?search=${encodedQuery}`,
        apiKey
      );

      if (teams.length === 0) {
        return NextResponse.json({
          success: true,
          type,
          matchedTeam: null,
          matches: [],
        });
      }

      const exactMatch = teams.find(
        (item: { team?: { name?: string } }) =>
          item.team?.name?.toLowerCase() === query.toLowerCase()
      );

      const selectedTeam = exactMatch || teams[0];
      const teamId = selectedTeam.team?.id;

      if (!teamId) {
        throw new Error("The team search did not return a valid team ID.");
      }

      const currentSeason = new Date().getFullYear();

      // Retrieve the team's latest 10 fixtures for the current season.
      const matches = await fetchFootballData(
        `/fixtures?team=${teamId}&season=${currentSeason}&last=10`,
        apiKey
      );

      return NextResponse.json({
        success: true,
        type,
        matchedTeam: selectedTeam,
        matches,
      });
    }

    // "All" searches teams and leagues together.
    const [teams, leagues] = await Promise.all([
      fetchFootballData(
        `/teams?search=${encodedQuery}`,
        apiKey
      ),
      fetchFootballData(
        `/leagues?search=${encodedQuery}`,
        apiKey
      ),
    ]);

    return NextResponse.json({
      success: true,
      type,
      teams,
      leagues,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while searching.";

    const rateLimited = message
      .toLowerCase()
      .includes("request limit");

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: rateLimited ? 429 : 502 }
    );
  }
}