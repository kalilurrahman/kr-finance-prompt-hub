import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/FilterBar";
import { PromptCard } from "@/components/PromptCard";
import { PromptDetail } from "@/components/PromptDetail";
import { Analytics } from "@/components/Analytics";
import { Resources } from "@/components/Resources";
import { SampleOutputsModal } from "@/components/SampleOutputsModal";
import { useFavorites } from "@/hooks/useFavorites";
import { usePromptFilter } from "@/hooks/usePromptFilter";
import { Terminal, ArrowRight, Cpu, FlaskConical } from "lucide-react";
import React from "react";
import type { Prompt } from "@/types/prompt";

const ITEMS_PER_PAGE = 24;

// ⚡ Bolt: Extract and memoize list item wrapper to prevent unnecessary React reconciliation
// Expected impact: Skips re-rendering the outer div wrapper for list items on every parent state change (e.g. search keystrokes)
const MemoizedPromptCardWrapper = React.memo(({
  prompt,
  i,
  isFavorite,
  toggleFavorite,
  setSelectedPrompt
}: {
  prompt: Prompt;
  i: number;
  isFavorite: boolean;
  toggleFavorite: (id: string) => void;
  setSelectedPrompt: (prompt: Prompt) => void;
}) => (
  <div
    className="animate-fade-in"
    style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
  >
    <PromptCard
      prompt={prompt}
      isFavorite={isFavorite}
      onToggleFavorite={toggleFavorite}
      onClick={setSelectedPrompt}
    />
  </div>
));

const Index = () => {
  const { favorites, toggleFavorite, isFavorite, count: favCount } = useFavorites();
  const filter = usePromptFilter(favorites);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [showSamples, setShowSamples] = useState(false);

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

  // ⚡ Bolt: Memoize array slice to prevent creating a new array reference on every render
  // Expected impact: Prevents unnecessary re-renders of all visible PromptCard components when parent state changes
  const visiblePrompts = useMemo(
    () => filter.filtered.slice(0, visibleCount),
    [filter.filtered, visibleCount]
  );
  const hasMore = visibleCount < filter.filtered.length;
  const handleDomainShortcut = useCallback((domain: Prompt["domain"]) => {
    filter.setDomain(domain);
    document.getElementById("prompt-filters")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [filter]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        search={filter.search}
        onSearchChange={filter.setSearch}
        showFavorites={filter.showFavorites}
        onToggleFavorites={() => filter.setShowFavorites(!filter.showFavorites)}
        favCount={favCount}
      />

      <Hero onSelectDomain={handleDomainShortcut} />

      <main className="container mx-auto flex-1 px-4 py-8">
        {/* Sample Outputs CTA Banner */}
        <section className="mb-8">
          <button
            id="sample-outputs-btn"
            onClick={() => setShowSamples(true)}
            className="group w-full relative overflow-hidden rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/40 via-[#0a0e14] to-[#0d1117] p-5 md:p-6 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 text-left"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                <FlaskConical className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="font-display text-base font-bold text-foreground">Sample AI Outputs</h2>
                  <span className="text-[9px] tracking-[0.2em] uppercase text-emerald-400/70 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">250 Examples</span>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  Explore 250 FINPROMPT-mapped examples and prompt references across all 6 finance domains
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-emerald-400/70 group-hover:text-emerald-400 transition-colors shrink-0">
                <span className="text-xs font-mono tracking-wider uppercase">Explore</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <div className="mt-4 pt-3.5 border-t border-emerald-500/10 flex gap-4 flex-wrap font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground/60">
              <span>🏢 Corp. Strategy</span>
              <span>🤝 M&amp;A Due Diligence</span>
              <span>📊 Equity Research</span>
              <span>💼 PE Value Creation</span>
              <span>🌍 Macroeconomics</span>
              <span>📈 FP&amp;A / ZBB</span>
            </div>
          </button>
        </section>

        {/* FINPROMPT Terminal Section */}
        <section className="mb-10">
          <Link to="/library" className="group block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl">
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

        {/* META-PROMPT ENGINE Section */}
        <section className="mb-10">
          <Link to="/engine" className="group block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl">
            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-[#0a0e14] to-[#0e1620] p-6 md:p-8 transition-all duration-300 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10">
              {/* Decorative scanlines */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)" }} />
              {/* Gold top line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

              <div className="relative flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gold/10 border border-gold/20 shrink-0">
                  <Cpu className="h-7 w-7 text-gold" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-display text-xl font-bold text-[#e8e0cc] md:text-2xl">Meta-Prompt Engine</h2>
                    <span className="text-[9px] tracking-[0.2em] uppercase text-gold/70 bg-gold/10 border border-gold/20 px-2 py-0.5 rounded font-mono">New</span>
                  </div>
                  <p className="text-sm text-[#8a8070] font-mono">
                    Prompt Architect · Gemini · Claude · Antigravity · Lovable · Codex · Enterprise context synthesis
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-gold/70 group-hover:text-gold transition-colors">
                  <span className="text-xs font-mono tracking-wider uppercase">Launch</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Mini stats */}
              <div className="relative mt-5 pt-4 border-t border-gold/10 flex flex-wrap gap-4 font-mono text-[10px] tracking-[0.15em] uppercase text-[#8a8070]">
                <span>Gemini <span className="text-blue-400">✦</span></span>
                <span>Claude <span className="text-orange-400">⬡</span></span>
                <span>Antigravity <span className="text-emerald-400">🤖</span></span>
                <span>Lovable <span className="text-purple-400">💜</span></span>
                <span>Codex <span className="text-green-400">⌨</span></span>
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
        <section id="prompt-filters" className="mb-6">
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
            <MemoizedPromptCardWrapper
              key={prompt.id}
              prompt={prompt}
              i={i}
              isFavorite={isFavorite(prompt.id)}
              toggleFavorite={toggleFavorite}
              setSelectedPrompt={setSelectedPrompt}
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
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                filter.setSearch("");
                filter.setPlatform("all");
                filter.setDomain("all");
                filter.setShowFavorites(false);
              }}
            >
              Clear Filters
            </Button>
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

      {/* Sample Outputs Modal */}
      <SampleOutputsModal
        isOpen={showSamples}
        onClose={() => setShowSamples(false)}
      />
    </div>
  );
};

export default Index;

