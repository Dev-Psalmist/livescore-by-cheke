import { NextResponse } from "next/server";

const API = "https://v3.football.api-sports.io";
const WINDOW_DAYS = 14;
const EXCLUDED = /\b(u\s?17|u\s?18|u\s?19|u\s?20|u\s?21|u\s?23|under[- ]?(17|18|19|20|21|23)|youth|academy|reserve|reserves| ii\b|b team)\b/i;
const LIVE_STATUSES = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT", "SUSP"];
const INTERNATIONAL = /world cup|world cup qualifier|qualification.*world cup|nations league|african cup of nations|afcon|africa cup|euro qualifier|european championship|uefa euro|copa america|asian cup|afc asian|gold cup|concacaf|copa afric|caf champions league|caf confederation cup|international friendly/i;
const REGIONAL_COUNTRIES = /^(world|africa|europe|asia|south america|north and central america)$/i;

const POPULARITY: Array<[RegExp, number]> = [
  [/fifa world cup|world cup qualifier/i, 110],
  [/uefa champions league|champions league/i, 105],
  [/premier league/i, 102],
  [/african cup of nations|afcon/i, 100],
  [/uefa nations league|nations league/i, 96],
  [/copa america/i, 96],
  [/european championship|uefa euro/i, 96],
  [/la liga/i, 94],
  [/serie a/i, 92],
  [/bundesliga/i, 91],
  [/afc asian cup|asian cup/i, 90],
  [/europa league/i, 89],
  [/ligue 1/i, 86],
  [/copa libertadores/i, 88],
  [/caf champions league/i, 84],
  [/world cup qualification/i, 86],
  [/conference league/i, 82],
  [/fa cup|copa del rey|coppa italia|dfb pokal/i, 78],
  [/mls|major league soccer/i, 76],
  [/caf confederation cup/i, 75],
];

function popularity(name: string): number {
  return POPULARITY.find(([pattern]) => pattern.test(name))?.[1] ?? 45;
}

function isInternational(league: any): boolean {
  const name = String(league.name || "");
  const country = String(league.country || "");
  return INTERNATIONAL.test(name) || REGIONAL_COUNTRIES.test(country);
}

export async function GET() {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    return NextResponse.json({ success: false, error: "Football API key is missing." }, { status: 500 });
  }

  try {
    const headers = { "x-apisports-key": key };
    const urls = [
      API + "/fixtures?next=100&timezone=Africa%2FLagos",
      API + "/fixtures?live=all&timezone=Africa%2FLagos",
    ];
    const responses = await Promise.all(
      urls.map((url) => fetch(url, { headers, next: { revalidate: 900 } }))
    );
    const payloads = await Promise.all(responses.map((response) => response.json()));

    for (let index = 0; index < responses.length; index++) {
      if (!responses[index].ok || (payloads[index].errors && Object.keys(payloads[index].errors).length)) {
        throw new Error("Competition data is temporarily unavailable.");
      }
    }

    const now = Date.now();
    const windowEnd = now + WINDOW_DAYS * 24 * 60 * 60 * 1000;
    const fixtures = new Map<number, any>();

    for (const fixture of payloads.flatMap((payload) => payload.response || [])) {
      const fixtureId = fixture.fixture?.id;
      const league = fixture.league;
      if (!fixtureId || !league?.id) continue;

      const teams = String(fixture.teams?.home?.name || "") + " " + String(fixture.teams?.away?.name || "");
      if (EXCLUDED.test(String(league.name || "") + " " + teams)) continue;

      const status = String(fixture.fixture?.status?.short || "").toUpperCase();
      const kickoff = new Date(fixture.fixture?.date || "").getTime();
      const live = LIVE_STATUSES.includes(status);
      const upcoming = ["NS", "TBD"].includes(status);

      if (!live && (!upcoming || !Number.isFinite(kickoff) || kickoff > windowEnd)) continue;
      if (upcoming && kickoff < now - 60 * 60 * 1000) continue;

      fixtures.set(fixtureId, fixture);
    }

    const grouped = new Map<number, any>();
    let internationalFixtureCount = 0;
    let clubFixtureCount = 0;

    for (const fixture of fixtures.values()) {
      const league = fixture.league;
      const id = Number(league.id);
      const status = String(fixture.fixture.status.short || "").toUpperCase();
      const live = LIVE_STATUSES.includes(status);
      const kickoff = new Date(fixture.fixture.date).getTime();
      const international = isInternational(league);

      if (international) internationalFixtureCount++;
      else clubFixtureCount++;

      const current = grouped.get(id) || {
        id,
        name: league.name,
        country: league.country || "International",
        logo: league.logo,
        season: league.season,
        category: international ? "international" : "club",
        liveMatches: 0,
        upcomingMatches: 0,
        nextMatch: null as string | null,
        nextMatchTime: Number.POSITIVE_INFINITY,
        matchesNext7Days: 0,
        matchesNext14Days: 0,
      };

      if (live) current.liveMatches++;
      else {
        current.upcomingMatches++;
        if (kickoff < current.nextMatchTime) {
          current.nextMatchTime = kickoff;
          current.nextMatch = fixture.fixture.date;
        }
        if (kickoff <= now + 7 * 24 * 60 * 60 * 1000) current.matchesNext7Days++;
        current.matchesNext14Days++;
      }

      grouped.set(id, current);
    }

    const competitions = [...grouped.values()]
      .map((competition) => {
        const score =
          popularity(competition.name) +
          competition.liveMatches * 18 +
          competition.matchesNext7Days * 9 +
          competition.matchesNext14Days * 3 +
          (competition.nextMatchTime <= now + 48 * 60 * 60 * 1000 ? 8 : 0);

        return { ...competition, relevanceScore: score };
      })
      .sort((a, b) =>
        b.relevanceScore - a.relevanceScore ||
        a.nextMatchTime - b.nextMatchTime ||
        a.name.localeCompare(b.name)
      )
      .slice(0, 30)
      .map(({ nextMatchTime, ...competition }) => competition);

    const focus =
      internationalFixtureCount > clubFixtureCount * 1.15
        ? "international"
        : clubFixtureCount > internationalFixtureCount * 1.15
          ? "club"
          : "balanced";

    return NextResponse.json({
      success: true,
      focus,
      windowDays: WINDOW_DAYS,
      fixtureCounts: {
        international: internationalFixtureCount,
        club: clubFixtureCount,
      },
      competitions,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unable to load active competitions.",
    }, { status: 502 });
  }
}
