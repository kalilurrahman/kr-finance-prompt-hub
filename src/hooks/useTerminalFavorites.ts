import { useState, useCallback, useEffect } from "react";
import { z } from "zod";

const STORAGE_KEY = "finprompt_favs";
const favoritesSchema = z.array(z.number());

export function useTerminalFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const result = favoritesSchema.safeParse(parsed);
        if (result.success) {
          return new Set(result.data);
        }
      }
      return new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
  }, [favorites]);

  const toggle = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isFav = useCallback((id: number) => favorites.has(id), [favorites]);

  const clear = useCallback(() => {
    setFavorites(new Set());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { favorites, toggle, isFav, clear, count: favorites.size };
}
