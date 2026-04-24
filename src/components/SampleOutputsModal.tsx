import React, { useState } from "react";
import { X, Copy, Check, ChevronRight, ExternalLink } from "lucide-react";
import examples from "@/data/examples.json";
import { DOMAIN_ICONS } from "@/types/prompt";
import type { Domain } from "@/types/prompt";

const PLATFORM_COLORS: Record<string, { bg: string; text: string; border: string; label: string; emoji: string }> = {
  claude:     { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30", label: "Claude", emoji: "🟠" },
  gemini:     { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/30",   label: "Gemini", emoji: "🔵" },
  perplexity: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", label: "Perplexity", emoji: "⬡" },
};

const DOMAIN_COLORS: Record<string, string> = {
  "Corporate Strategy & Growth":          "text-amber-400",
  "Mergers & Acquisitions":               "text-purple-400",
  "Investment Banking & Equity Research": "text-emerald-400",
  "Private Equity & Venture Capital":     "text-blue-400",
  "Economics & Macroeconomic Analysis":   "text-red-400",
  "FP&A & Budgeting":                     "text-yellow-400",
};

function renderOutput(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("## ")) return <h2 key={i} className="text-base font-bold text-foreground mt-5 mb-2 font-display">{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-semibold text-foreground mt-4 mb-1.5">{line.slice(4)}</h3>;
    if (line.startsWith("| ")) {
      const cells = line.split("|").filter((c) => c.trim());
      const isHeader = false;
      return (
        <div key={i} className="flex gap-0 font-mono text-[11px] border-b border-border/20">
          {cells.map((c, j) => (
            <span key={j} className={`flex-1 px-2 py-1 ${c.trim().match(/^-+$/) ? "border-b border-border/40" : "text-muted-foreground"}`}>
              {c.trim().match(/^-+$/) ? "" : c.trim().replace(/\*\*(.*?)\*\*/g, "$1")}
            </span>
          ))}
        </div>
      );
    }
    if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="text-xs text-muted-foreground ml-4 mt-1 list-disc">{line.slice(2).replace(/\*\*(.*?)\*\*/g, "$1")}</li>;
    if (line.match(/^\d+\. /)) return <li key={i} className="text-xs text-muted-foreground ml-4 mt-1 list-decimal">{line.replace(/^\d+\. /, "").replace(/\*\*(.*?)\*\*/g, "$1")}</li>;
    if (line.trim() === "") return <div key={i} className="h-2" />;
    const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/`(.*?)`/g, '<code class="bg-secondary/60 px-1 rounded text-[10px]">$1</code>');
    return <p key={i} className="text-xs text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
  });
}

interface Props { isOpen: boolean; onClose: () => void; }

export function SampleOutputsModal({ isOpen, onClose }: Props) {
  const [activeId, setActiveId] = useState(examples[0].id);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const active = examples.find((e) => e.id === activeId) ?? examples[0];
  const pc = PLATFORM_COLORS[active.platform] ?? PLATFORM_COLORS.claude;
  const domainIcon = DOMAIN_ICONS[active.domain as Domain] ?? "📄";
  const domainColor = DOMAIN_COLORS[active.domain] ?? "text-gold";

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
            <p className="text-[10px] text-muted-foreground">10 real prompts · AI-generated</p>
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
                      <p className="text-[9px] text-muted-foreground/60 mt-0.5 uppercase tracking-wider">{ex.platform}</p>
                    </div>
                    {isActive && <ChevronRight className="h-3 w-3 text-gold shrink-0 mt-0.5 ml-auto" />}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="p-4 border-t border-border/30">
            <p className="text-[9px] text-muted-foreground/50 text-center">Outputs generated by Claude 3.5 Sonnet, Gemini 1.5 Pro & Perplexity Sonar Pro</p>
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
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 self-center mr-1">Parameters:</span>
            {Object.entries(active.parameters).map(([k, v]) => (
              <span key={k} className="text-[10px] rounded border border-border/40 bg-secondary/20 px-2 py-0.5 text-muted-foreground">
                <span className="text-gold/70 font-mono">{k}</span>
                <span className="text-muted-foreground/50 mx-1">=</span>
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
            <span className="text-[10px] text-muted-foreground/50 font-mono">
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
