import { NextRequest, NextResponse } from "next/server";

const API = "https://v3.football.api-sports.io";

export async function GET(request: NextRequest) {
  const key = process.env.API_FOOTBALL_KEY;
  const teamId = request.nextUrl.searchParams.get("id");

  if (!key) {
    return NextResponse.json(
      { success: false, error: "Unable to load team information." },
      { status: 500 }
    );
  }

  if (!teamId || !/^\\d+$/.test(teamId)) {
    return NextResponse.json(
      { success: false, error: "A valid team ID is required." },
      { status: 400 }
    );
  }

  try {
    const url = new URL(`${API}/teams`);
    url.searchParams.set("id", teamId);

    const response = await fetch(url, {
      headers: { "x-apisports-key": key },
      next: { revalidate: 3600 },
    });
    const data = await response.json();

    if (!response.ok || (data.errors && Object.keys(data.errors).length > 0)) {
      return NextResponse.json(
        { success: false, error: "Unable to load team information." },
        { status: response.ok ? 502 : response.status }
      );
    }

    const item = data.response?.[0];
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Team not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      team: item.team,
      venue: item.venue,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to load team information." },
      { status: 500 }
    );
  }
}
