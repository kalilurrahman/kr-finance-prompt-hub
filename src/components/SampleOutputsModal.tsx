import React, { useEffect, useMemo, useState } from "react";
import { X, Copy, Check, ExternalLink, Menu, ArrowLeft, FileText } from "lucide-react";
import { DOMAIN_ICONS } from "@/types/prompt";
import type { Domain } from "@/types/prompt";
import {
  getMappedSampleOutputByPromptId,
  getMappedSampleOutputs,
  SAMPLE_OUTPUT_LIMIT,
} from "@/lib/sampleOutputLibrary";

const PLATFORM_COLORS: Record<string, { bg: string; text: string; border: string; label: string; emoji: string }> = {
  claude:     { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30", label: "Claude", emoji: "🟠" },
  gemini:     { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/30",   label: "Gemini", emoji: "🔵" },
  perplexity: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", label: "Perplexity", emoji: "⬡" },
  chatgpt:    { bg: "bg-emerald-500/10",text: "text-emerald-400",border: "border-emerald-500/30",label: "ChatGPT", emoji: "✦" },
  finprompt:  { bg: "bg-gold/10",       text: "text-gold",       border: "border-gold/30",       label: "FINPROMPT", emoji: "⌘" },
};

function inlineFormat(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/`(.*?)`/g, '<code class="bg-secondary/60 px-1 rounded text-[11px] font-mono">$1</code>');
}

function renderOutput(text: string) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={i} className="font-display text-xl sm:text-2xl font-bold text-foreground mt-8 mb-3 border-b border-border/40 pb-2">
          {line.slice(3)}
        </h2>
      );
      i++; continue;
    }
    if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={i} className="font-display text-base sm:text-lg font-semibold text-foreground mt-5 mb-2">
          {line.slice(4)}
        </h3>
      );
      i++; continue;
    }

    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const isSep = (l: string) => /^[\s\-:|]+$/.test(l.replace(/\|/g, ""));
      const dataRows = tableLines.filter((l) => !isSep(l));
      if (dataRows.length > 0) {
        const parseRow = (r: string) =>
          r.split("|").map((c) => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        const [headerRow, ...bodyRows] = dataRows;
        const headers = parseRow(headerRow);
        nodes.push(
          <div key={`tbl-${i}`} className="my-4 overflow-x-auto rounded-lg border border-border/50">
            <table className="w-full text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-secondary/60 border-b border-border/50">
                  {headers.map((h, j) => (
                    <th
                      key={j}
                      className="px-3 py-2.5 text-left font-semibold text-foreground whitespace-nowrap"
                      dangerouslySetInnerHTML={{ __html: inlineFormat(h) }}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr
                    key={ri}
                    className={`border-b border-border/30 hover:bg-secondary/30 transition-colors ${
                      ri % 2 === 1 ? "bg-secondary/10" : ""
                    }`}
                  >
                    {parseRow(row).map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-3 py-2 text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: inlineFormat(cell) }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      nodes.push(
        <li
          key={i}
          className="text-sm text-muted-foreground ml-5 mt-1.5 list-disc leading-relaxed"
          dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(2)) }}
        />
      );
      i++; continue;
    }
    if (/^\d+\. /.test(line)) {
      nodes.push(
        <li
          key={i}
          className="text-sm text-muted-foreground ml-5 mt-1.5 list-decimal leading-relaxed"
          dangerouslySetInnerHTML={{ __html: inlineFormat(line.replace(/^\d+\. /, "")) }}
        />
      );
      i++; continue;
    }
    if (line.trim() === "") {
      nodes.push(<div key={i} className="h-2.5" />);
      i++; continue;
    }
    nodes.push(
      <p
        key={i}
        className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: inlineFormat(line) }}
      />
    );
    i++;
  }
  return nodes;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialPromptId?: number;
}

export function SampleOutputsModal({ isOpen, onClose, initialPromptId }: Props) {
  const examples = useMemo(() => getMappedSampleOutputs(), []);
  const [activeId, setActiveId] = useState(examples[0]?.id ?? "");
  const [copied, setCopied] = useState(false);
  // Mobile: which view to show — "list" (sidebar) or "reader" (output)
  const [mobileView, setMobileView] = useState<"list" | "reader">("reader");

  // Counts: mapped vs placeholder
  const { mappedCount, placeholderCount } = useMemo(() => {
    let mapped = 0;
    let placeholder = 0;
    for (const e of examples) {
      if (e.promptId > 0) mapped++;
      else placeholder++;
    }
    return { mappedCount: mapped, placeholderCount: placeholder };
  }, [examples]);

  useEffect(() => {
    if (!isOpen) return;
    const mappedEntry = initialPromptId ? getMappedSampleOutputByPromptId(initialPromptId) : undefined;
    setActiveId(mappedEntry?.id ?? examples[0]?.id ?? "");
    setCopied(false);
    setMobileView("reader");
  }, [examples, initialPromptId, isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [isOpen]);

  if (!isOpen) return null;

  const active = examples.find((e) => e.id === activeId) ?? examples[0];
  if (!active) return null;

  const pc = PLATFORM_COLORS[active.platform] ?? PLATFORM_COLORS.claude;
  const domainIcon = DOMAIN_ICONS[active.domain as Domain] ?? "📄";
  const isPlaceholder = active.promptId === 0;
  const wordCount = active.output.trim().split(/\s+/).length;

  const handleCopy = () => {
    navigator.clipboard.writeText(active.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-stretch sm:items-center sm:justify-center sm:p-6 overscroll-contain"
      style={{ background: "hsl(var(--background) / 0.92)", backdropFilter: "blur(10px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative flex w-full sm:max-w-6xl sm:max-h-[90vh] sm:rounded-2xl border-0 sm:border border-border/60 bg-card shadow-2xl overflow-hidden flex-col sm:flex-row"
        style={{ height: "100dvh" }}
      >
        {/* Gold top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent z-10" />

        {/* SIDEBAR — full width on mobile when in list view; fixed 17rem on desktop */}
        <aside
          className={`${
            mobileView === "list" ? "flex" : "hidden"
          } sm:flex w-full sm:w-72 shrink-0 border-r border-border/40 bg-background/60 flex-col overflow-hidden`}
        >
          <div className="px-4 py-4 border-b border-border/40">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧪</span>
                <span className="font-display text-base font-bold text-foreground tracking-wide">
                  Sample Outputs
                </span>
              </div>
              {/* Close on mobile when in list view */}
              <button
                onClick={onClose}
                className="sm:hidden flex h-8 w-8 items-center justify-center rounded-md border border-border/50 text-muted-foreground hover:border-destructive/50 hover:text-destructive transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              <span className="text-foreground font-semibold">{SAMPLE_OUTPUT_LIMIT}</span> total examples
              {mappedCount > 0 && (
                <> · <span className="text-emerald-400">{mappedCount}</span> mapped</>
              )}
              {placeholderCount > 0 && (
                <> · <span className="text-gold/80">{placeholderCount}</span> reference</>
              )}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto py-1">
            {examples.map((ex) => {
              const icon = DOMAIN_ICONS[ex.domain as Domain] ?? "📄";
              const isActive = ex.id === activeId;
              const exIsPlaceholder = ex.promptId === 0;
              return (
                <button
                  key={ex.id}
                  onClick={() => {
                    setActiveId(ex.id);
                    setMobileView("reader");
                  }}
                  className={`w-full text-left px-4 py-3 border-l-2 transition-all hover:bg-secondary/40 ${
                    isActive
                      ? "border-l-gold bg-gold/10"
                      : "border-l-transparent"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-base shrink-0 mt-0.5">{icon}</span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[13px] font-medium leading-snug line-clamp-2 ${
                          isActive ? "text-gold" : "text-foreground/90"
                        }`}
                      >
                        {ex.promptTitle}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-muted-foreground/85 uppercase tracking-wider">
                          {ex.platform}
                        </span>
                        {exIsPlaceholder ? (
                          <span className="text-[9px] rounded-sm bg-gold/15 text-gold/90 px-1.5 py-px border border-gold/20 uppercase tracking-wider">
                            Reference
                          </span>
                        ) : (
                          <span className="text-[9px] rounded-sm bg-emerald-500/15 text-emerald-400 px-1.5 py-px border border-emerald-500/20 uppercase tracking-wider">
                            #{ex.promptId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 border-t border-border/40">
            <p className="text-[10px] text-muted-foreground/80 text-center leading-snug">
              Curated AI outputs · cross-linked to FINPROMPT library where titles match.
            </p>
          </div>
        </aside>

        {/* READER PANEL — full width on mobile when in reader view */}
        <div
          className={`${
            mobileView === "reader" ? "flex" : "hidden"
          } sm:flex flex-1 flex-col min-w-0 bg-card`}
        >
          {/* Mobile top bar with back + close */}
          <div className="flex sm:hidden items-center justify-between px-3 py-2.5 border-b border-border/40 bg-background/40 shrink-0">
            <button
              onClick={() => setMobileView("list")}
              className="flex items-center gap-1.5 rounded-md border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-gold/40 hover:text-gold transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All examples
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border/50 text-muted-foreground hover:border-destructive/50 hover:text-destructive transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Header with title + meta */}
          <div className="px-4 sm:px-7 py-4 sm:py-5 border-b border-border/40 bg-background/30 shrink-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${pc.bg} ${pc.text} ${pc.border}`}
              >
                {pc.emoji} {pc.label} · {active.model}
              </span>
              {isPlaceholder ? (
                <span className="text-[10px] sm:text-[11px] font-medium rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-gold/90 inline-flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Reference Sample
                </span>
              ) : (
                <span className="text-[10px] sm:text-[11px] font-medium rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-emerald-400">
                  ✓ Mapped to library #{active.promptId}
                </span>
              )}
              <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground/90 inline-flex items-center gap-1">
                <span>{domainIcon}</span>
                <span className="hidden sm:inline">{active.domain}</span>
              </span>
            </div>
            <h2 className="font-display text-lg sm:text-2xl font-bold text-foreground leading-tight">
              {active.promptTitle}
            </h2>

            {isPlaceholder && (
              <p className="mt-2 text-xs text-muted-foreground/85 italic leading-relaxed">
                This sample output is not yet linked to a specific library prompt — treat it as a
                reference example for the <strong className="text-foreground/90">{active.domain}</strong> domain.
              </p>
            )}

            {/* Action row */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                  copied
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-border/60 text-muted-foreground hover:border-gold/40 hover:text-gold hover:bg-gold/5"
                }`}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied output" : "Copy output"}
              </button>
              <span className="text-[10px] text-muted-foreground/80 font-mono">
                {wordCount.toLocaleString()} words ·{" "}
                {new Date(active.generatedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              {/* Desktop close */}
              <button
                onClick={onClose}
                className="hidden sm:flex ml-auto h-8 w-8 items-center justify-center rounded-md border border-border/50 text-muted-foreground hover:border-destructive/50 hover:text-destructive transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Parameters chips */}
          {Object.keys(active.parameters).length > 0 && (
            <div className="px-4 sm:px-7 py-2.5 border-b border-border/30 bg-background/20 flex flex-wrap gap-1.5 shrink-0">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/85 self-center mr-1">
                Parameters:
              </span>
              {Object.entries(active.parameters).map(([k, v]) => (
                <span
                  key={k}
                  className="text-[11px] rounded border border-border/50 bg-secondary/40 px-2 py-0.5 text-muted-foreground"
                >
                  <span className="text-gold/80 font-mono">{k}</span>
                  <span className="text-muted-foreground/70 mx-1">=</span>
                  <span className="text-foreground/90">{v}</span>
                </span>
              ))}
            </div>
          )}

          {/* OUTPUT BODY — generous reader width */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-7 py-5 sm:py-7">
            <div className="max-w-3xl mx-auto space-y-1">{renderOutput(active.output)}</div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-7 py-3 border-t border-border/40 bg-background/30 flex items-center justify-between shrink-0">
            <span className="text-[10px] text-muted-foreground/80 font-mono">
              {SAMPLE_OUTPUT_LIMIT} examples · {mappedCount} mapped
            </span>
            <a
              href="/library"
              className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gold/90 hover:text-gold transition-colors"
            >
              Browse all prompts <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
