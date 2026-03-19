import { useState, useEffect } from "react";
import { z } from "zod";
import type { TerminalPrompt } from "@/types/terminal";
import rawPrompts from "@/data/prompts-library.json";

const CACHE_KEY = "finprompt_cache";
const terminalPromptsSchema = z.array(z.object({
  id: z.union([z.number(), z.string()]),
  title: z.string(),
  category: z.string(),
  prompt_text: z.string().optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  type: z.string().optional(),
  platform: z.string().optional(),
  domain: z.string().optional()
})).nonempty();

export function useTerminalPrompts() {
  const [prompts, setPrompts] = useState<TerminalPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try cache first, then fall back to bundled JSON
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const result = terminalPromptsSchema.safeParse(parsed);
        if (result.success) {
          // Type assertion needed because zod schema is more permissive to handle variations
          setPrompts(result.data as unknown as TerminalPrompt[]);
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
