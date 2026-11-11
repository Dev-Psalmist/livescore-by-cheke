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

function readFavourites(): FavouriteTeam[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as FavouriteTeam[];
  } catch {
    return [];
  }
}

export function useFavourites() {
  const [favourites, setFavourites] = useState<FavouriteTeam[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFavourites(readFavourites());
    setLoaded(true);

    function handleStorageChange(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        setFavourites(readFavourites());
      }
    }

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  function addFavourite(team: FavouriteTeam) {
    const current = readFavourites();

    const alreadySaved = current.some(
      (item) => item.team.id === team.team.id
    );

    if (alreadySaved) {
      return;
    }

    const updated = [...current, team];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setFavourites(updated);
  }

  function removeFavourite(teamId: number) {
    const updated = readFavourites().filter(
      (item) => item.team.id !== teamId
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setFavourites(updated);
  }

  function isFavourite(teamId: number) {
    return favourites.some(
      (item) => item.team.id === teamId
    );
  }

  return {
    favourites,
    loaded,
    addFavourite,
    removeFavourite,
    isFavourite,
  };
}