interface MatchInsightEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    name: string;
  };
  type: string;
  detail: string;
}

interface MatchInsightsProps {
  events: MatchInsightEvent[];
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
  status: string;
  elapsed: number | null;
}

export default function MatchInsights({
  events,
  homeTeam,
  awayTeam,
  homeGoals,
  awayGoals,
  status,
  elapsed,
}: MatchInsightsProps) {
  const getTeamEvents = (teamName: string) =>
    events.filter(
      (event) =>
        event.team.name.toLowerCase() === teamName.toLowerCase()
    );

  const getCardCounts = (teamName: string) => {
    const cards = getTeamEvents(teamName).filter(
      (event) => event.type.toLowerCase() === "card"
    );

    return {
      yellow: cards.filter((event) =>
        event.detail.toLowerCase().includes("yellow")
      ).length,

      red: cards.filter((event) => {
        const detail = event.detail.toLowerCase();

        return (
          detail.includes("red") ||
          detail.includes("second yellow")
        );
      }).length,
    };
  };

  const getSubstitutionCount = (teamName: string) =>
    getTeamEvents(teamName).filter((event) => {
      const type = event.type.toLowerCase();

      return type === "subst" || type === "substitution";
    }).length;

  const homeCards = getCardCounts(homeTeam);
  const awayCards = getCardCounts(awayTeam);

  const homeSubstitutions = getSubstitutionCount(homeTeam);
  const awaySubstitutions = getSubstitutionCount(awayTeam);

  const totalGoals =
    homeGoals !== null && awayGoals !== null
      ? homeGoals + awayGoals
      : null;

  // Only display elapsed minutes when the match is actually in progress.
  const normalizedStatus = status.toLowerCase();

  const activeStatuses = [
    "1h",
    "2h",
    "et",
    "bt",
    "p",
    "live",
    "first half",
    "second half",
    "extra time",
    "in play",
    "penalty in progress",
  ];

  const isMatchInProgress = activeStatuses.some((activeStatus) =>
    normalizedStatus.includes(activeStatus)
  );

  const statusLabel =
    isMatchInProgress && elapsed !== null && elapsed > 0
      ? `${elapsed}' played`
      : status || "Status unavailable";

  const insights = [
    {
      label: "Total Goals",
      value: totalGoals !== null ? totalGoals : "—",
      description: "Official match score",
      icon: "⚽",
    },
    {
      label: "Yellow Cards",
      value: homeCards.yellow + awayCards.yellow,
      description: `${homeCards.yellow} home · ${awayCards.yellow} away`,
      icon: "🟨",
    },
    {
      label: "Red Cards",
      value: homeCards.red + awayCards.red,
      description: `${homeCards.red} home · ${awayCards.red} away`,
      icon: "🟥",
    },
    {
      label: "Substitutions",
      value: homeSubstitutions + awaySubstitutions,
      description: `${homeSubstitutions} home · ${awaySubstitutions} away`,
      icon: "🔄",
    },
    {
      label: "Recorded Events",
      value: events.length,
      description: "Events returned by the API",
      icon: "📋",
    },
  ];

  return (
    <section className="mb-8 rounded-2xl border border-white/10 bg-[#111c2b] p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">
            Match Insights
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            A summary of the information recorded for this match.
          </p>
        </div>

        <span className="rounded-full bg-[#172638] px-4 py-2 text-xs font-semibold text-green-400">
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {insights.map((insight) => (
          <div
            key={insight.label}
            className="rounded-xl border border-white/5 bg-[#172638] p-4"
          >
            <div className="mb-3 text-2xl">
              {insight.icon}
            </div>

            <p className="text-2xl font-black text-white">
              {insight.value}
            </p>

            <p className="mt-1 text-xs font-bold text-gray-300">
              {insight.label}
            </p>

            <p className="mt-2 text-[10px] leading-relaxed text-gray-500">
              {insight.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-white/10 pt-5">
        <h3 className="mb-4 text-sm font-bold text-gray-300">
          Team Breakdown
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              name: homeTeam,
              cards: homeCards,
              substitutions: homeSubstitutions,
              color: "text-green-400",
            },
            {
              name: awayTeam,
              cards: awayCards,
              substitutions: awaySubstitutions,
              color: "text-blue-400",
            },
          ].map((team) => (
            <div
              key={team.name}
              className="rounded-lg bg-[#172638] p-4"
            >
              <h4 className={`mb-4 font-bold ${team.color}`}>
                {team.name}
              </h4>

              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                <span className="text-gray-400">
                  Yellow:{" "}
                  <strong className="text-white">
                    {team.cards.yellow}
                  </strong>
                </span>

                <span className="text-gray-400">
                  Red:{" "}
                  <strong className="text-white">
                    {team.cards.red}
                  </strong>
                </span>

                <span className="text-gray-400">
                  Substitutions:{" "}
                  <strong className="text-white">
                    {team.substitutions}
                  </strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {events.length === 0 && (
        <p className="mt-5 text-xs text-gray-500">
          No match events were returned. Card and substitution
          counts may therefore be incomplete.
        </p>
      )}
    </section>
  );
}