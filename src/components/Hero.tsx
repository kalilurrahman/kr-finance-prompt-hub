import React from "react";
import { Link } from "react-router-dom";
import { getPromptStats } from "@/data/prompts";
import type { Domain } from "@/types/prompt";
import {
  Sparkles,
  ArrowRight,
  Terminal,
  Cpu,
  TrendingUp,
  BarChart3,
  Briefcase,
  Building2,
  Globe2,
  Calculator,
  Search,
} from "lucide-react";

const DOMAIN_SHORTCUTS = [
  {
    label: "Corporate Strategy",
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    domain: "Corporate Strategy & Growth" as Domain,
    color: "#f59e0b",
  },
  {
    label: "M&A",
    icon: <Building2 className="h-3.5 w-3.5" />,
    domain: "Mergers & Acquisitions" as Domain,
    color: "#a78bfa",
  },
  {
    label: "Equity Research",
    icon: <BarChart3 className="h-3.5 w-3.5" />,
    domain: "Investment Banking & Equity Research" as Domain,
    color: "#34d399",
  },
  {
    label: "Private Equity",
    icon: <Briefcase className="h-3.5 w-3.5" />,
    domain: "Private Equity & Venture Capital" as Domain,
    color: "#60a5fa",
  },
  {
    label: "Macroeconomics",
    icon: <Globe2 className="h-3.5 w-3.5" />,
    domain: "Economics & Macroeconomic Analysis" as Domain,
    color: "#f87171",
  },
  {
    label: "FP&A",
    icon: <Calculator className="h-3.5 w-3.5" />,
    domain: "FP&A & Budgeting" as Domain,
    color: "#fbbf24",
  },
];

interface HeroProps {
  onSelectDomain?: (domain: Domain) => void;
}

export const Hero = React.memo(function Hero({ onSelectDomain }: HeroProps) {
  const stats = getPromptStats();
  const statCards = [
    {
      value: `${stats.total.toLocaleString()}+`,
      label: "Curated Prompts",
      icon: "📊",
      color: "from-amber-500/20 to-amber-600/10",
    },
    {
      value: `${Object.keys(stats.byPlatform).length}`,
      label: "AI Platforms",
      icon: "🤖",
      color: "from-purple-500/20 to-purple-600/10",
    },
    {
      value: `${Object.keys(stats.byDomain).length}`,
      label: "Finance Domains",
      icon: "🏦",
      color: "from-emerald-500/20 to-emerald-600/10",
    },
  ];

  return (
    <section className="relative overflow-hidden border-b border-border/30 bg-gradient-to-b from-secondary/60 via-secondary/30 to-background px-4 py-14 md:py-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gold/8 blur-3xl animate-pulse-slow" />
        <div
          className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-gold/6 blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.4) 28px, rgba(255,255,255,0.4) 29px), repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(255,255,255,0.4) 28px, rgba(255,255,255,0.4) 29px)",
          }}
        />
      </div>

      <div className="container relative mx-auto max-w-5xl">
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-medium tracking-wider text-gold backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            EXECUTIVE PROMPT COMPENDIUM · LIVE
          </div>
        </div>

        <div className="text-center">
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            Financial Engineering &{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent italic">
                Advisory
              </span>
            </span>{" "}
            Prompts
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Your executive prompt compendium.{" "}
            <strong className="text-foreground">{stats.total.toLocaleString()}+</strong> curated prompts
            across <strong className="text-foreground">{Object.keys(stats.byPlatform).length} AI platforms</strong> — Perplexity, Claude, and Gemini.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 md:gap-5">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br ${card.color} p-4 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5`}
            >
              <div className="mb-1 text-xl">{card.icon}</div>
              <div className="font-display text-2xl font-bold text-foreground">{card.value}</div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/library"
            className="group flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-gold/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold/90 hover:shadow-xl hover:shadow-gold/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            aria-label="Open FINPROMPT Terminal Library"
          >
            <Terminal className="h-4 w-4" />
            Browse Library
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/engine"
            className="group flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/60 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            aria-label="Open Meta-Prompt Engine"
          >
            <Cpu className="h-4 w-4 text-gold" />
            Meta-Engine
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-10">
          <p className="mb-4 flex items-center justify-center gap-2 text-center text-xs uppercase tracking-widest text-muted-foreground">
            <span className="inline-block h-px w-12 bg-border/60" />
            Browse by Domain
            <span className="inline-block h-px w-12 bg-border/60" />
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {DOMAIN_SHORTCUTS.map((shortcut) => (
              <button
                key={shortcut.label}
                type="button"
                onClick={() => onSelectDomain?.(shortcut.domain)}
                className="group flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:-translate-y-px hover:border-gold/40 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                aria-label={`Filter prompts by ${shortcut.label}`}
              >
                <span style={{ color: shortcut.color }}>{shortcut.icon}</span>
                {shortcut.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Search className="h-3 w-3 text-gold" />
            Instant local search
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-gold" />
            Fresh deploy cleanup
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            One-click copy
          </span>
        </div>
      </div>
    </section>
  );
});
