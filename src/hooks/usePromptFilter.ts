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

  // ⚡ Bolt: Combine multiple array filters into a single pass
  // Expected impact: Eliminates multiple intermediate array allocations and reduces iterations from O(3N) to O(N)
  const baseFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const hasPlatformFilter = platform !== "all";
    const hasDomainFilter = domain !== "all";
    const hasSearch = Boolean(q);

    if (!hasPlatformFilter && !hasDomainFilter && !hasSearch) {
      return allPrompts;
    }

    return allPrompts.filter((p) => {
      if (hasPlatformFilter && p.platform !== platform) return false;
      if (hasDomainFilter && p.domain !== domain) return false;
      // ⚡ Bolt: Use pre-computed, normalized search string for fast filtering
      // Expected impact: Prevents main thread blocking during rapid search typing
      if (hasSearch && !p._searchableText?.includes(q)) return false;
      return true;
    });
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
