import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useTerminalPrompts } from "@/hooks/useTerminalPrompts";
import { useTerminalFavorites } from "@/hooks/useTerminalFavorites";
import { useTerminalSearch } from "@/hooks/useTerminalSearch";
import { downloadAsTxt, downloadAsHtml, downloadAsPdf } from "@/utils/downloadPrompt";
import type { TerminalPrompt } from "@/types/terminal";
import { TERMINAL_CATEGORIES } from "@/types/terminal";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useFavorites } from "@/hooks/useFavorites";

const TerminalCardItem = React.memo(({
  prompt,
  isFavorite,
  isCopied,
  onToggle,
  onCopy,
  onView
}: {
  prompt: TerminalPrompt;
  isFavorite: boolean;
  isCopied: boolean;
  onToggle: (id: number) => void;
  onCopy: (prompt: TerminalPrompt) => void;
  onView: (prompt: TerminalPrompt) => void;
}) => {
  return (
    <div
      className={`t-card bg-[var(--t-bg-2)] border border-[var(--t-border)] cursor-pointer flex flex-col relative group ${
        isFavorite ? "border-l-[3px] border-l-[var(--t-amber)]" : ""
      }`}
      onClick={() => onView(prompt)}
    >
      <button
        aria-label={`View full details for prompt: ${prompt.title}`}
        onClick={(e) => { e.stopPropagation(); onView(prompt); }}
        className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--t-amber)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--t-bg-2)]"
      />
      {/* Card Header */}
      <div className="px-4 pt-3.5 pb-2.5 border-b border-[var(--t-border)] flex items-start justify-between gap-2.5">
        <span className="text-[9px] text-[var(--t-text-muted)] tracking-[0.15em] shrink-0 pt-0.5">#{prompt.id}</span>
        <span className="text-xs text-[var(--t-text-primary)] font-semibold leading-[1.4] flex-1 font-sans-ibm tracking-[0.01em]">
          {prompt.title}
        </span>
        <button
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
          onClick={(e) => { e.stopPropagation(); onToggle(prompt.id); }}
          className={`bg-transparent border-none cursor-pointer text-base p-0 shrink-0 transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--t-amber)] rounded-sm relative z-10 ${
            isFavorite ? "text-[var(--t-amber)]" : "text-[var(--t-text-muted)] hover:text-[var(--t-amber)]"
          }`}
          style={isFavorite ? { textShadow: "0 0 8px var(--t-glow)" } : {}}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </div>
      {/* Card Meta */}
      <div className="px-4 py-2 flex items-center gap-2 flex-wrap">
        <span className="text-[9px] tracking-[0.15em] uppercase text-[var(--t-text-muted)] bg-[var(--t-bg-4)] px-2 py-[3px] border border-transparent transition-all hover:border-[var(--t-amber)] hover:text-[var(--t-amber)] hover:bg-[var(--t-active-bg)] cursor-default">
          {prompt.category}
        </span>
        {prompt.tags?.map((tag) => (
          <span key={tag} className="text-[9px] tracking-[0.12em] text-[var(--t-amber-dim)] bg-[var(--t-tag-bg)] border border-[var(--t-tag-border)] px-[7px] py-[2px]">
            {tag}
          </span>
        ))}
      </div>
      {/* Card Preview */}
      <div className="px-4 py-2 text-[11px] text-[var(--text-secondary,var(--t-text-secondary))] leading-[1.6] flex-1" style={{ color: "var(--t-text-secondary)" }}>
        {prompt.prompt_text.slice(0, 140)}...
      </div>
      {/* Card Footer */}
      <div className="px-4 py-2.5 border-t border-[var(--t-border)] flex items-center justify-between relative z-10">
        <button
          aria-label={isCopied ? "Prompt copied" : "Copy prompt"}
          aria-live="polite"
          onClick={(e) => { e.stopPropagation(); onCopy(prompt); }}
          className={`bg-transparent border border-[var(--t-border)] text-[10px] px-3.5 py-[5px] cursor-pointer tracking-[0.1em] uppercase transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--t-green)] ${
            isCopied ? "border-[var(--t-green)] text-[var(--t-green)]" : "text-[var(--t-text-muted)] hover:border-[var(--t-green)] hover:text-[var(--t-green)]"
          }`}
        >
          {isCopied ? "✓ COPIED" : "⎘ COPY"}
        </button>
        <button
          aria-label="View full prompt details"
          onClick={(e) => { e.stopPropagation(); onView(prompt); }}
          className="bg-transparent border-none text-[var(--t-text-muted)] text-[10px] py-[5px] cursor-pointer tracking-[0.08em] uppercase transition-colors hover:text-[var(--t-amber)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--t-amber)] rounded-sm"
        >
          VIEW FULL →
        </button>
      </div>
    </div>
  );
});

const PER_PAGE = 24;

export default function Library() {
  const { prompts, loading } = useTerminalPrompts();
  const { favorites: termFavs, toggle, isFav, count: favCount } = useTerminalFavorites();
  const { count: siteFavCount } = useFavorites();
  const [siteSearch, setSiteSearch] = useState("");
  const [showSiteFavs, setShowSiteFavs] = useState(false);
  const fuse = useTerminalSearch(prompts);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [favFilter, setFavFilter] = useState(false);
  const [sort, setSort] = useState<"id" | "title" | "category">("id");
  const [page, setPage] = useState(1);
  const [modalPrompt, setModalPrompt] = useState<TerminalPrompt | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [modalCopied, setModalCopied] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 180);
    return () => clearTimeout(t);
  }, [query]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [debouncedQuery, activeCategory, favFilter, sort]);

  // ESC to close modal or clear search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (modalPrompt) setModalPrompt(null);
        else if (query) { setQuery(""); searchRef.current?.blur(); }
      }
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalPrompt, query]);

  // Filtering
  const searchAndCategoryFiltered = useMemo(() => {
    let result: TerminalPrompt[];

    if (debouncedQuery) {
      result = fuse.search(debouncedQuery).map((r) => r.item);
    } else {
      result = [...prompts];
    }

    if (activeCategory !== "ALL") {
      result = result.filter((p) => p.category === activeCategory);
    }

    return result;
  }, [prompts, debouncedQuery, activeCategory, fuse]);

  // ⚡ Bolt: Split sorting and favorites filtering from heavy fuse.js search
  // Expected impact: Prevents expensive re-searching when user toggles a favorite
  // ⚡ Bolt: Split sorting and favorites filtering from heavy fuse.js search
  // Separate sorting from favorites filtering so toggling favorite doesn't re-sort the entire list
  const sortedPrompts = useMemo(() => {
    const result = [...searchAndCategoryFiltered];

    // Sort
    if (sort === "title") result.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "category") result.sort((a, b) => a.category.localeCompare(b.category));
    else if (!debouncedQuery) result.sort((a, b) => a.id - b.id);

    return result;
  }, [searchAndCategoryFiltered, sort, debouncedQuery]);

  const filtered = useMemo(() => {
    if (favFilter) {
      return sortedPrompts.filter((p) => isFav(p.id));
    }
    return sortedPrompts;
  }, [sortedPrompts, favFilter, isFav]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: prompts.length };
    prompts.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return counts;
  }, [prompts]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pagePrompts = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const copyPrompt = useCallback(async (prompt: TerminalPrompt, isModal = false) => {
    try {
      await navigator.clipboard.writeText(prompt.prompt_text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = prompt.prompt_text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    if (isModal) {
      setModalCopied(true);
      setTimeout(() => setModalCopied(false), 2000);
    } else {
      setCopiedId(prompt.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header search={siteSearch} onSearchChange={setSiteSearch} showFavorites={showSiteFavs} onToggleFavorites={() => setShowSiteFavs(!showSiteFavs)} favCount={siteFavCount} />
        <div className="terminal flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[var(--t-border)] border-t-[var(--t-amber)] rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-xs tracking-[0.2em] text-[var(--t-amber)]">INITIALIZING...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header search={siteSearch} onSearchChange={setSiteSearch} showFavorites={showSiteFavs} onToggleFavorites={() => setShowSiteFavs(!showSiteFavs)} favCount={siteFavCount} />
      <div className="terminal pt-0">
      {/* TICKER BAR */}
      <div className="fixed top-12 left-0 right-0 z-[100] bg-[var(--t-bg-1)] border-b border-[var(--t-amber)] h-7 flex items-center">
        <div className="bg-[var(--t-amber)] text-black text-[10px] font-bold px-3 h-full flex items-center tracking-[0.15em] shrink-0">
          FINPROMPT
        </div>
        <div className="overflow-hidden flex-1">
          <div
            className="flex items-center whitespace-nowrap text-[10px] text-[var(--t-amber)] tracking-[0.08em] pl-5"
            style={{ animation: "ticker-scroll 50s linear infinite" }}
          >
            {TERMINAL_CATEGORIES.map((cat) => (
              <span key={cat} className="mx-7 opacity-85">
                {cat.split(" ")[0].toUpperCase()}{" "}
                <span className="text-[var(--t-green)]">▲ {categoryCounts[cat] || 0}</span>
              </span>
            ))}
            <span className="mx-7 opacity-85">
              TOTAL PROMPTS <span className="text-[var(--t-green)]">▲ {prompts.length}</span>
            </span>
            <span className="mx-7 opacity-85">
              FUSE.JS SEARCH <span className="text-[var(--t-green)]">✓ ENABLED</span>
            </span>
            {/* Duplicate for seamless scroll */}
            {TERMINAL_CATEGORIES.map((cat) => (
              <span key={`d-${cat}`} className="mx-7 opacity-85">
                {cat.split(" ")[0].toUpperCase()}{" "}
                <span className="text-[var(--t-green)]">▲ {categoryCounts[cat] || 0}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="fixed top-[76px] left-0 right-0 z-[90] bg-[rgba(6,10,15,0.97)] border-b border-[var(--t-border-bright)] backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 flex items-center gap-5 h-16">
          <Link to="/library" className="flex items-baseline gap-2 shrink-0 no-underline">
            <span className="font-bold text-lg text-[var(--t-amber)] tracking-[0.05em]" style={{ textShadow: "0 0 20px rgba(255,184,0,0.5)" }}>
              FINPROMPT
            </span>
            <span className="text-sm text-[var(--t-text-muted)]">//</span>
            <span className="text-[10px] text-[var(--t-text-secondary)] tracking-[0.2em] font-medium uppercase">Terminal v2.0</span>
          </Link>

          <div className="flex-1 max-w-[520px] relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--t-amber-dim)] text-sm pointer-events-none">⌕</span>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search prompts, firms, strategies..."
              aria-label="Search prompts, firms, strategies"
              spellCheck={false}
              autoComplete="off"
              className="w-full bg-[var(--t-bg-3)] border border-[var(--t-border)] text-[var(--t-text-primary)] text-[13px] py-2 pl-9 pr-16 outline-none transition-all tracking-[0.04em] placeholder:text-[var(--t-text-muted)] focus:border-[var(--t-amber)] focus:shadow-[0_0_0_2px_var(--t-amber-glow)]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--t-text-muted)] pointer-events-none">
              {debouncedQuery ? `${filtered.length} found` : `${prompts.length} total`}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="text-[9px] tracking-[0.12em] uppercase px-2.5 py-1 border border-[var(--t-amber-dim)] text-[var(--t-amber-dim)] flex items-center gap-1.5">
              <span className="w-[7px] h-[7px] rounded-full bg-[var(--t-amber-dim)] inline-block" />
              LOCAL
            </div>
            <button
              onClick={() => setFavFilter(!favFilter)}
              className={`bg-transparent border border-[var(--t-border)] text-[11px] px-3.5 py-[7px] cursor-pointer tracking-[0.1em] uppercase transition-all ${
                favFilter ? "bg-[var(--t-amber)] text-black border-[var(--t-amber)] font-bold" : "text-[var(--t-text-secondary)] hover:border-[var(--t-amber)] hover:text-[var(--t-amber)]"
              }`}
            >
              ⭐ FAV {favCount > 0 && `(${favCount})`}
            </button>
            <Link
              to="/"
              className="bg-transparent border border-[var(--t-border)] text-[var(--t-text-secondary)] text-[11px] px-3.5 py-[7px] tracking-[0.1em] uppercase transition-all hover:border-[var(--t-amber)] hover:text-[var(--t-amber)] no-underline"
            >
              MAIN SITE
            </Link>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <nav className="fixed top-[140px] left-0 bottom-0 z-[80] w-[230px] bg-[var(--t-bg-1)] border-r border-[var(--t-border)] overflow-y-auto py-4 hidden lg:block">
        <div className="text-[9px] tracking-[0.25em] text-[rgba(255,255,255,0.6)] uppercase px-4 pb-2 border-b border-[var(--t-border)] mb-2">
          Categories
        </div>
        <button
          onClick={() => setActiveCategory("ALL")}
          aria-pressed={activeCategory === "ALL"}
          className={`w-full flex items-center justify-between px-4 py-2 text-[11px] tracking-[0.04em] cursor-pointer transition-all border-l-2 text-left ${
            activeCategory === "ALL"
              ? "border-l-[var(--t-amber)] bg-[rgba(255,184,0,0.06)] text-[var(--t-amber)]"
              : "border-l-transparent text-[var(--t-text-secondary)] hover:bg-[var(--t-bg-3)] hover:text-[var(--t-text-primary)]"
          }`}
        >
          <span>All Categories</span>
          <span className={`text-[9px] px-[7px] py-px font-semibold ${activeCategory === "ALL" ? "bg-[var(--t-amber)] text-black" : "bg-[var(--t-bg-4)] text-[var(--t-text-muted)]"}`}>
            {prompts.length}
          </span>
        </button>
        {TERMINAL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            aria-pressed={activeCategory === cat}
            className={`w-full flex items-center justify-between px-4 py-2 text-[11px] tracking-[0.04em] cursor-pointer transition-all border-l-2 leading-[1.4] text-left ${
              activeCategory === cat
                ? "border-l-[var(--t-amber)] bg-[rgba(255,184,0,0.06)] text-[var(--t-amber)]"
                : "border-l-transparent text-[var(--t-text-secondary)] hover:bg-[var(--t-bg-3)] hover:text-[var(--t-text-primary)]"
            }`}
          >
            <span>{cat}</span>
            <span className={`text-[9px] px-[7px] py-px font-semibold shrink-0 ${activeCategory === cat ? "bg-[var(--t-amber)] text-black" : "bg-[var(--t-bg-4)] text-[var(--t-text-muted)]"}`}>
              {categoryCounts[cat] || 0}
            </span>
          </button>
        ))}

        <div className="border-t border-[var(--t-border)] my-3" />
        <div className="text-[9px] tracking-[0.25em] text-[rgba(255,255,255,0.6)] uppercase px-4 pb-2 border-b border-[var(--t-border)] mb-2">
          Stats
        </div>
        <div className="flex items-center justify-between px-4 py-2 text-[11px] tracking-[0.04em] border-l-2 border-l-transparent hover:bg-[var(--t-bg-3)] transition-all">
          <span className="text-[var(--t-text-secondary)]">Total</span>
          <span className="text-[9px] px-[7px] py-px font-semibold bg-[var(--t-bg-4)] text-[var(--t-text-muted)]">{prompts.length}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-2 text-[11px] tracking-[0.04em] border-l-2 border-l-transparent hover:bg-[var(--t-bg-3)] transition-all">
          <span className="text-[var(--t-text-secondary)]">Filtered</span>
          <span className="text-[9px] px-[7px] py-px font-semibold bg-[var(--t-bg-4)] text-[var(--t-text-muted)]">{filtered.length}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-2 text-[11px] tracking-[0.04em] border-l-2 border-l-transparent hover:bg-[var(--t-bg-3)] transition-all">
          <span className="text-[var(--t-text-secondary)]">Favorites</span>
          <span className="text-[9px] px-[7px] py-px font-semibold bg-[var(--t-bg-4)] text-[var(--t-text-muted)]">{favCount}</span>
        </div>

        <div className="border-t border-[var(--t-border)] my-3" />
      </nav>

      {/* MAIN CONTENT */}
      <main className="mt-[140px] lg:ml-[230px] p-6 min-h-[calc(100vh-140px)] relative z-[1]">
        {/* View header */}
        <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-[var(--t-border)]">
          <div className="text-[11px] text-[var(--t-text-secondary)] tracking-[0.2em] uppercase flex items-center gap-2.5">
            <span>Showing</span>
            <strong className="text-[var(--t-amber)]">{filtered.length}</strong>
            <span>prompts</span>
          </div>
          <div className="flex gap-1.5">
            {(["id", "title", "category"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                aria-label={`Sort by ${s}`}
                aria-pressed={sort === s}
                className={`bg-transparent border border-[var(--t-border)] text-[10px] px-3 py-[5px] cursor-pointer tracking-[0.1em] uppercase transition-all ${
                  sort === s
                    ? "border-[var(--t-amber)] text-[var(--t-amber)] bg-[rgba(255,184,0,0.07)]"
                    : "text-[var(--t-text-muted)] hover:border-[var(--t-border-bright)] hover:text-[var(--t-text-secondary)]"
                }`}
              >
                {s === "id" ? "ID ↑" : s === "title" ? "A→Z" : "CAT"}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile category filter */}
        <div className="flex flex-wrap gap-2 mb-5 lg:hidden">
          <button
            onClick={() => setActiveCategory("ALL")}
            aria-pressed={activeCategory === "ALL"}
            className={`text-[10px] px-3 py-1.5 border tracking-[0.1em] uppercase ${
              activeCategory === "ALL"
                ? "bg-[var(--t-amber)] text-black border-[var(--t-amber)] font-bold"
                : "bg-transparent border-[var(--t-border)] text-[var(--t-text-secondary)]"
            }`}
          >
            ALL ({prompts.length})
          </button>
          {TERMINAL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              className={`text-[10px] px-3 py-1.5 border tracking-[0.1em] uppercase ${
                activeCategory === cat
                  ? "bg-[var(--t-amber)] text-black border-[var(--t-amber)] font-bold"
                  : "bg-transparent border-[var(--t-border)] text-[var(--t-text-secondary)]"
              }`}
            >
              {cat.split("&")[0].trim()} ({categoryCounts[cat] || 0})
            </button>
          ))}
        </div>

        {/* GRID */}
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(360px, 100%), 1fr))" }}>
          {pagePrompts.map((prompt) => (
            <TerminalCardItem
              key={prompt.id}
              prompt={prompt}
              isFavorite={isFav(prompt.id)}
              isCopied={copiedId === prompt.id}
              onToggle={toggle}
              onCopy={copyPrompt}
              onView={setModalPrompt}
            />
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-20 text-center" style={{ gridColumn: "1/-1" }}>
            <div className="text-[40px] mb-4 opacity-30">⌕</div>
            <div className="text-sm text-[var(--t-text-secondary)] mb-2">No prompts match your filters</div>
            <div className="text-[11px] text-[var(--t-text-muted)]">Try adjusting your search or category</div>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-8 pt-5 border-t border-[var(--t-border)]">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="bg-transparent border border-[var(--t-border)] text-[var(--t-text-secondary)] text-[11px] px-3 py-1.5 cursor-pointer transition-all hover:border-[var(--t-amber)] hover:text-[var(--t-amber)] disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              ← PREV
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) pageNum = i + 1;
              else if (page <= 4) pageNum = i + 1;
              else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
              else pageNum = page - 3 + i;

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  aria-label={`Page ${pageNum}`}
                  aria-current={page === pageNum ? "page" : undefined}
                  className={`bg-transparent border border-[var(--t-border)] text-[11px] px-3 py-1.5 cursor-pointer transition-all ${
                    page === pageNum
                      ? "bg-[var(--t-amber)] text-black border-[var(--t-amber)] font-bold"
                      : "text-[var(--t-text-secondary)] hover:border-[var(--t-amber)] hover:text-[var(--t-amber)]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <span className="text-[10px] text-[var(--t-text-muted)] mx-2">
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="bg-transparent border border-[var(--t-border)] text-[var(--t-text-secondary)] text-[11px] px-3 py-1.5 cursor-pointer transition-all hover:border-[var(--t-amber)] hover:text-[var(--t-amber)] disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              NEXT →
            </button>
          </div>
        )}
      </main>

      {/* MODAL */}
      {modalPrompt && (
        <div
          className="fixed inset-0 z-[200] bg-[rgba(6,10,15,0.92)] backdrop-blur-lg flex items-center justify-center p-6 md:p-10"
          style={{ animation: "t-fade-in 0.15s ease" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalPrompt(null); }}
        >
          <div
            className="bg-[var(--t-bg-2)] border border-[var(--t-border-bright)] w-full max-w-[780px] max-h-[90vh] flex flex-col"
            style={{
              animation: "t-slide-up 0.2s ease",
              boxShadow: "0 32px 80px rgba(0,0,0,.7), 0 0 40px rgba(255,184,0,.06)",
            }}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[var(--t-border-bright)] flex items-start gap-3.5 bg-[var(--t-bg-3)] relative">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--t-amber)] via-[var(--t-amber-dim)] to-transparent" />
              <span className="text-[10px] text-[var(--t-amber)] tracking-[0.2em] shrink-0 pt-0.5">#{modalPrompt.id}</span>
              <div className="text-base font-semibold text-[var(--t-text-primary)] leading-[1.4] flex-1 font-sans-ibm">{modalPrompt.title}</div>
              <button
                onClick={() => setModalPrompt(null)}
                className="bg-transparent border border-[var(--t-border)] text-[var(--t-text-secondary)] text-[13px] w-8 h-8 cursor-pointer flex items-center justify-center shrink-0 transition-all hover:border-[var(--t-red)] hover:text-[var(--t-red)]"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            {/* Modal Meta */}
            <div className="px-5 py-3 border-b border-[var(--t-border)] flex gap-2 flex-wrap bg-[var(--t-bg-2)]">
              <span className="text-[9px] tracking-[0.15em] uppercase text-[var(--t-text-muted)] bg-[var(--t-bg-4)] px-2 py-[3px] border border-transparent transition-all hover:border-[var(--t-amber)] hover:text-[var(--t-amber)] hover:bg-[rgba(255,184,0,0.06)] cursor-default">
                {modalPrompt.category}
              </span>
              {modalPrompt.tags?.map((tag) => (
                <span key={tag} className="text-[9px] tracking-[0.12em] text-[var(--t-amber-dim)] bg-[rgba(255,184,0,0.07)] border border-[rgba(255,184,0,0.15)] px-[7px] py-[2px]">
                  {tag}
                </span>
              ))}
            </div>
            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1">
              <div className="bg-[var(--t-bg-1)] border border-[var(--t-border)] p-5 text-xs leading-[1.85] text-[var(--t-text-primary)] whitespace-pre-wrap font-mono">
                {modalPrompt.prompt_text}
              </div>
            </div>
            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-[var(--t-border)] flex items-center gap-2.5 bg-[var(--t-bg-3)] flex-wrap">
              <button
                aria-label={modalCopied ? "Prompt copied" : "Copy prompt"}
                onClick={() => copyPrompt(modalPrompt, true)}
                className={`border-none text-[11px] font-bold px-6 py-2.5 cursor-pointer tracking-[0.12em] uppercase transition-all ${
                  modalCopied
                    ? "bg-[var(--t-green)] text-black"
                    : "bg-[var(--t-amber)] text-black hover:brightness-110"
                }`}
              >
                {modalCopied ? "✓ COPIED" : "⎘ COPY PROMPT"}
              </button>
              <button
                aria-label={isFav(modalPrompt.id) ? "Remove from saved" : "Save as favorite"}
                onClick={() => toggle(modalPrompt.id)}
                className={`bg-transparent border border-[var(--t-border)] text-[11px] px-5 py-2 cursor-pointer tracking-[0.1em] uppercase transition-all flex items-center gap-2 ${
                  isFav(modalPrompt.id)
                    ? "border-[var(--t-amber)] text-[var(--t-amber)] bg-[var(--t-amber-glow)]"
                    : "text-[var(--t-text-secondary)] hover:border-[var(--t-amber)] hover:text-[var(--t-amber)]"
                }`}
              >
                {isFav(modalPrompt.id) ? "★ SAVED" : "☆ FAVORITE"}
              </button>
              {/* Download buttons */}
              <button
                aria-label="Download prompt as TXT"
                onClick={() => downloadAsTxt({ title: modalPrompt.title, content: modalPrompt.prompt_text, category: modalPrompt.category, platform: "FINPROMPT" })}
                className="bg-transparent border border-[var(--t-border)] text-[var(--t-text-muted)] text-[10px] px-3 py-[5px] cursor-pointer tracking-[0.1em] uppercase transition-all hover:border-[var(--t-amber)] hover:text-[var(--t-amber)]"
              >
                ↓ TXT
              </button>
              <button
                aria-label="Download prompt as HTML"
                onClick={() => downloadAsHtml({ title: modalPrompt.title, content: modalPrompt.prompt_text, category: modalPrompt.category, platform: "FINPROMPT" })}
                className="bg-transparent border border-[var(--t-border)] text-[var(--t-text-muted)] text-[10px] px-3 py-[5px] cursor-pointer tracking-[0.1em] uppercase transition-all hover:border-[var(--t-amber)] hover:text-[var(--t-amber)]"
              >
                ↓ HTML
              </button>
              <button
                aria-label="Download prompt as PDF"
                onClick={() => downloadAsPdf({ title: modalPrompt.title, content: modalPrompt.prompt_text, category: modalPrompt.category, platform: "FINPROMPT" })}
                className="bg-transparent border border-[var(--t-border)] text-[var(--t-text-muted)] text-[10px] px-3 py-[5px] cursor-pointer tracking-[0.1em] uppercase transition-all hover:border-[var(--t-amber)] hover:text-[var(--t-amber)]"
              >
                ↓ PDF
              </button>
              <span className="ml-auto text-[10px] text-[var(--t-text-muted)]">
                {modalPrompt.prompt_text.length} chars
              </span>
            </div>
          </div>
        </div>
      )}
      </div>
      <Footer />
    </div>
  );
}
