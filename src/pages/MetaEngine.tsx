import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  buildMetaPrompt,
  TARGET_PLATFORMS,
  CONTEXT_LEVELS,
  type MetaEngineConfig,
  type MetaPromptResult,
  type TargetPlatform,
  type ContextLevel,
} from "@/lib/metaPromptEngine";
import { detectVariables, buildFilledPrompt } from "@/lib/promptVariables";
import { getSuggestionsForVariable } from "@/lib/variableSuggestions";
import { downloadMarkdown, downloadHTML, downloadPDF } from "@/lib/downloadHelpers";
import { getAllPrompts } from "@/data/prompts";
import { DOMAINS, DOMAIN_ICONS, type Domain } from "@/types/prompt";
import {
  Copy,
  Check,
  Zap,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Cpu,
  BookOpen,
  Sparkles,
  Dice5,
  Search,
  FileText,
  FileCode,
  Printer,
  Wand2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// ─────────────────────────────────────────────
// Platform Style Helpers
// ─────────────────────────────────────────────

function getPlatformGradient(platform: TargetPlatform): string {
  switch (platform) {
    case "gemini": return "from-blue-500/20 via-blue-600/10 to-transparent";
    case "claude": return "from-orange-500/20 via-orange-600/10 to-transparent";
    case "antigravity": return "from-emerald-500/20 via-emerald-600/10 to-transparent";
    case "lovable": return "from-purple-500/20 via-purple-600/10 to-transparent";
    case "codex": return "from-green-500/20 via-green-600/10 to-transparent";
    default: return "from-gold/20 via-gold/10 to-transparent";
  }
}

function getPlatformBorder(platform: TargetPlatform): string {
  switch (platform) {
    case "gemini": return "border-blue-500/40";
    case "claude": return "border-orange-500/40";
    case "antigravity": return "border-emerald-500/40";
    case "lovable": return "border-purple-500/40";
    case "codex": return "border-green-500/40";
    default: return "border-gold/40";
  }
}

function getPlatformText(platform: TargetPlatform): string {
  switch (platform) {
    case "gemini": return "text-blue-400";
    case "claude": return "text-orange-400";
    case "antigravity": return "text-emerald-400";
    case "lovable": return "text-purple-400";
    case "codex": return "text-green-400";
    default: return "text-gold";
  }
}

function getLovableDeepLink(prompt: string): string {
  const encoded = encodeURIComponent(prompt.slice(0, 2000));
  return `https://lovable.dev/new?prompt=${encoded}`;
}

// ─────────────────────────────────────────────
// Workshop Browse Modal
// ─────────────────────────────────────────────

function WorkshopBrowseModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string, title: string, content: string, platform: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState<Domain | "all">("all");
  const allPrompts = getAllPrompts();

  const filtered = useMemo(
    () =>
      allPrompts
        .filter(
          (p) =>
            (domain === "all" || p.domain === domain) &&
            (search === "" ||
              p.title.toLowerCase().includes(search.toLowerCase()) ||
              p.content.toLowerCase().includes(search.toLowerCase()))
        )
        .slice(0, 40),
    [allPrompts, search, domain]
  );

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl border border-border/50 bg-[#0d1117] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "82vh", display: "flex", flexDirection: "column" }}
      >
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gold" />
            <h3 className="font-display text-sm font-semibold text-foreground">Browse FinPrompt Library</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none">×</button>
        </div>
        <div className="flex gap-2 border-b border-border/50 px-5 py-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search prompts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full rounded-md border border-border/50 bg-secondary/30 pl-8 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold/50"
            />
          </div>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value as Domain | "all")}
            className="rounded-md border border-border/50 bg-secondary/30 px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-gold/50"
          >
            <option value="all">All Domains</option>
            {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="overflow-y-auto flex-1">
          {filtered.map((p) => (
            <button
              key={p.id}
              className="w-full border-b border-border/30 px-5 py-3 text-left transition-colors hover:bg-secondary/30 focus:outline-none"
              onClick={() => { onSelect(p.id, p.title, p.content, p.platform); onClose(); }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{p.content.slice(0, 130)}…</p>
                </div>
                <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-secondary/50 text-muted-foreground">{p.platform}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No prompts found — try adjusting search or domain</p>
          )}
        </div>
        <div className="border-t border-border/30 px-5 py-2.5">
          <p className="text-[11px] text-muted-foreground/85">{filtered.length} of {allPrompts.length} prompts shown</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Placeholder hints for common variable names
// ─────────────────────────────────────────────

const VARIABLE_HINTS: Record<string, string> = {
  "COMPANY NAME": "Tata Pharmaceuticals",
  "COMPANY": "Reliance Industries",
  "TARGET COMPANY NAME": "HDFC Bank",
  "ACQUIRER NAME": "Tata Group",
  "TARGET NAME": "Cipla Ltd",
  "INDUSTRY": "Indian Pharma / Healthcare",
  "SECTOR": "Financial Services",
  "TICKER SYMBOL": "RELIANCE.NS",
  "LTM REVENUE": "$500M",
  "LTM EBITDA": "$120M",
  "EBITDA MARGIN": "24%",
  "CURRENT EBITDA MARGIN": "18%",
  "TARGET EBITDA MARGIN": "26%",
  "DEAL SIZE": "$2.5B",
  "PROPOSED DEAL SIZE / ENTERPRISE VALUE": "$800M",
  "ENTRY EV/EBITDA MULTIPLE": "10x",
  "PROPOSED ENTRY EV/EBITDA MULTIPLE": "9.5x",
  "TARGET HOLD PERIOD": "5 years",
  "HOLD PERIOD": "4-6 years",
  "EBITDA GROWTH RATE": "12% CAGR",
  "GROWTH RATE": "15% YoY",
  "MARKET GROWTH RATE": "8% CAGR",
  "CURRENT STOCK PRICE": "₹2,450",
  "CURRENT PRICE": "$145.50",
  "NET DEBT": "$300M",
  "SHARES OUTSTANDING": "500M",
  "CURRENT PORTFOLIO ALLOCATION": "60% equity, 30% fixed income, 10% alternatives",
  "GEOGRAPHIC FOCUS": "South Asia / India",
  "TARGET COUNTRY/REGION": "India / Southeast Asia",
  "INVESTMENT HORIZON": "10 years",
  "DEAL RATIONALE": "Geographic expansion + margin improvement",
  "STRATEGIC RATIONALE FOR ENTERING THIS MARKET": "Tap into India's growing middle class healthcare demand",
};

function getVariablePlaceholder(varName: string): string {
  return VARIABLE_HINTS[varName] ?? varName.split(" ").map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

// ─────────────────────────────────────────────
// Workshop Panel (Library → Variables → Tweaks)
// ─────────────────────────────────────────────

interface WorkshopSelectedPrompt {
  id: string;
  title: string;
  content: string;
  platform: string;
}

function WorkshopPanel({
  onApply,
}: {
  onApply: (filledText: string, sourceTitle: string) => void;
}) {
  const [showBrowse, setShowBrowse] = useState(false);
  const [selected, setSelected] = useState<WorkshopSelectedPrompt | null>(null);
  const [vars, setVars] = useState<Record<string, string>>({});
  const [tweaks, setTweaks] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const varsRef = useRef<HTMLDivElement>(null);

  const allPrompts = useMemo(() => getAllPrompts(), []);

  const detectedVars = useMemo(
    () => (selected ? detectVariables(selected.content) : []),
    [selected]
  );

  // Auto-scroll to variable fields when a prompt is selected
  useEffect(() => {
    if (selected && detectedVars.length > 0) {
      setTimeout(() => {
        varsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 120);
    }
  }, [selected, detectedVars.length]);

  // Surprise Me: pick a random prompt that has at least 1 variable
  const handleSurpriseMe = useCallback(() => {
    const candidates = allPrompts.filter((p) => detectVariables(p.content).length > 0);
    if (!candidates.length) return;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    setSelected({ id: pick.id, title: pick.title, content: pick.content, platform: pick.platform });
    setVars({});
    setTweaks("");
  }, [allPrompts]);

  const handleSelectFromBrowse = useCallback(
    (id: string, title: string, content: string, platform: string) => {
      setSelected({ id, title, content, platform });
      setVars({});
      setTweaks("");
    },
    []
  );

  const handleClearSelection = () => {
    setSelected(null);
    setVars({});
    setTweaks("");
  };

  const handleApply = () => {
    if (!selected) return;
    const filled = buildFilledPrompt(selected.content, vars, tweaks);
    onApply(filled, selected.title);
  };

  const filledCount = Object.values(vars).filter((v) => v.trim()).length;

  return (
    <>
      <WorkshopBrowseModal
        isOpen={showBrowse}
        onClose={() => setShowBrowse(false)}
        onSelect={handleSelectFromBrowse}
      />

      <div className="rounded-xl border border-gold/20 bg-gradient-to-br from-[#0e1320] to-[#141c2a] overflow-hidden">
        {/* Workshop Header */}
        <button
          className="flex w-full items-center justify-between px-5 py-3.5 text-left hover:bg-white/5 transition-colors focus:outline-none"
          onClick={() => setIsOpen((o) => !o)}
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2.5">
            <Wand2 className="h-4 w-4 text-gold" />
            <span className="text-sm font-semibold uppercase tracking-wider text-gold/90">
              Library Workshop
            </span>
            <span className="rounded-full bg-gold/10 border border-gold/20 px-2 py-0.5 text-[10px] font-mono text-gold/70 uppercase tracking-wider">
              Fill-in Mode
            </span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {isOpen && (
          <div className="border-t border-gold/10 px-5 pb-5 pt-4 flex flex-col gap-4">
            {/* Surprise Me + Browse Row */}
            <div className="flex gap-2">
              <button
                id="surprise-me-btn"
                onClick={handleSurpriseMe}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold transition-all hover:bg-gold/20 hover:border-gold/50 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gold/50"
              >
                <Dice5 className="h-4 w-4" />
                Surprise Me!
              </button>
              <button
                id="browse-library-btn"
                onClick={() => setShowBrowse(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border/50 bg-secondary/20 px-4 py-2.5 text-sm text-muted-foreground transition-all hover:border-gold/40 hover:text-gold hover:bg-secondary/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
              >
                <Search className="h-4 w-4" />
                Browse Library
              </button>
            </div>

            {/* Selected Prompt Preview */}
            {selected && (
              <div className="rounded-lg border border-gold/20 bg-[#0a0e14]/80">
                <div className="flex items-center justify-between border-b border-gold/10 px-4 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-gold/70 font-mono shrink-0">[{selected.platform}]</span>
                    <p className="text-sm font-medium text-foreground truncate">{selected.title}</p>
                  </div>
                  <button
                    onClick={handleClearSelection}
                    className="shrink-0 ml-2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear selection"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="px-4 py-2.5 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {selected.content.slice(0, 220)}…
                </p>
              </div>
            )}

            {/* Detected Variable Fields */}
            {selected && detectedVars.length > 0 && (
              <div ref={varsRef}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gold/80">
                    Fill Input Variables
                  </p>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono ${
                    filledCount === detectedVars.length
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-gold/10 text-gold"
                  }`}>
                    {filledCount}/{detectedVars.length} filled
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {detectedVars.map((v, i) => {
                    const suggestionGroups = getSuggestionsForVariable(v);
                    const datalistId = `suggest-${v.replace(/[^a-zA-Z0-9]/g, "_")}`;
                    return (
                      <div key={v}>
                        <label className="mb-1 block text-[11px] font-semibold font-mono uppercase tracking-wider text-muted-foreground">
                          {v}
                          {!vars[v]?.trim() && (
                            <span className="ml-1.5 font-normal normal-case tracking-normal text-muted-foreground/70">required</span>
                          )}
                          {vars[v]?.trim() && (
                            <span className="ml-1.5 font-normal normal-case tracking-normal text-emerald-500/70">✓</span>
                          )}
                        </label>
                        <input
                          type="text"
                          list={suggestionGroups.length > 0 ? datalistId : undefined}
                          placeholder={`e.g. ${getVariablePlaceholder(v)}`}
                          value={vars[v] ?? ""}
                          autoFocus={i === 0}
                          onChange={(e) => setVars((prev) => ({ ...prev, [v]: e.target.value }))}
                          className={`w-full rounded-md border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 transition-colors ${
                            vars[v]?.trim()
                              ? "border-emerald-500/30 bg-emerald-500/5 focus:ring-emerald-500/30"
                              : "border-border/50 bg-secondary/20 focus:ring-gold/50"
                          }`}
                        />
                        {suggestionGroups.length > 0 && (
                          <>
                            <datalist id={datalistId}>
                              {suggestionGroups.flatMap((g) =>
                                g.options.map((opt) => (
                                  <option key={`${g.label}-${opt}`} value={opt} label={g.label} />
                                ))
                              )}
                            </datalist>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {suggestionGroups.slice(0, 1).flatMap((g) =>
                                g.options.slice(0, 4).map((opt) => (
                                  <button
                                    key={`chip-${opt}`}
                                    type="button"
                                    onClick={() => setVars((prev) => ({ ...prev, [v]: opt }))}
                                    className="rounded border border-gold/20 bg-gold/5 px-2 py-0.5 text-[10px] text-gold/80 hover:bg-gold/15 hover:text-gold transition-colors"
                                  >
                                    {opt}
                                  </button>
                                ))
                              )}
                              <span className="text-[9px] text-muted-foreground/70 italic self-center ml-1">
                                or type your own · {suggestionGroups.reduce((n, g) => n + g.options.length, 0)} suggestions
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selected && detectedVars.length === 0 && (
              <p className="text-xs text-muted-foreground/85 italic">
                No input variables detected in this prompt — you can still add custom tweaks below.
              </p>
            )}

            {/* Custom Tweaks */}
            {selected && (
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Custom Tweaks & Modifications
                  <span className="ml-1.5 normal-case tracking-normal font-normal text-muted-foreground/85">(optional)</span>
                </label>
                <Textarea
                  placeholder="e.g. Focus on the Indian market context. Add a section on regulatory risks from SEBI. Use a 5-year horizon…"
                  className="min-h-[80px] resize-y bg-secondary/20 border-border/50 text-sm placeholder:text-muted-foreground/80 focus:ring-gold/40"
                  value={tweaks}
                  onChange={(e) => setTweaks(e.target.value)}
                  maxLength={500}
                />
                <p className="mt-1 text-right text-[10px] text-muted-foreground/80">{tweaks.length}/500</p>
              </div>
            )}

            {/* Apply Button */}
            {selected && (
              <Button
                id="workshop-apply-btn"
                onClick={handleApply}
                className="w-full gap-2 gradient-gold text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <Wand2 className="h-4 w-4" />
                Build &amp; Preview Prompt →
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Remix Picker (for Meta-Engine synthesis mode)
// ─────────────────────────────────────────────

function RemixPicker({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string, title: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState<Domain | "all">("all");
  const allPrompts = getAllPrompts();
  const filtered = allPrompts
    .filter(
      (p) =>
        (domain === "all" || p.domain === domain) &&
        (search === "" ||
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.content.toLowerCase().includes(search.toLowerCase()))
    )
    .slice(0, 30);

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl border border-border/50 bg-[#0d1117] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "80vh", display: "flex", flexDirection: "column" }}
      >
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gold" />
            <h3 className="font-display text-sm font-semibold text-foreground">Remix from FinPrompt Library</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none">×</button>
        </div>
        <div className="flex gap-2 border-b border-border/50 px-5 py-3">
          <input
            type="text"
            placeholder="Search prompts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-md border border-border/50 bg-secondary/30 px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold/50"
          />
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value as Domain | "all")}
            className="rounded-md border border-border/50 bg-secondary/30 px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-gold/50"
          >
            <option value="all">All Domains</option>
            {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="overflow-y-auto flex-1">
          {filtered.map((p) => (
            <button
              key={p.id}
              className="w-full border-b border-border/30 px-5 py-3 text-left transition-colors hover:bg-secondary/30 focus:outline-none"
              onClick={() => { onSelect(p.id, p.title); onClose(); }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{p.content.slice(0, 120)}…</p>
                </div>
                <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-secondary/50 text-muted-foreground">{p.platform}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">No prompts found</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Download Button Row
// ─────────────────────────────────────────────

function DownloadRow({
  promptText,
  title,
}: {
  promptText: string;
  title: string;
}) {
  const { toast } = useToast();
  const [pdfClicked, setPdfClicked] = useState(false);

  const handlePDF = () => {
    downloadPDF(promptText, title);
    setPdfClicked(true);
    toast({ title: "Print dialog opened", description: "Use your browser's Save as PDF option." });
    setTimeout(() => setPdfClicked(false), 2500);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/85 mr-1">Download:</span>
      <button
        onClick={() => { downloadMarkdown(promptText, title); toast({ title: "Downloaded .md" }); }}
        className="flex items-center gap-1 rounded border border-border/50 bg-secondary/20 px-2.5 py-1 text-[11px] text-muted-foreground transition-all hover:border-gold/40 hover:text-gold focus:outline-none"
        title="Download as Markdown"
      >
        <FileText className="h-3 w-3" />
        .md
      </button>
      <button
        onClick={() => { downloadHTML(promptText, title); toast({ title: "Downloaded .html" }); }}
        className="flex items-center gap-1 rounded border border-border/50 bg-secondary/20 px-2.5 py-1 text-[11px] text-muted-foreground transition-all hover:border-gold/40 hover:text-gold focus:outline-none"
        title="Download as HTML"
      >
        <FileCode className="h-3 w-3" />
        .html
      </button>
      <button
        onClick={handlePDF}
        className={`flex items-center gap-1 rounded border px-2.5 py-1 text-[11px] transition-all focus:outline-none ${
          pdfClicked
            ? "border-gold/40 bg-gold/10 text-gold"
            : "border-border/50 bg-secondary/20 text-muted-foreground hover:border-gold/40 hover:text-gold"
        }`}
        title="Print / Save as PDF"
      >
        <Printer className="h-3 w-3" />
        PDF
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Unified Output Panel
// ─────────────────────────────────────────────

type OutputEntry =
  | { mode: "synthesis"; result: MetaPromptResult }
  | { mode: "workshop"; text: string; sourceTitle: string; generatedAt: string };

function OutputPanel({
  entry,
  isGenerating,
  onRegenerate,
  onCopy,
  copied,
  showSources,
  onToggleSources,
  outputRef,
}: {
  entry: OutputEntry | null;
  isGenerating: boolean;
  onRegenerate: () => void;
  onCopy: () => void;
  copied: boolean;
  showSources: boolean;
  onToggleSources: () => void;
  outputRef: React.RefObject<HTMLPreElement>;
}) {
  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-card/20 py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 border border-gold/20">
          <Cpu className="h-8 w-8 text-gold/60" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">Your prompt will appear here</h3>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Use the{" "}
          <span className="text-gold font-medium">Library Workshop</span> above the form to fill a template, or fill parameters below and click{" "}
          <span className="text-gold font-medium">Generate Meta-Prompt</span>.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {TARGET_PLATFORMS.map((p) => (
            <span
              key={p.key}
              className="flex items-center gap-1 rounded-full border border-border/40 bg-secondary/30 px-3 py-1 text-[11px] text-muted-foreground"
            >
              {p.emoji} {p.label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const isWorkshop = entry.mode === "workshop";
  const promptText = isWorkshop ? entry.text : entry.result.prompt;
  const title = isWorkshop ? `Workshop: ${entry.sourceTitle}` : entry.result.title;
  const platform = isWorkshop ? null : entry.result.platform;
  const generatedAt = isWorkshop ? entry.generatedAt : entry.result.generatedAt;
  const wordCount = promptText.split(/\s+/).filter(Boolean).length;

  const borderClass = platform ? getPlatformBorder(platform) : "border-gold/30";
  const platformColor = platform
    ? TARGET_PLATFORMS.find((p) => p.key === platform)?.color ?? "hsl(45,85%,55%)"
    : "hsl(45,85%,55%)";

  return (
    <div className="flex flex-col gap-4">
      <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br from-[#0a0e14] to-[#141c2a] ${borderClass}`}>
        {/* Color top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${platformColor}, transparent)` }}
        />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/30 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {isWorkshop ? "Workshop Output" : "Generated Prompt"}
              </p>
              {isWorkshop && (
                <span className="rounded-full bg-gold/10 border border-gold/20 px-2 py-0.5 text-[10px] font-mono text-gold/70">
                  Fill-in Mode
                </span>
              )}
            </div>
            <p className={`mt-0.5 text-sm font-medium truncate max-w-[280px] ${platform ? getPlatformText(platform) : "text-gold"}`}>
              {title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isWorkshop && (
              <Button
                id="regenerate-btn"
                variant="outline"
                size="sm"
                className="gap-1.5 border-border/50 text-xs hover:border-gold/40 hover:text-gold"
                onClick={onRegenerate}
                disabled={isGenerating}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </Button>
            )}
            <Button
              id="copy-btn"
              variant="outline"
              size="sm"
              className={`gap-1.5 text-xs transition-colors ${
                copied
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-border/50 hover:border-gold/40 hover:text-gold"
              }`}
              onClick={onCopy}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Prompt Text */}
        <pre
          ref={outputRef}
          id="prompt-output"
          className="overflow-x-auto whitespace-pre-wrap break-words p-5 font-mono text-sm text-[#c9c1ad] leading-relaxed"
          style={{ maxHeight: "60vh", overflowY: "auto" }}
        >
          {promptText}
        </pre>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border/30 px-5 py-3">
          {/* Platform-specific actions */}
          {platform === "lovable" && (
            <a
              id="open-lovable-btn"
              href={getLovableDeepLink(promptText)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-300 transition-all hover:bg-purple-500/20"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in Lovable
            </a>
          )}
          {platform === "antigravity" && (
            <button
              id="open-antigravity-btn"
              onClick={onCopy}
              className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 transition-all hover:bg-emerald-500/20"
              title="Copy mission prompt — paste directly into Antigravity"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy for Antigravity
            </button>
          )}

          {/* Download buttons */}
          <DownloadRow promptText={promptText} title={title} />

          <span className="ml-auto text-[11px] text-muted-foreground/80 font-mono shrink-0">
            {wordCount}w · {new Date(generatedAt).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Source Prompts (synthesis mode only) */}
      {!isWorkshop && entry.result.sourcePrompts.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card/30">
          <button
            id="toggle-sources-btn"
            className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-secondary/20 transition-colors rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50"
            onClick={onToggleSources}
            aria-expanded={showSources}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gold" />
              <span className="text-sm font-medium text-foreground">Source Prompts Used</span>
              <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[11px] text-gold">{entry.result.sourcePrompts.length}</span>
            </div>
            {showSources ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {showSources && (
            <div className="border-t border-border/30 divide-y divide-border/30">
              {entry.result.sourcePrompts.map((src) => (
                <div key={src.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground truncate">{src.title}</p>
                    <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-secondary/50 text-muted-foreground">{src.platform}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{src.snippet}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main MetaEngine Page
// ─────────────────────────────────────────────

const MetaEngine = () => {
  const { toast } = useToast();

  // ── Synthesis Form State ──
  const [objective, setObjective] = useState("");
  const [platform, setPlatform] = useState<TargetPlatform>("gemini");
  const [contextLevel, setContextLevel] = useState<ContextLevel>("simple");
  const [domain, setDomain] = useState<Domain | "all">("all");
  const [remixId, setRemixId] = useState<string | null>(null);
  const [remixTitle, setRemixTitle] = useState<string | null>(null);

  // ── Output State ──
  const [outputEntry, setOutputEntry] = useState<OutputEntry | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const outputRef = useRef<HTMLPreElement>(null);

  // ── Workshop Apply ──
  const handleWorkshopApply = useCallback(
    (filledText: string, sourceTitle: string) => {
      setOutputEntry({
        mode: "workshop",
        text: filledText,
        sourceTitle,
        generatedAt: new Date().toISOString(),
      });
      setShowSources(false);
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 120);
      toast({ title: "Prompt built!", description: "Your filled prompt is ready to copy or download." });
    },
    [toast]
  );

  // ── Synthesis Generate ──
  const handleGenerate = useCallback(
    (shuffle = false) => {
      if (!objective.trim()) {
        toast({ title: "Objective required", description: "Please describe what you want the prompt to achieve.", variant: "destructive" });
        return;
      }
      setIsGenerating(true);
      setTimeout(() => {
        try {
          const config: MetaEngineConfig = {
            objective: objective.trim(),
            platform,
            contextLevel,
            domain,
            remixPromptId: remixId || null,
          };
          if (shuffle) { /* triggers fresh lookup via buildMetaPrompt */ }
          const res = buildMetaPrompt(config);
          setOutputEntry({ mode: "synthesis", result: res });
          setShowSources(false);
          setTimeout(() => {
            outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }, 100);
        } catch {
          toast({ title: "Generation failed", description: "Something went wrong. Please try again.", variant: "destructive" });
        } finally {
          setIsGenerating(false);
        }
      }, 600);
    },
    [objective, platform, contextLevel, domain, remixId, toast]
  );

  // Auto-regenerate on filter change if synthesis mode
  useEffect(() => {
    if (outputEntry?.mode === "synthesis" && objective.trim()) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, contextLevel, domain]);

  // ── Copy ──
  const handleCopy = useCallback(async () => {
    if (!outputEntry) return;
    const text = outputEntry.mode === "workshop" ? outputEntry.text : outputEntry.result.prompt;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Copied!", description: "Prompt copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Please copy manually.", variant: "destructive" });
    }
  }, [outputEntry, toast]);

  const headerProps = { search: "", onSearchChange: () => {}, showFavorites: false, onToggleFavorites: () => {}, favCount: 0 };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header {...headerProps} />

      <RemixPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(id, title) => { setRemixId(id); setRemixTitle(title); }}
      />

      <main className="container mx-auto flex-1 px-4 py-8">
        {/* Page Header */}
        <section className="mb-8">
          <Link to="/" className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Hub
          </Link>
          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-[#0a0e14] to-[#141c2a] px-6 py-7 md:px-8">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)" }} />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-70" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gold/10 border border-gold/20">
                <Cpu className="h-7 w-7 text-gold" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="font-display text-2xl font-bold text-[#e8e0cc] md:text-3xl">Meta-Prompt Engine</h1>
                  <span className="text-[9px] tracking-[0.2em] uppercase text-gold/70 bg-gold/10 border border-gold/20 px-2 py-0.5 rounded font-mono">v1.1</span>
                </div>
                <p className="text-sm text-[#8a8070] font-mono">
                  Prompt Architect · Fill-in Workshop · Variable substitution · Download MD / HTML / PDF
                </p>
              </div>
            </div>
            <div className="relative mt-5 pt-4 border-t border-gold/10 flex flex-wrap gap-4 font-mono text-[10px] tracking-[0.15em] uppercase text-[#8a8070]">
              <span>Gemini <span className="text-blue-400">✦</span></span>
              <span>Claude <span className="text-orange-400">⬡</span></span>
              <span>Antigravity <span className="text-emerald-400">🤖</span></span>
              <span>Lovable <span className="text-purple-400">💜</span></span>
              <span>Codex <span className="text-green-400">⌨</span></span>
            </div>
          </div>
        </section>

        {/* Two-Panel Layout */}
        <div className="grid gap-6 lg:grid-cols-[420px,1fr]">
          {/* ─── LEFT PANEL ─── */}
          <aside className="flex flex-col gap-5">

            {/* Library Workshop — above objective */}
            <WorkshopPanel onApply={handleWorkshopApply} />

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-border/30" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/80">or synthesize</span>
              <div className="flex-1 border-t border-border/30" />
            </div>

            {/* Objective */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-5">
              <label htmlFor="engine-objective" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Objective *
              </label>
              <Textarea
                id="engine-objective"
                placeholder="e.g. Analyze the strategic rationale for a PE-backed carve-out in the Indian pharma sector with LBO modeling…"
                className="min-h-[110px] resize-y bg-secondary/30 border-border/50 text-sm placeholder:text-muted-foreground/85 focus:ring-gold/40"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                maxLength={1000}
              />
              <p className="mt-1 text-right text-[11px] text-muted-foreground/85">{objective.length}/1000</p>
            </div>

            {/* Target Platform */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Platform</p>
              <div className="grid grid-cols-1 gap-2">
                {TARGET_PLATFORMS.map((p) => (
                  <button
                    key={p.key}
                    id={`platform-${p.key}`}
                    aria-pressed={platform === p.key}
                    onClick={() => setPlatform(p.key)}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-left transition-all hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                      platform === p.key
                        ? `border-gold/50 bg-gradient-to-r ${getPlatformGradient(p.key)} shadow-sm`
                        : "border-border/50 bg-secondary/20 hover:border-border hover:bg-secondary/40"
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-lg" style={{ background: `${p.color}22` }}>
                      {p.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${platform === p.key ? getPlatformText(p.key) : "text-foreground"}`}>{p.label}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{p.description}</p>
                    </div>
                    {platform === p.key && <Sparkles className="ml-auto h-3.5 w-3.5 shrink-0 text-gold/70" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Context Level */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Context Level</p>
              <div className="grid grid-cols-2 gap-2">
                {CONTEXT_LEVELS.map((c) => (
                  <button
                    key={c.key}
                    id={`context-${c.key}`}
                    aria-pressed={contextLevel === c.key}
                    onClick={() => setContextLevel(c.key)}
                    className={`flex flex-col rounded-lg border px-4 py-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                      contextLevel === c.key ? "border-gold/50 bg-gold/10" : "border-border/50 bg-secondary/20 hover:border-border hover:bg-secondary/40"
                    }`}
                  >
                    <span className={`text-sm font-semibold ${contextLevel === c.key ? "text-gold" : "text-foreground"}`}>{c.label}</span>
                    <span className="mt-0.5 text-[11px] text-muted-foreground">{c.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Finance Domain */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Finance Domain</p>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  id="domain-all"
                  aria-pressed={domain === "all"}
                  onClick={() => setDomain("all")}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                    domain === "all" ? "border-gold/50 bg-gold/10 text-gold" : "border-border/50 bg-secondary/20 text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <span>🌐</span><span>All Domains</span>
                </button>
                {DOMAINS.map((d) => (
                  <button
                    key={d}
                    id={`domain-${d.replace(/\W+/g, "-").toLowerCase()}`}
                    aria-pressed={domain === d}
                    onClick={() => setDomain(d)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                      domain === d ? "border-gold/50 bg-gold/10 text-gold" : "border-border/50 bg-secondary/20 text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                    }`}
                  >
                    <span>{DOMAIN_ICONS[d]}</span>
                    <span className="truncate">{d}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Remix Picker */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Remix from Library
                <span className="ml-1 text-[10px] normal-case tracking-normal font-normal text-muted-foreground/85">(optional)</span>
              </p>
              {remixId ? (
                <div className="flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/5 px-3 py-2">
                  <BookOpen className="h-4 w-4 shrink-0 text-gold" />
                  <span className="flex-1 truncate text-sm text-foreground">{remixTitle}</span>
                  <button onClick={() => { setRemixId(null); setRemixTitle(null); }} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" aria-label="Remove remix selection">×</button>
                </div>
              ) : (
                <button
                  id="remix-picker-btn"
                  onClick={() => setIsPickerOpen(true)}
                  className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border/50 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold/50"
                >
                  <BookOpen className="h-4 w-4" />
                  Pick a prompt to remix…
                </button>
              )}
            </div>

            {/* Generate Button */}
            <Button
              id="generate-btn"
              size="lg"
              onClick={() => handleGenerate(false)}
              disabled={isGenerating || !objective.trim()}
              className="w-full gap-2 gradient-gold text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isGenerating ? (
                <><RefreshCw className="h-4 w-4 animate-spin" />Synthesizing…</>
              ) : (
                <><Zap className="h-4 w-4" />Generate Meta-Prompt</>
              )}
            </Button>
          </aside>

          {/* ─── RIGHT PANEL: Output ─── */}
          <section>
            <OutputPanel
              entry={outputEntry}
              isGenerating={isGenerating}
              onRegenerate={() => handleGenerate(true)}
              onCopy={handleCopy}
              copied={copied}
              showSources={showSources}
              onToggleSources={() => setShowSources((s) => !s)}
              outputRef={outputRef}
            />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MetaEngine;
