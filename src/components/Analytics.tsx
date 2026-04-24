import React, { useMemo } from "react";
import { getPromptStats } from "@/data/prompts";
import { PLATFORMS, DOMAINS, DOMAIN_ICONS } from "@/types/prompt";

// ⚡ Memoize static component to prevent re-renders on every search keystroke
export const Analytics = React.memo(function Analytics() {
  const stats = useMemo(() => getPromptStats(), []);

  const maxDomainCount = Math.max(...Object.values(stats.byDomain));

  const PLATFORM_COLORS: Record<string, string> = {
    perplexity: "#7c3aed",
    claude: "#ea580c",
    gemini: "#2563eb",
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Domain Distribution */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-5">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-foreground">Prompts by Domain</h3>
          <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold text-gold border border-gold/20">
            {stats.total.toLocaleString()} total
          </span>
        </div>
        <div className="space-y-4">
          {DOMAINS.map((d, i) => {
            const count = stats.byDomain[d] || 0;
            const pct = (count / maxDomainCount) * 100;
            const totalPct = ((count / stats.total) * 100).toFixed(0);
            return (
              <div key={d} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                    <span className="text-base shrink-0">{DOMAIN_ICONS[d]}</span>
                    <span className="truncate">{d}</span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] text-muted-foreground/70">{totalPct}%</span>
                    <span className="font-bold text-foreground tabular-nums">{count}</span>
                  </div>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-secondary/80">
                  <div
                    className="h-full rounded-full gradient-gold transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      animationDelay: `${i * 80}ms`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Distribution */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-5">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-foreground">Prompts by Platform</h3>
          <span className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border/50">
            3 platforms
          </span>
        </div>
        <div className="flex flex-col gap-4">
          {PLATFORMS.map((p) => {
            const count = stats.byPlatform[p.key] || 0;
            const pct = ((count / stats.total) * 100).toFixed(0);
            const color = PLATFORM_COLORS[p.key] || "#d97706";
            const barPct = (count / stats.total) * 100;
            return (
              <div key={p.key} className="group rounded-xl border border-border/50 bg-secondary/30 p-4 transition-all duration-200 hover:border-border hover:bg-secondary/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-lg shadow-sm"
                      style={{ backgroundColor: `${color}18`, border: `1.5px solid ${color}40` }}
                    >
                      {p.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{p.label}</div>
                      <div className="text-[10px] text-muted-foreground">{pct}% of total</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-bold tabular-nums" style={{ color }}>{count}</div>
                    <div className="text-[10px] text-muted-foreground">prompts</div>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${barPct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
