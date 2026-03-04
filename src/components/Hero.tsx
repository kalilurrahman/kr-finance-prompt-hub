import { getPromptStats } from "@/data/prompts";
import { Sparkles, Wifi } from "lucide-react";

export function Hero() {
  const stats = getPromptStats();

  return (
    <section className="relative overflow-hidden border-b border-border/30 bg-gradient-to-b from-secondary/50 to-background px-4 py-12 md:py-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-gold blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-60 w-60 rounded-full bg-gold blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-4xl text-center">
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Financial Engineering & Advisory{" "}
          <span className="text-gold italic">Prompts</span>{" "}
          Reference
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Your executive prompt compendium. {stats.total.toLocaleString()}+ curated prompts across 3 AI platforms.
        </p>

        {/* Status Badge */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-2 text-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold"></span>
          </span>
          <span className="text-muted-foreground">
            <strong className="text-foreground">{stats.total.toLocaleString()}</strong> curated prompts
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Wifi className="h-3 w-3 text-gold" /> Offline ready
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Sparkles className="h-3 w-3 text-gold" /> 3 AI platforms
          </span>
        </div>
      </div>
    </section>
  );
}
