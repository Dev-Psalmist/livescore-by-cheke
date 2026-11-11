"use client";

import Link from "next/link";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useFavourites } from "@/hooks/useFavourites";

export default function FavouritesPage() {
  const {
    favourites,
    loaded,
    removeFavourite,
  } = useFavourites();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-400">
            Your Personal Football Collection
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            My Favourites
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Keep your favourite football teams together in one place.
          </p>
        </div>

        {!loaded && (
          <div className="py-16 text-center text-slate-400">
            Loading your favourites...
          </div>
        )}

        {loaded && favourites.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
            <div className="mb-4 text-5xl text-green-400">
              ♡
            </div>

            <h2 className="text-2xl font-bold">
              No Favourite Teams Yet
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-slate-400">
              You haven't saved any teams yet. Visit the Teams
              directory and add your favourite clubs or national teams.
            </p>

            <Link
              href="/teams"
              className="mt-7 inline-block rounded-lg bg-green-500 px-7 py-3 font-bold text-slate-950 transition hover:bg-green-400"
            >
              Explore Teams
            </Link>
          </div>
        )}

        {loaded && favourites.length > 0 && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">
                Saved Teams
              </h2>

              <span className="rounded-full bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-400">
                {favourites.length} saved
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {favourites.map((item) => (
                <article
                  key={item.team.id}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-green-500"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-800 p-3">
                      {item.team.logo ? (
                        <img
                          src={item.team.logo}
                          alt={`${item.team.name} logo`}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-green-400">
                          {item.team.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-lg font-bold">
                        {item.team.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {item.team.country || "Country unavailable"}
                      </p>

                      {item.team.national && (
                        <span className="mt-2 inline-block rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                          National Team
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 border-t border-slate-800 pt-5">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-slate-500">
                        Team Code
                      </span>

                      <span>
                        {item.team.code || "Unavailable"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-slate-500">
                        Founded
                      </span>

                      <span>
                        {item.team.founded || "Unavailable"}
                      </span>
                    </div>

                    <div className="border-t border-slate-800 pt-3">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-green-400">
                        Home Venue
                      </p>

                      <p className="text-sm font-medium">
                        {item.venue.name || "Venue unavailable"}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {item.venue.city || "City unavailable"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFavourite(item.team.id)}
                    className="mt-6 w-full rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
                  >
                    Remove from Favourites
                  </button>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}