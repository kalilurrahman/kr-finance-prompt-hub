import React from "react";
import { Link } from "react-router-dom";
import { getPromptStats } from "@/data/prompts";
import { Sparkles, Wifi, ArrowRight, Terminal, Cpu, TrendingUp, BarChart3, Briefcase, Building2, Globe2, Calculator } from "lucide-react";

const DOMAIN_SHORTCUTS = [
  { label: "Corporate Strategy", icon: <TrendingUp className="h-3.5 w-3.5" />, domain: "Corporate Strategy & Growth", color: "#f59e0b" },
  { label: "M&A", icon: <Building2 className="h-3.5 w-3.5" />, domain: "Mergers & Acquisitions", color: "#a78bfa" },
  { label: "Equity Research", icon: <BarChart3 className="h-3.5 w-3.5" />, domain: "Investment Banking & Equity Research", color: "#34d399" },
  { label: "Private Equity", icon: <Briefcase className="h-3.5 w-3.5" />, domain: "Private Equity & Venture Capital", color: "#60a5fa" },
  { label: "Macroeconomics", icon: <Globe2 className="h-3.5 w-3.5" />, domain: "Economics & Macroeconomic Analysis", color: "#f87171" },
  { label: "FP&A", icon: <Calculator className="h-3.5 w-3.5" />, domain: "FP&A & Budgeting", color: "#fbbf24" },
];

const STAT_CARDS = [
  { value: "1,120+", label: "Curated Prompts", icon: "📊", color: "from-amber-500/20 to-amber-600/10" },
  { value: "3", label: "AI Platforms", icon: "🤖", color: "from-purple-500/20 to-purple-600/10" },
  { value: "6", label: "Finance Domains", icon: "🏦", color: "from-emerald-500/20 to-emerald-600/10" },
];

// ⚡ Memoize static component to prevent re-renders on every search keystroke
export const Hero = React.memo(function Hero() {
  const stats = getPromptStats();

  return (
    <section className="relative overflow-hidden border-b border-border/30 bg-gradient-to-b from-secondary/60 via-secondary/30 to-background px-4 py-14 md:py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gold/8 blur-3xl animate-pulse-slow" />
        <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-gold/6 blur-3xl animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.4) 28px, rgba(255,255,255,0.4) 29px), repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(255,255,255,0.4) 28px, rgba(255,255,255,0.4) 29px)" }} />
      </div>

      <div className="container relative mx-auto max-w-5xl">
        {/* Badge */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-medium tracking-wider text-gold backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            EXECUTIVE PROMPT COMPENDIUM · LIVE
          </div>
        </div>

        {/* Headline */}
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            Financial Engineering &{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent italic">
                Advisory
              </span>
            </span>
            {" "}Prompts
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Your executive prompt compendium.{" "}
            <strong className="text-foreground">{stats.total.toLocaleString()}+</strong> curated prompts
            across <strong className="text-foreground">3 AI platforms</strong> — Perplexity, Claude & Gemini.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="mt-10 grid grid-cols-3 gap-3 md:gap-5 max-w-2xl mx-auto">
          {STAT_CARDS.map((s) => (
            <div
              key={s.label}
              className={`relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br ${s.color} p-4 text-center backdrop-blur-sm transition-all duration-300 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 hover:-translate-y-0.5`}
            >
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="font-display text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-[10px] text-muted-foreground tracking-wider uppercase mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/library"
            className="group flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-gold/20 transition-all duration-200 hover:bg-gold/90 hover:shadow-xl hover:shadow-gold/30 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            aria-label="Open FINPROMPT Terminal Library"
          >
            <Terminal className="h-4 w-4" />
            Browse Library
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/engine"
            className="group flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/60 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-all duration-200 hover:border-gold/40 hover:bg-secondary hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            aria-label="Open Meta-Prompt Engine"
          >
            <Cpu className="h-4 w-4 text-gold" />
            Meta-Engine
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-muted-foreground" />
          </Link>
        </div>

        {/* Domain Shortcuts */}
        <div className="mt-10">
          <p className="text-center text-xs text-muted-foreground tracking-widest uppercase mb-4 flex items-center justify-center gap-2">
            <span className="h-px w-12 bg-border/60 inline-block" />
            Browse by Domain
            <span className="h-px w-12 bg-border/60 inline-block" />
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {DOMAIN_SHORTCUTS.map((d) => (
              <button
                key={d.label}
                className="group flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-gold/40 hover:text-foreground hover:bg-secondary hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                aria-label={`Filter by ${d.label}`}
                style={{ "--hover-color": d.color } as React.CSSProperties}
              >
                <span style={{ color: d.color }}>{d.icon}</span>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Wifi className="h-3 w-3 text-gold" />
            Offline ready
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-gold" />
            Fuse.js search
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            One-click copy
          </span>
        </div>
      </div>
    </section>
  );
});
