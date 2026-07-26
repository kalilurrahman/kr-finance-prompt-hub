import { useState, useEffect } from "react";
import type { TerminalPrompt } from "@/types/terminal";
import rawPrompts from "@/data/prompts-library.json";

// Cache key is versioned by dataset length so JSON updates auto-invalidate stale localStorage.
const CACHE_VERSION = `v4-${(rawPrompts as unknown[]).length}`;
const CACHE_KEY = `finprompt_cache_${CACHE_VERSION}`;
const LEGACY_KEYS = ["finprompt_cache", "finprompt_cache_v1", "finprompt_cache_v2", "finprompt_cache_v3-500"];

// 🛡️ Sentinel: Validate localStorage data using vanilla JS to prevent malicious data injection
export function useTerminalPrompts() {
  const [prompts, setPrompts] = useState<TerminalPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Purge any legacy/stale cache entries from previous versions
    try {
      LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
    } catch { /* ignore */ }

    // Try versioned cache first
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((p) =>
          typeof p === "object" && p !== null &&
          typeof p.id === "number" &&
          typeof p.title === "string" &&
          typeof p.category === "string" &&
          typeof p.prompt_text === "string" &&
          Array.isArray(p.tags) && p.tags.every((t: unknown) => typeof t === "string")
        )) {
          setPrompts(parsed as TerminalPrompt[]);
          setLoading(false);
          return;
        }
      }
    } catch { /* ignore */ }

    // Load fresh from bundled JSON
    const data = (rawPrompts as TerminalPrompt[]).map((p) => ({
      ...p,
      type: p.type || "finance",
      tags: p.tags || [],
    }));
    setPrompts(data);
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const updatePrompts = (newPrompts: TerminalPrompt[]) => {
    setPrompts(newPrompts);
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(newPrompts)); } catch { /* ignore */ }
  };

  return { prompts, loading, updatePrompts };
}
