import { NextRequest, NextResponse } from "next/server";
import { fetchFootballApi, hasFootballApiErrors } from "@/lib/football-api";

const API = "https://v3.football.api-sports.io";

interface TeamProfilePayload {
  errors?: unknown;
  response?: unknown;
}

export async function GET(request: NextRequest) {
  const key = process.env.API_FOOTBALL_KEY;
  const teamId = request.nextUrl.searchParams.get("id");

  if (!key) {
    return NextResponse.json(
      { success: false, error: "Football API is not configured." },
      { status: 503 }
    );
  }

  if (!teamId || !/^\d+$/.test(teamId)) {
    return NextResponse.json(
      { success: false, error: "A valid team ID is required." },
      { status: 400 }
    );
  }

  try {
    const url = new URL(`${API}/teams`);
    url.searchParams.set("id", teamId);

    const response = await fetchFootballApi(url, {
      headers: { "x-apisports-key": key },
      next: { revalidate: 3600 },
    });

    let data: TeamProfilePayload;
    try {
      data = (await response.json()) as TeamProfilePayload;
    } catch {
      return NextResponse.json(
        { success: false, error: "The football data provider returned an invalid response." },
        { status: 502 }
      );
    }

    if (!response.ok || hasFootballApiErrors(data.errors)) {
      return NextResponse.json(
        { success: false, error: "Unable to load team information." },
        { status: response.ok ? 502 : response.status }
      );
    }

    if (!Array.isArray(data.response)) {
      return NextResponse.json(
        { success: false, error: "The football data provider returned unexpected team data." },
        { status: 502 }
      );
    }

    const item = data.response[0] as
      | { team?: unknown; venue?: unknown }
      | undefined;

    if (!item?.team || typeof item.team !== "object") {
      return NextResponse.json(
        { success: false, error: "Team not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      team: item.team,
      venue: item.venue ?? null,
    });
  } catch (error) {
    console.error("Team profile API error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load team information." },
      { status: 502 }
    );
  }
}
