import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPromptStats } from "@/data/prompts";
import { getRealExampleCount } from "@/lib/sampleOutputLibrary";
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
  Github,
  LineChart,
  Banknote,
  Landmark,
  Zap,
} from "lucide-react";
import heroFinance from "@/assets/hero-finance.jpg";

const DOMAIN_SHORTCUTS: ReadonlyArray<{
  label: string;
  icon: React.ReactNode;
  domain: Domain;
  color: string;
}> = [
  { label: "Corporate Strategy", icon: <TrendingUp className="h-3.5 w-3.5" />, domain: "Corporate Strategy & Growth", color: "#f59e0b" },
  { label: "M&A", icon: <Building2 className="h-3.5 w-3.5" />, domain: "Mergers & Acquisitions", color: "#a78bfa" },
  { label: "Equity Research", icon: <BarChart3 className="h-3.5 w-3.5" />, domain: "Investment Banking & Equity Research", color: "#34d399" },
  { label: "Private Equity", icon: <Briefcase className="h-3.5 w-3.5" />, domain: "Private Equity & Venture Capital", color: "#60a5fa" },
  { label: "Macroeconomics", icon: <Globe2 className="h-3.5 w-3.5" />, domain: "Economics & Macroeconomic Analysis", color: "#f87171" },
  { label: "FP&A", icon: <Calculator className="h-3.5 w-3.5" />, domain: "FP&A & Budgeting", color: "#fbbf24" },
];

const CAROUSEL_SLIDES = [
  {
    icon: Landmark,
    kicker: "Boardroom-grade",
    title: "C-suite briefings, on demand",
    body: "Strategy memos, board decks, investor letters — drafted with the rigour of a senior advisor.",
  },
  {
    icon: LineChart,
    kicker: "Equity research",
    title: "From thesis to model in minutes",
    body: "Sell-side initiations, DCF scaffolds, comparable benchmarks across sectors and geographies.",
  },
  {
    icon: Banknote,
    kicker: "M&A · PE",
    title: "Deal-ready due diligence",
    body: "CIMs, synergy stacks, LBO frameworks and post-merger integration playbooks at your fingertips.",
  },
  {
    icon: Sparkles,
    kicker: "Always sharp",
    title: "Curated by Kalilur Rahman",
    body: "Hand-tuned prompts across Perplexity, Claude and Gemini — no signup, no tracking.",
  },
];

interface HeroProps {
  onSelectDomain?: (domain: Domain) => void;
}

export const Hero = React.memo(function Hero({ onSelectDomain }: HeroProps) {
  const stats = getPromptStats();
  const exampleCount = getRealExampleCount();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % CAROUSEL_SLIDES.length), 4500);
    return () => clearInterval(id);
  }, []);

  const Active = CAROUSEL_SLIDES[slide].icon;

  return (
    <section className="relative overflow-hidden border-b border-border/30 bg-gradient-to-b from-secondary/60 via-secondary/30 to-background px-4 py-14 md:py-20">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl animate-pulse-slow" />
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

      <div className="container relative mx-auto max-w-6xl">
        {/* Live chip */}
        <div className="mb-6 flex justify-center lg:justify-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-gold backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            Executive Prompt Compendium · Live
          </div>
        </div>

        {/* Two-column hero */}
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          {/* Left: copy + CTAs */}
          <div className="text-center lg:text-left">
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Financial Engineering &{" "}
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text italic text-transparent">
                Advisory
              </span>{" "}
              Prompts
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0">
              Your executive prompt compendium for finance, strategy and deal teams.{" "}
              <strong className="text-foreground">{stats.total.toLocaleString()}+</strong> curated prompts
              across <strong className="text-foreground">{Object.keys(stats.byPlatform).length} AI platforms</strong> —
              Perplexity, Claude, and Gemini — with <strong className="text-foreground">{exampleCount}</strong> mapped sample outputs.
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                to="/library"
                className="group inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-gold/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold/90 hover:shadow-xl hover:shadow-gold/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                aria-label="Open FINPROMPT Terminal Library"
              >
                <Terminal className="h-4 w-4" />
                Browse Library
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/engine"
                className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/60 px-5 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                aria-label="Open Meta-Prompt Engine"
              >
                <Cpu className="h-4 w-4 text-gold" />
                Meta-Engine
              </Link>
              <a
                href="https://github.com/kalilurrahman"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-3 text-sm font-medium text-gold transition-all hover:-translate-y-0.5 hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>

            {/* Stat strip */}
            <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3 lg:mx-0">
              <Stat value={`${stats.total.toLocaleString()}+`} label="Prompts" />
              <Stat value={`${Object.keys(stats.byDomain).length}`} label="Finance domains" />
              <Stat value={`${exampleCount}`} label="Sample outputs" />
            </div>
          </div>

          {/* Right: image + carousel */}
          <div className="relative">
            <div className="relative mx-auto max-w-md">
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-gold/20 shadow-[0_20px_60px_-20px_hsl(var(--gold)/0.45)]">
                <img
                  src={heroFinance}
                  alt="Bloomberg-style finance terminal with glowing candlestick charts and floating data panels"
                  width={1024}
                  height={1024}
                  className="absolute inset-0 h-full w-full object-cover"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-background/70 via-background/10 to-transparent" />
                <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-gold backdrop-blur">
                  <Zap className="h-3 w-3" /> terminal.live
                </div>
                <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground backdrop-blur">
                  FINPROMPT · v2
                </div>
              </div>

              {/* Carousel card */}
              <div
                key={slide}
                className="mt-4 animate-fade-in-up rounded-2xl border border-border/60 bg-card/80 p-4 shadow-lg backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/15 text-gold">
                    <Active className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-gold">
                      {CAROUSEL_SLIDES[slide].kicker}
                    </p>
                    <p className="font-display text-base font-semibold leading-snug text-foreground">
                      {CAROUSEL_SLIDES[slide].title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {CAROUSEL_SLIDES[slide].body}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  {CAROUSEL_SLIDES.map((s, i) => (
                    <button
                      key={s.kicker}
                      type="button"
                      onClick={() => setSlide(i)}
                      aria-label={`Show slide ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        i === slide ? "w-6 bg-gold" : "w-1.5 bg-border hover:bg-gold/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Domain pills */}
        <div className="mt-12">
          <p className="mb-4 flex items-center justify-center gap-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
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

        {/* Trust row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Search className="h-3 w-3 text-gold" />
            Instant local search
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-gold" />
            Curated by Kalilur Rahman
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 px-3 py-2.5 text-center backdrop-blur-sm">
      <div className="font-display text-xl font-bold leading-none text-foreground">{value}</div>
      <div className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
