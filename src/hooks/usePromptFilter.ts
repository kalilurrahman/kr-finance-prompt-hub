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

  const baseFiltered = useMemo(() => {
    let result = allPrompts;

    if (platform !== "all") {
      result = result.filter((p) => p.platform === platform);
    }
    if (domain !== "all") {
      result = result.filter((p) => p.domain === domain);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      // ⚡ Bolt: Use pre-computed, normalized search string for fast filtering
      // Expected impact: Prevents main thread blocking during rapid search typing
      result = result.filter(
        (p) => p._searchableText?.includes(q)
      );
    }

    return result;
  }, [allPrompts, platform, domain, search]);

  // ⚡ Bolt: Split favorites filtering from heavy text/category filtering
  // Expected impact: Prevents full dataset text matching when toggling a favorite
  const filtered = useMemo(() => {
    if (showFavorites) {
      return baseFiltered.filter((p) => favorites.has(p.id));
    }
    return baseFiltered;
  }, [baseFiltered, showFavorites, favorites]);

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
