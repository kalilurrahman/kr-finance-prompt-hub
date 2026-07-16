import { useCallback, useEffect, useState } from "react";

const KEY = "finprompt_clicks_v1";

type ClickMap = Record<number, number>;

function read(): ClickMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as ClickMap) : {};
  } catch {
    return {};
  }
}

function write(map: ClickMap) {
  try { localStorage.setItem(KEY, JSON.stringify(map)); } catch { /* ignore */ }
}

export function usePromptClicks() {
  const [clicks, setClicks] = useState<ClickMap>(() => read());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setClicks(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const record = useCallback((id: number) => {
    setClicks((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      write(next);
      return next;
    });
  }, []);

  const getTop = useCallback(
    (n: number): { id: number; count: number }[] =>
      Object.entries(clicks)
        .map(([id, count]) => ({ id: Number(id), count }))
        .filter((r) => Number.isFinite(r.id) && r.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, n),
    [clicks]
  );

  return { clicks, record, getTop };
}
