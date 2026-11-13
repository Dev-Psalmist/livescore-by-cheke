"use client";

import { useEffect, useState } from "react";

export interface FavouriteTeam {
  team: {
    id: number;
    name: string;
    code: string | null;
    country: string | null;
    founded: number | null;
    national: boolean;
    logo: string;
  };
  venue: {
    name: string | null;
    city: string | null;
    capacity: number | null;
    image: string | null;
  };
}

const STORAGE_KEY = "livescore-cheke-favourites";
const CHANGE_EVENT = "livescore:favourites-changed";

function readFavourites(): FavouriteTeam[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is FavouriteTeam =>
        Boolean(
          item &&
          typeof item === "object" &&
          "team" in item &&
          item.team &&
          typeof item.team.id === "number" &&
          typeof item.team.name === "string"
        )
    );
  } catch {
    return [];
  }
}

function saveFavourites(favourites: FavouriteTeam[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Keep the current page usable if browser storage is unavailable.
  }
}

export function useFavourites() {
  const [favourites, setFavourites] = useState<FavouriteTeam[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const syncFavourites = () => setFavourites(readFavourites());

    syncFavourites();
    setLoaded(true);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        syncFavourites();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(CHANGE_EVENT, syncFavourites);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(CHANGE_EVENT, syncFavourites);
    };
  }, []);

  function addFavourite(team: FavouriteTeam) {
    const current = readFavourites();
    if (current.some((item) => item.team.id === team.team.id)) return;

    const updated = [...current, team];
    saveFavourites(updated);
    setFavourites(updated);
  }

  function removeFavourite(teamId: number) {
    const updated = readFavourites().filter(
      (item) => item.team.id !== teamId
    );

    saveFavourites(updated);
    setFavourites(updated);
  }

  function isFavourite(teamId: number) {
    return favourites.some((item) => item.team.id === teamId);
  }

  return {
    favourites,
    loaded,
    addFavourite,
    removeFavourite,
    isFavourite,
  };
}
