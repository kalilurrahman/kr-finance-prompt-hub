import { useMemo } from "react";
import Fuse from "fuse.js";
import type { TerminalPrompt } from "@/types/terminal";

export function useTerminalSearch(prompts: TerminalPrompt[]) {
  const fuse = useMemo(
    () =>
      new Fuse(prompts, {
        keys: [
          { name: "title", weight: 0.5 },
          { name: "tags", weight: 0.3 },
          { name: "category", weight: 0.15 },
          { name: "prompt_text", weight: 0.05 },
        ],
        threshold: 0.35,
        includeMatches: true,
        minMatchCharLength: 2,
      }),
    [prompts]
  );

  return fuse;
}
