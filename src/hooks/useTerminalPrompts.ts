import { useState, useEffect } from "react";
import type { TerminalPrompt } from "@/types/terminal";
import rawPrompts from "@/data/prompts-library.json";

const CACHE_KEY = "finprompt_cache";

// 🛡️ Sentinel: Validate localStorage data using vanilla JS to prevent malicious data injection
export function useTerminalPrompts() {
  const [prompts, setPrompts] = useState<TerminalPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try cache first, then fall back to bundled JSON
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // 🛡️ Sentinel: strictly validate the shape of the array objects before trusting them
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(p =>
          typeof p === 'object' && p !== null &&
          typeof p.id === 'number' &&
          typeof p.title === 'string' &&
          typeof p.category === 'string' &&
          typeof p.prompt_text === 'string' &&
          Array.isArray(p.tags) && p.tags.every((t: unknown) => typeof t === 'string')
        )) {
          setPrompts(parsed as TerminalPrompt[]);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Load from bundled JSON
    const data = (rawPrompts as TerminalPrompt[]).map((p) => ({
      ...p,
      type: p.type || "finance",
      tags: p.tags || [],
    }));
    setPrompts(data);
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    setLoading(false);
  }, []);

  const updatePrompts = (newPrompts: TerminalPrompt[]) => {
    setPrompts(newPrompts);
    localStorage.setItem(CACHE_KEY, JSON.stringify(newPrompts));
  };

  return { prompts, loading, updatePrompts };
}
