import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "kr-prompts-favorites";

// 🛡️ Sentinel: Validate localStorage data using vanilla JS to prevent malicious data injection
export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 🛡️ Sentinel: explicitly validate string elements
        return new Set(Array.isArray(parsed) && parsed.every(item => typeof item === 'string') ? parsed : []);
      }
      return new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
  }, [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return { favorites, toggleFavorite, isFavorite, count: favorites.size };
}
