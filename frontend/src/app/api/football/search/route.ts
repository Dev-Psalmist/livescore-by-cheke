import { connection, NextRequest, NextResponse } from "next/server";

const API_BASE = "https://v3.football.api-sports.io";

type SearchType = "all" | "teams" | "players" | "leagues" | "matches";

async function fetchFootballData(endpoint: string, apiKey: string) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "GET",
    headers: { "x-apisports-key": apiKey },
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(10000),
  });

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error("The football data provider returned an invalid response.");
  }

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

  return Array.isArray(data.response) ? data.response : [];
}

export async function GET(request: NextRequest) {
  await connection();

  try {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Football API is not configured." },
        { status: 503 }
      );
    }

    const query = request.nextUrl.searchParams.get("query")?.trim();
    const type = (request.nextUrl.searchParams.get("type") || "all") as SearchType;
    const allowedTypes: SearchType[] = ["all", "teams", "players", "leagues", "matches"];

    if (!query || query.length < 3 || query.length > 80) {
      return NextResponse.json(
        { success: false, error: "Enter between 3 and 80 characters to search." },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid search category." },
        { status: 400 }
      );
    }

    const encodedQuery = encodeURIComponent(query);

    if (type === "teams") {
      const teams = await fetchFootballData(`/teams?search=${encodedQuery}`, apiKey);
      return NextResponse.json({ success: true, type, teams });
    }

    if (type === "leagues") {
      const leagues = await fetchFootballData(`/leagues?search=${encodedQuery}`, apiKey);
      return NextResponse.json({ success: true, type, leagues });
    }

    if (type === "players") {
      if (query.length < 4) {
        return NextResponse.json({ success: true, type, players: [] });
      }
      const players = await fetchFootballData(`/players/profiles?search=${encodedQuery}`, apiKey);
      return NextResponse.json({ success: true, type, players });
    }

    if (type === "matches") {
      if (/^\d+$/.test(query)) {
        const matches = await fetchFootballData(`/fixtures?id=${encodeURIComponent(query)}`, apiKey);
        return NextResponse.json({ success: true, type, matches });
      }

      const teams = await fetchFootballData(`/teams?search=${encodedQuery}`, apiKey);
      if (teams.length === 0) {
        return NextResponse.json({ success: true, type, matchedTeam: null, matches: [] });
      }

      const exactMatch = teams.find(
        (item: { team?: { name?: string } }) =>
          item.team?.name?.toLowerCase() === query.toLowerCase()
      );
      const selectedTeam = exactMatch || teams[0];
      const teamId = selectedTeam.team?.id;

      if (!teamId || !/^\d+$/.test(String(teamId))) {
        throw new Error("The team search did not return a valid team ID.");
      }

      const currentSeason = new Date().getFullYear();
      const matches = await fetchFootballData(
        `/fixtures?team=${teamId}&season=${currentSeason}&last=10`,
        apiKey
      );

      return NextResponse.json({ success: true, type, matchedTeam: selectedTeam, matches });
    }

    const [teams, players, leagues] = await Promise.all([
      fetchFootballData(`/teams?search=${encodedQuery}`, apiKey),
      query.length >= 4
        ? fetchFootballData(`/players/profiles?search=${encodedQuery}`, apiKey)
        : Promise.resolve([]),
      fetchFootballData(`/leagues?search=${encodedQuery}`, apiKey),
    ]);

    return NextResponse.json({ success: true, type, teams, players, leagues });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while searching.";
    const rateLimited = message.toLowerCase().includes("request limit");

    console.error("Football search API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: rateLimited
          ? message
          : "Search is temporarily unavailable. Please try again.",
      },
      { status: rateLimited ? 429 : 502 }
    );
  }
}
