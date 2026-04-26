import React, { useEffect, useMemo, useState } from "react";
import { X, Copy, Check, ChevronRight, ExternalLink } from "lucide-react";
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
  finprompt:  { bg: "bg-amber-500/10",  text: "text-amber-400",  border: "border-amber-500/30",  label: "FINPROMPT", emoji: "⌘" },
};

const DOMAIN_COLORS: Record<string, string> = {
  "Corporate Strategy & Growth":          "text-amber-400",
  "Mergers & Acquisitions":               "text-purple-400",
  "Investment Banking & Equity Research": "text-emerald-400",
  "Private Equity & Venture Capital":     "text-blue-400",
  "Economics & Macroeconomic Analysis":   "text-red-400",
  "FP&A & Budgeting":                     "text-yellow-400",
};

function inlineFormat(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong class=\"text-foreground font-semibold\">$1</strong>")
    .replace(/`(.*?)`/g, "<code class=\"bg-secondary/60 px-1 rounded text-[10px] font-mono\">$1</code>");
}

function renderOutput(text: string) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      nodes.push(<h2 key={i} className="text-base font-bold text-foreground mt-6 mb-2 font-display border-b border-border/30 pb-1">{line.slice(3)}</h2>);
      i++; continue;
    }
    if (line.startsWith("### ")) {
      nodes.push(<h3 key={i} className="text-sm font-semibold text-foreground mt-4 mb-1.5">{line.slice(4)}</h3>);
      i++; continue;
    }

    // Collect full table block
    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const isSep = (l: string) => /^[\s\-:|]+$/.test(l.replace(/\|/g, ""));
      const dataRows = tableLines.filter(l => !isSep(l));
      if (dataRows.length > 0) {
        const parseRow = (r: string) => r.split("|").map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        const [headerRow, ...bodyRows] = dataRows;
        const headers = parseRow(headerRow);
        nodes.push(
          <div key={`tbl-${i}`} className="my-3 overflow-x-auto rounded-lg border border-border/40">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="bg-secondary/50 border-b border-border/40">
                  {headers.map((h, j) => (
                    <th key={j} className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap"
                      dangerouslySetInnerHTML={{ __html: inlineFormat(h) }} />
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr key={ri} className={`border-b border-border/20 hover:bg-secondary/20 transition-colors ${ri % 2 === 1 ? "bg-secondary/10" : ""}`}>
                    {parseRow(row).map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: inlineFormat(cell) }} />
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
      nodes.push(<li key={i} className="text-xs text-muted-foreground ml-5 mt-1 list-disc leading-relaxed"
        dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(2)) }} />);
      i++; continue;
    }
    if (/^\d+\. /.test(line)) {
      nodes.push(<li key={i} className="text-xs text-muted-foreground ml-5 mt-1 list-decimal leading-relaxed"
        dangerouslySetInnerHTML={{ __html: inlineFormat(line.replace(/^\d+\. /, "")) }} />);
      i++; continue;
    }
    if (line.trim() === "") { nodes.push(<div key={i} className="h-2" />); i++; continue; }
    nodes.push(<p key={i} className="text-xs text-muted-foreground leading-relaxed"
      dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />);
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

  useEffect(() => {
    if (!isOpen) return;

    const mappedEntry = initialPromptId
      ? getMappedSampleOutputByPromptId(initialPromptId)
      : undefined;

    setActiveId(mappedEntry?.id ?? examples[0]?.id ?? "");
    setCopied(false);
  }, [examples, initialPromptId, isOpen]);

  if (!isOpen) return null;

  const active = examples.find((e) => e.id === activeId) ?? examples[0];
  const pc = PLATFORM_COLORS[active.platform] ?? PLATFORM_COLORS.claude;
  const domainIcon = DOMAIN_ICONS[active.domain as Domain] ?? "📄";
  const domainColor = DOMAIN_COLORS[active.domain] ?? "text-gold";
  const contentLabel = active.sourceType === "sample_output" ? "Sample output" : "Prompt reference";

  const handleCopy = () => {
    navigator.clipboard.writeText(active.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-8"
      style={{ background: "rgba(4,8,14,0.92)", backdropFilter: "blur(12px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative flex w-full max-w-6xl rounded-2xl border border-border/50 bg-[#0a0e14] shadow-2xl overflow-hidden"
        style={{ height: "min(88vh, 740px)" }}
      >
        {/* Amber top bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

        {/* LEFT SIDEBAR */}
        <aside className="w-64 shrink-0 border-r border-border/40 bg-[#070b10] flex flex-col overflow-hidden">
          <div className="px-4 py-4 border-b border-border/30">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-lg">🧪</span>
              <span className="text-sm font-bold text-foreground tracking-wide">Sample Outputs</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{SAMPLE_OUTPUT_LIMIT} FINPROMPT-mapped examples</p>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {examples.map((ex) => {
              const icon = DOMAIN_ICONS[ex.domain as Domain] ?? "📄";
              const isActive = ex.id === activeId;
              return (
                <button
                  key={ex.id}
                  onClick={() => setActiveId(ex.id)}
                  className={`w-full text-left px-4 py-3 border-l-2 transition-all hover:bg-white/5 ${isActive ? "border-l-gold bg-gold/5" : "border-l-transparent"}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm shrink-0 mt-0.5">{icon}</span>
                    <div className="min-w-0">
                      <p className={`text-[11px] font-medium leading-snug line-clamp-2 ${isActive ? "text-gold" : "text-foreground/80"}`}>
                        {ex.promptTitle}
                      </p>
                      <p className="text-[9px] text-muted-foreground/85 mt-0.5 uppercase tracking-wider">{ex.platform} · #{ex.promptId}</p>
                    </div>
                    {isActive && <ChevronRight className="h-3 w-3 text-gold shrink-0 mt-0.5 ml-auto" />}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="p-4 border-t border-border/30">
            <p className="text-[9px] text-muted-foreground/80 text-center">Includes mapped FINPROMPT prompt references and any available sample-output content.</p>
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Panel Header */}
          <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-border/30 bg-[#0d1117] shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${pc.bg} ${pc.text} ${pc.border}`}>
                  {pc.emoji} {pc.label} · {active.model}
                </span>
                <span className="text-[10px] font-medium rounded-full border border-border/40 bg-secondary/20 px-2.5 py-0.5 text-muted-foreground">
                  {contentLabel}
                </span>
                <span className={`text-[10px] font-medium ${domainColor}`}>
                  {domainIcon} {active.domain}
                </span>
              </div>
              <h2 className="font-display text-base font-bold text-foreground leading-snug">
                {active.promptTitle}
              </h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${copied ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-border/50 text-muted-foreground hover:border-gold/40 hover:text-gold"}`}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border/50 text-muted-foreground hover:border-red-500/40 hover:text-red-400 transition-colors"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Parameters used */}
          <div className="px-6 py-2.5 border-b border-border/20 bg-[#0a0e14] flex flex-wrap gap-2 shrink-0">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground/80 self-center mr-1">Parameters:</span>
            {Object.entries(active.parameters).map(([k, v]) => (
              <span key={k} className="text-[10px] rounded border border-border/40 bg-secondary/20 px-2 py-0.5 text-muted-foreground">
                <span className="text-gold/70 font-mono">{k}</span>
                <span className="text-muted-foreground/80 mx-1">=</span>
                <span className="text-foreground/80">{v}</span>
              </span>
            ))}
          </div>

          {/* Output body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-0.5">
              {renderOutput(active.output)}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-border/20 bg-[#070b10] flex items-center justify-between shrink-0">
            <span className="text-[10px] text-muted-foreground/80 font-mono">
              {active.output.trim().split(/\s+/).length} words · {new Date(active.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <a
              href="/library"
              className="flex items-center gap-1.5 text-[11px] text-gold/80 hover:text-gold transition-colors"
            >
              Browse all prompts <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
