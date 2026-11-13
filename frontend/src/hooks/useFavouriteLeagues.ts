"use client";

import { useEffect, useState } from "react";

export interface FavouriteLeague {
  league: {
    id: number;
    name: string;
    type: string;
    logo: string;
  };
  country: {
    name: string;
    flag: string | null;
  };
}

const STORAGE_KEY = "livescore-cheke-favourite-leagues";
const CHANGE_EVENT = "livescore:favourite-leagues-changed";

function readFavouriteLeagues(): FavouriteLeague[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is FavouriteLeague =>
        Boolean(
          item &&
          typeof item === "object" &&
          "league" in item &&
          item.league &&
          typeof item.league.id === "number" &&
          typeof item.league.name === "string"
        )
    );
  } catch {
    return [];
  }
}

function saveFavouriteLeagues(favourites: FavouriteLeague[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Keep the current page usable if browser storage is unavailable.
  }
}

export function useFavouriteLeagues() {
  const [favourites, setFavourites] = useState<FavouriteLeague[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const syncFavourites = () => setFavourites(readFavouriteLeagues());

    syncFavourites();
    setLoaded(true);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        syncFavourites();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(CHANGE_EVENT, syncFavourites);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(CHANGE_EVENT, syncFavourites);
    };
  }, []);

  function addFavourite(league: FavouriteLeague) {
    const current = readFavouriteLeagues();
    if (current.some((item) => item.league.id === league.league.id)) return;

    const updated = [...current, league];
    saveFavouriteLeagues(updated);
    setFavourites(updated);
  }

  function removeFavourite(leagueId: number) {
    const updated = readFavouriteLeagues().filter(
      (item) => item.league.id !== leagueId
    );

    saveFavouriteLeagues(updated);
    setFavourites(updated);
  }

  function isFavourite(leagueId: number) {
    return favourites.some((item) => item.league.id === leagueId);
  }

  return {
    favourites,
    loaded,
    addFavourite,
    removeFavourite,
    isFavourite,
  };
}
