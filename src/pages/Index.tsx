import { useState, useEffect, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { FilterBar } from "@/components/FilterBar";
import { PromptCard } from "@/components/PromptCard";
import { PromptDetail } from "@/components/PromptDetail";
import { Analytics } from "@/components/Analytics";
import { Resources } from "@/components/Resources";
import { useFavorites } from "@/hooks/useFavorites";
import { usePromptFilter } from "@/hooks/usePromptFilter";
import { Terminal, ArrowRight } from "lucide-react";
import type { Prompt } from "@/types/prompt";

const ITEMS_PER_PAGE = 24;

// ⚡ Bolt: Extract memoized list item to prevent O(N) allocation and reconciliation
// of wrapper div elements on every keystroke during search.
const MemoizedPromptCardItem = memo(({
  prompt,
  index,
  isFavorite,
  onToggleFavorite,
  onClick
}: {
  prompt: Prompt;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClick: (prompt: Prompt) => void;
}) => (
  <div
    className="animate-fade-in"
    style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
  >
    <PromptCard
      prompt={prompt}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      onClick={onClick}
    />
  </div>
));

const Index = () => {
  const { favorites, toggleFavorite, isFavorite, count: favCount } = useFavorites();
  const filter = usePromptFilter(favorites);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

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
        {/* FINPROMPT Terminal Section */}
        <section className="mb-10">
          <Link to="/library" className="group block no-underline">
            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-[#0a0e14] to-[#141c2a] p-6 md:p-8 transition-all duration-300 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10">
              {/* Decorative scanlines */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)" }} />
              {/* Amber top line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gold/10 border border-gold/20 shrink-0">
                  <Terminal className="h-7 w-7 text-gold" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-display text-xl font-bold text-[#e8e0cc] md:text-2xl">FINPROMPT Terminal</h2>
                    <span className="text-[9px] tracking-[0.2em] uppercase text-gold/70 bg-gold/10 border border-gold/20 px-2 py-0.5 rounded font-mono">v2.0</span>
                  </div>
                  <p className="text-sm text-[#8a8070] font-mono">
                    Bloomberg-style terminal interface · 500+ curated prompts · Fuse.js search · Categories · Favorites
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-gold/70 group-hover:text-gold transition-colors">
                  <span className="text-xs font-mono tracking-wider uppercase">Launch</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Mini stats */}
              <div className="relative mt-5 pt-4 border-t border-gold/10 flex gap-6 font-mono text-[10px] tracking-[0.15em] uppercase text-[#8a8070]">
                <span>Strategy <span className="text-gold">▲</span></span>
                <span>M&A <span className="text-gold">▲</span></span>
                <span>Equity Research <span className="text-gold">▲</span></span>
                <span>Private Equity <span className="text-gold">▲</span></span>
                <span>Economics <span className="text-gold">▲</span></span>
                <span>FP&A <span className="text-gold">▲</span></span>
              </div>
            </div>
          </Link>
        </section>

        {/* Resources Section */}
        <section className="mb-8">
          <Resources />
        </section>

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
            <MemoizedPromptCardItem
              key={prompt.id}
              prompt={prompt}
              index={i}
              isFavorite={isFavorite(prompt.id)}
              onToggleFavorite={toggleFavorite}
              onClick={setSelectedPrompt}
            />
          ))}
        </section>

        {/* Load More */}
        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={loadMore}
              aria-label={`Load more prompts, ${filter.filtered.length - visibleCount} remaining`}
              className="rounded-full border border-gold/30 bg-gold/5 px-8 py-2.5 text-sm font-medium text-gold transition-all hover:bg-gold/10 hover:glow-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
