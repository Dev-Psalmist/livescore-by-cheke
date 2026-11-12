"use client";
import { useEffect, useState } from "react";

export interface FavouriteLeague {
  league: { id: number; name: string; type: string; logo: string };
  country: { name: string; flag: string | null };
}
const STORAGE_KEY = "livescore-cheke-favourite-leagues";
function readFavouriteLeagues(): FavouriteLeague[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed as FavouriteLeague[] : [];
  } catch {
    return [];
  }
}
export function useFavouriteLeagues() {
  const [favourites, setFavourites] = useState<FavouriteLeague[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setFavourites(readFavouriteLeagues());
    setLoaded(true);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setFavourites(readFavouriteLeagues());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
  function addFavourite(league: FavouriteLeague) {
    const current = readFavouriteLeagues();
    if (current.some((item) => item.league.id === league.league.id)) return;
    const updated = [...current, league];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setFavourites(updated);
  }
  function removeFavourite(leagueId: number) {
    const updated = readFavouriteLeagues().filter((item) => item.league.id !== leagueId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setFavourites(updated);
  }
  function isFavourite(leagueId: number) {
    return favourites.some((item) => item.league.id === leagueId);
  }
  return { favourites, loaded, addFavourite, removeFavourite, isFavourite };
}
