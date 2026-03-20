import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "finprompt_favs";

// 🛡️ Sentinel: Validate localStorage data using vanilla JS to prevent malicious data injection
export function useTerminalFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 🛡️ Sentinel: explicitly validate number elements
        return new Set(Array.isArray(parsed) && parsed.every(item => typeof item === 'number') ? parsed : []);
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
