const leagues = [
  "Premier League",
  "La Liga",
  "Bundesliga",
  "Serie A",
  "Ligue 1",
  "Champions League",
  "Europa League",
];

export default function Sidebar() {
  return (
    <aside className="space-y-8">

      <section
        id="leagues"
        className="rounded-xl border border-white/10 bg-[#111c2b] p-5"
      >
        <h2 className="mb-5 text-xl font-bold">
          Popular Leagues
        </h2>

        <div className="space-y-1">
          {leagues.map((league, index) => (
            <div
              key={league}
              className="flex items-center gap-3 rounded-lg p-3 text-sm text-gray-300 transition hover:bg-white/5 hover:text-green-400"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#26384c] text-xs font-bold text-green-400">
                {index + 1}
              </span>

              {league}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-green-500/20 bg-gradient-to-br from-[#123b2b] to-[#111c2b] p-6">

        <h2 className="text-xl font-bold">
          Football Never Stops.
        </h2>

        <p className="mt-3 text-sm leading-7 text-gray-300">
          Stay connected to the competitions, teams and matches
          you love. All in one place.
        </p>

        <p className="mt-5 text-xs font-bold tracking-widest text-green-400">
          LIVE SCORE BY CHEKE
        </p>

      </section>

    </aside>
  );
}