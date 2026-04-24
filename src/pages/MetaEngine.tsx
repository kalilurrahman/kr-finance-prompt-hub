import { useState, useCallback, useEffect, useRef } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getPlatformGradient(platform: TargetPlatform): string {
  switch (platform) {
    case "gemini":
      return "from-blue-500/20 via-blue-600/10 to-transparent";
    case "claude":
      return "from-orange-500/20 via-orange-600/10 to-transparent";
    case "antigravity":
      return "from-emerald-500/20 via-emerald-600/10 to-transparent";
    case "lovable":
      return "from-purple-500/20 via-purple-600/10 to-transparent";
    case "codex":
      return "from-green-500/20 via-green-600/10 to-transparent";
    default:
      return "from-gold/20 via-gold/10 to-transparent";
  }
}

function getPlatformBorder(platform: TargetPlatform): string {
  switch (platform) {
    case "gemini":
      return "border-blue-500/40";
    case "claude":
      return "border-orange-500/40";
    case "antigravity":
      return "border-emerald-500/40";
    case "lovable":
      return "border-purple-500/40";
    case "codex":
      return "border-green-500/40";
    default:
      return "border-gold/40";
  }
}

function getPlatformText(platform: TargetPlatform): string {
  switch (platform) {
    case "gemini":
      return "text-blue-400";
    case "claude":
      return "text-orange-400";
    case "antigravity":
      return "text-emerald-400";
    case "lovable":
      return "text-purple-400";
    case "codex":
      return "text-green-400";
    default:
      return "text-gold";
  }
}

function getLovableDeepLink(prompt: string): string {
  // Lovable doesn't have an official deep link, we encode and open chat mode
  const encoded = encodeURIComponent(prompt.slice(0, 2000));
  return `https://lovable.dev/new?prompt=${encoded}`;
}

// ─────────────────────────────────────────────
// Remix Picker Modal
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gold" />
            <h3 className="font-display text-sm font-semibold text-foreground">
              Remix from FinPrompt Library
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Filters */}
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
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {filtered.map((p) => (
            <button
              key={p.id}
              className="w-full border-b border-border/30 px-5 py-3 text-left transition-colors hover:bg-secondary/30 focus:outline-none focus:bg-secondary/40"
              onClick={() => {
                onSelect(p.id, p.title);
                onClose();
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {p.content.slice(0, 120)}…
                  </p>
                </div>
                <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-secondary/50 text-muted-foreground">
                  {p.platform}
                </span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No prompts found — try a different search or domain
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main MetaEngine Page
// ─────────────────────────────────────────────

const MetaEngine = () => {
  const { toast } = useToast();

  // ── Form State ──
  const [objective, setObjective] = useState("");
  const [platform, setPlatform] = useState<TargetPlatform>("gemini");
  const [contextLevel, setContextLevel] = useState<ContextLevel>("simple");
  const [domain, setDomain] = useState<Domain | "all">("all");
  const [remixId, setRemixId] = useState<string | null>(null);
  const [remixTitle, setRemixTitle] = useState<string | null>(null);

  // ── Output State ──
  const [result, setResult] = useState<MetaPromptResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [generationCount, setGenerationCount] = useState(0); // used to trigger re-generation

  const outputRef = useRef<HTMLPreElement>(null);

  // ── Generate ──
  const handleGenerate = useCallback(
    (shuffle = false) => {
      if (!objective.trim()) {
        toast({
          title: "Objective required",
          description: "Please describe what you want the prompt to achieve.",
          variant: "destructive",
        });
        return;
      }

      setIsGenerating(true);

      // Small delay for UX feedback
      setTimeout(() => {
        try {
          const config: MetaEngineConfig = {
            objective: objective.trim(),
            platform,
            contextLevel,
            domain,
            remixPromptId: remixId || null,
          };

          // Shuffle = scramble the allPrompts cache order to get variation
          if (shuffle) {
            setGenerationCount((c) => c + 1);
          }

          const res = buildMetaPrompt(config);
          setResult(res);
          setShowSources(false);

          // Scroll output into view on mobile
          setTimeout(() => {
            outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }, 100);
        } catch (err) {
          toast({
            title: "Generation failed",
            description: "Something went wrong. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsGenerating(false);
        }
      }, 600);
    },
    [objective, platform, contextLevel, domain, remixId, toast]
  );

  // Auto-generate on platform/context/domain change if there's already a result
  useEffect(() => {
    if (result && objective.trim()) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, contextLevel, domain]);

  // ── Copy ──
  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      toast({ title: "Copied!", description: "Prompt copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Please copy manually.", variant: "destructive" });
    }
  }, [result, toast]);

  // ── Dummy header props (engine page has no search) ──
  const headerProps = {
    search: "",
    onSearchChange: () => {},
    showFavorites: false,
    onToggleFavorites: () => {},
    favCount: 0,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header {...headerProps} />

      {/* Remix Picker Modal */}
      <RemixPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(id, title) => {
          setRemixId(id);
          setRemixTitle(title);
        }}
      />

      <main className="container mx-auto flex-1 px-4 py-8">
        {/* Page Header */}
        <section className="mb-8">
          <Link
            to="/"
            className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Hub
          </Link>

          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-[#0a0e14] to-[#141c2a] px-6 py-7 md:px-8">
            {/* Scanlines */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
              }}
            />
            {/* Gold top line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-70" />

            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gold/10 border border-gold/20">
                <Cpu className="h-7 w-7 text-gold" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="font-display text-2xl font-bold text-[#e8e0cc] md:text-3xl">
                    Meta-Prompt Engine
                  </h1>
                  <span className="text-[9px] tracking-[0.2em] uppercase text-gold/70 bg-gold/10 border border-gold/20 px-2 py-0.5 rounded font-mono">
                    v1.0
                  </span>
                </div>
                <p className="text-sm text-[#8a8070] font-mono">
                  Prompt Architect · Cross-references FinPrompt library · 5 platform templates ·
                  Enterprise-grade context synthesis
                </p>
              </div>
            </div>

            {/* Mini stats */}
            <div className="relative mt-5 pt-4 border-t border-gold/10 flex flex-wrap gap-4 font-mono text-[10px] tracking-[0.15em] uppercase text-[#8a8070]">
              <span>
                Gemini <span className="text-blue-400">✦</span>
              </span>
              <span>
                Claude <span className="text-orange-400">⬡</span>
              </span>
              <span>
                Antigravity <span className="text-emerald-400">🤖</span>
              </span>
              <span>
                Lovable <span className="text-purple-400">💜</span>
              </span>
              <span>
                Codex <span className="text-green-400">⌨</span>
              </span>
            </div>
          </div>
        </section>

        {/* Two-Panel Layout */}
        <div className="grid gap-6 lg:grid-cols-[420px,1fr]">
          {/* ─── LEFT PANEL: Parameter Form ─── */}
          <aside className="flex flex-col gap-5">
            {/* Objective */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-5">
              <label
                htmlFor="engine-objective"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Objective *
              </label>
              <Textarea
                id="engine-objective"
                placeholder="e.g. Analyze the strategic rationale for a PE-backed carve-out in the Indian pharma sector with LBO modeling…"
                className="min-h-[110px] resize-y bg-secondary/30 border-border/50 text-sm placeholder:text-muted-foreground/60 focus:ring-gold/40"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                maxLength={1000}
              />
              <p className="mt-1 text-right text-[11px] text-muted-foreground/60">
                {objective.length}/1000
              </p>
            </div>

            {/* Target Platform */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Target Platform
              </p>
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
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-lg"
                      style={{ background: `${p.color}22` }}
                    >
                      {p.emoji}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          platform === p.key ? getPlatformText(p.key) : "text-foreground"
                        }`}
                      >
                        {p.label}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">{p.description}</p>
                    </div>
                    {platform === p.key && (
                      <Sparkles className="ml-auto h-3.5 w-3.5 shrink-0 text-gold/70" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Context Level */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Context Level
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CONTEXT_LEVELS.map((c) => (
                  <button
                    key={c.key}
                    id={`context-${c.key}`}
                    aria-pressed={contextLevel === c.key}
                    onClick={() => setContextLevel(c.key)}
                    className={`flex flex-col rounded-lg border px-4 py-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                      contextLevel === c.key
                        ? "border-gold/50 bg-gold/10"
                        : "border-border/50 bg-secondary/20 hover:border-border hover:bg-secondary/40"
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold ${
                        contextLevel === c.key ? "text-gold" : "text-foreground"
                      }`}
                    >
                      {c.label}
                    </span>
                    <span className="mt-0.5 text-[11px] text-muted-foreground">
                      {c.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Finance Domain */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Finance Domain
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  id="domain-all"
                  aria-pressed={domain === "all"}
                  onClick={() => setDomain("all")}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                    domain === "all"
                      ? "border-gold/50 bg-gold/10 text-gold"
                      : "border-border/50 bg-secondary/20 text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <span>🌐</span>
                  <span>All Domains</span>
                </button>
                {DOMAINS.map((d) => (
                  <button
                    key={d}
                    id={`domain-${d.replace(/\W+/g, "-").toLowerCase()}`}
                    aria-pressed={domain === d}
                    onClick={() => setDomain(d)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                      domain === d
                        ? "border-gold/50 bg-gold/10 text-gold"
                        : "border-border/50 bg-secondary/20 text-muted-foreground hover:text-foreground hover:bg-secondary/40"
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
                <span className="ml-1 text-[10px] normal-case tracking-normal text-muted-foreground/60">
                  (optional)
                </span>
              </p>
              {remixId ? (
                <div className="flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/5 px-3 py-2">
                  <BookOpen className="h-4 w-4 shrink-0 text-gold" />
                  <span className="flex-1 truncate text-sm text-foreground">{remixTitle}</span>
                  <button
                    onClick={() => {
                      setRemixId(null);
                      setRemixTitle(null);
                    }}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Remove remix selection"
                  >
                    ×
                  </button>
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
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Synthesizing…
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Generate Meta-Prompt
                </>
              )}
            </Button>
          </aside>

          {/* ─── RIGHT PANEL: Output ─── */}
          <section className="flex flex-col gap-4">
            {result ? (
              <>
                {/* Output Card */}
                <div
                  className={`relative overflow-hidden rounded-xl border bg-gradient-to-br from-[#0a0e14] to-[#141c2a] ${getPlatformBorder(result.platform)}`}
                >
                  {/* Platform color top bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${
                        TARGET_PLATFORMS.find((p) => p.key === result.platform)?.color ??
                        "hsl(45,85%,55%)"
                      }, transparent)`,
                    }}
                  />

                  {/* Output Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/30 px-5 py-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Generated Prompt
                      </p>
                      <p className={`mt-0.5 text-sm font-medium ${getPlatformText(result.platform)}`}>
                        {result.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Regenerate */}
                      <Button
                        id="regenerate-btn"
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-border/50 text-xs hover:border-gold/40 hover:text-gold"
                        onClick={() => handleGenerate(true)}
                        disabled={isGenerating}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Regenerate
                      </Button>

                      {/* Copy */}
                      <Button
                        id="copy-btn"
                        variant="outline"
                        size="sm"
                        className={`gap-1.5 text-xs transition-colors ${
                          copied
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                            : "border-border/50 hover:border-gold/40 hover:text-gold"
                        }`}
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  {/* Prompt Text */}
                  <pre
                    ref={outputRef}
                    id="prompt-output"
                    className="overflow-x-auto whitespace-pre-wrap break-words p-5 font-mono text-sm text-[#c9c1ad] leading-relaxed"
                    style={{ maxHeight: "65vh", overflowY: "auto" }}
                  >
                    {result.prompt}
                  </pre>

                  {/* Footer Actions */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-border/30 px-5 py-3">
                    {/* Open in Lovable */}
                    {result.platform === "lovable" && (
                      <a
                        id="open-lovable-btn"
                        href={getLovableDeepLink(result.prompt)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-md border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-300 transition-all hover:bg-purple-500/20 hover:text-purple-200"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open in Lovable
                      </a>
                    )}

                    {/* Open in Antigravity */}
                    {result.platform === "antigravity" && (
                      <button
                        id="open-antigravity-btn"
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 transition-all hover:bg-emerald-500/20 hover:text-emerald-200"
                        title="Copy mission prompt — paste directly into Antigravity"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy for Antigravity
                      </button>
                    )}

                    <span className="ml-auto text-[11px] text-muted-foreground/50 font-mono">
                      {result.prompt.split(" ").length} words · generated{" "}
                      {new Date(result.generatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Source Prompts Collapsible */}
                {result.sourcePrompts.length > 0 && (
                  <div className="rounded-xl border border-border/50 bg-card/30">
                    <button
                      id="toggle-sources-btn"
                      className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-secondary/20 transition-colors rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50"
                      onClick={() => setShowSources((s) => !s)}
                      aria-expanded={showSources}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gold" />
                        <span className="text-sm font-medium text-foreground">
                          Source Prompts Used
                        </span>
                        <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[11px] text-gold">
                          {result.sourcePrompts.length}
                        </span>
                      </div>
                      {showSources ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    {showSources && (
                      <div className="border-t border-border/30 divide-y divide-border/30">
                        {result.sourcePrompts.map((src) => (
                          <div key={src.id} className="px-5 py-3">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-sm font-medium text-foreground truncate">
                                {src.title}
                              </p>
                              <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-secondary/50 text-muted-foreground">
                                {src.platform}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{src.snippet}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-card/20 py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 border border-gold/20">
                  <Cpu className="h-8 w-8 text-gold/60" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Your prompt will appear here
                </h3>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  Fill in the parameters on the left and click{" "}
                  <span className="text-gold font-medium">Generate Meta-Prompt</span> to synthesize
                  a high-context prompt.
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
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MetaEngine;
