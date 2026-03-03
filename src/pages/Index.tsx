import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { FilterBar } from "@/components/FilterBar";
import { PromptCard } from "@/components/PromptCard";
import { PromptDetail } from "@/components/PromptDetail";
import { Analytics } from "@/components/Analytics";
import { useFavorites } from "@/hooks/useFavorites";
import { usePromptFilter } from "@/hooks/usePromptFilter";
import type { Prompt } from "@/types/prompt";

const ITEMS_PER_PAGE = 24;

const Index = () => {
  const { favorites, toggleFavorite, isFavorite, count: favCount } = useFavorites();
  const filter = usePromptFilter();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Sync favorites to filter
  useEffect(() => {
    filter.setFavoritesSet(favorites);
  }, [favorites]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [filter.platform, filter.domain, filter.search, filter.showFavorites]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // URL param for prompt deep link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const promptId = params.get("prompt");
    if (promptId) {
      const p = filter.allPrompts.find((pr) => pr.id === promptId);
      if (p) setSelectedPrompt(p);
    }
  }, [filter.allPrompts]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  }, []);

  const visiblePrompts = filter.filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filter.filtered.length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        search={filter.search}
        onSearchChange={filter.setSearch}
        showFavorites={filter.showFavorites}
        onToggleFavorites={() => filter.setShowFavorites(!filter.showFavorites)}
        favCount={favCount}
      />

      <Hero />

      <main className="container mx-auto flex-1 px-4 py-8">
        {/* Analytics Section */}
        <section className="mb-8">
          <Analytics />
        </section>

        {/* Filters */}
        <section className="mb-6">
          <FilterBar
            platform={filter.platform}
            onPlatformChange={filter.setPlatform}
            domain={filter.domain}
            onDomainChange={filter.setDomain}
            totalCount={filter.allPrompts.length}
            filteredCount={filter.filtered.length}
          />
        </section>

        {/* Prompt Grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visiblePrompts.map((prompt, i) => (
            <div
              key={prompt.id}
              className="animate-fade-in"
              style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
            >
              <PromptCard
                prompt={prompt}
                isFavorite={isFavorite(prompt.id)}
                onToggleFavorite={() => toggleFavorite(prompt.id)}
                onClick={() => setSelectedPrompt(prompt)}
              />
            </div>
          ))}
        </section>

        {/* Load More */}
        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={loadMore}
              className="rounded-full border border-gold/30 bg-gold/5 px-8 py-2.5 text-sm font-medium text-gold transition-all hover:bg-gold/10 hover:glow-gold"
            >
              Load More ({filter.filtered.length - visibleCount} remaining)
            </button>
          </div>
        )}

        {/* Empty State */}
        {filter.filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-4xl">🔍</span>
            <h3 className="mt-4 font-display text-lg font-semibold">No prompts found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </main>

      <Footer />

      {/* Prompt Detail Modal */}
      <PromptDetail
        prompt={selectedPrompt}
        open={!!selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
        isFavorite={selectedPrompt ? isFavorite(selectedPrompt.id) : false}
        onToggleFavorite={() => selectedPrompt && toggleFavorite(selectedPrompt.id)}
      />
    </div>
  );
};

export default Index;
