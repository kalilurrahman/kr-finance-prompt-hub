import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "finprompt_favs";

export function useTerminalFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
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
