import { useState, useMemo } from "react";
import type { Prompt, Platform, Domain } from "@/types/prompt";
import { getAllPrompts } from "@/data/prompts";

export function usePromptFilter() {
  const allPrompts = useMemo(() => getAllPrompts(), []);
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [domain, setDomain] = useState<Domain | "all">("all");
  const [search, setSearch] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavoritesSet] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = allPrompts;

    if (platform !== "all") {
      result = result.filter((p) => p.platform === platform);
    }
    if (domain !== "all") {
      result = result.filter((p) => p.domain === domain);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.domain.toLowerCase().includes(q)
      );
    }
    if (showFavorites) {
      result = result.filter((p) => favorites.has(p.id));
    }

    return result;
  }, [allPrompts, platform, domain, search, showFavorites, favorites]);

  return {
    allPrompts,
    filtered,
    platform,
    setPlatform,
    domain,
    setDomain,
    search,
    setSearch,
    showFavorites,
    setShowFavorites,
    setFavoritesSet,
  };
}
