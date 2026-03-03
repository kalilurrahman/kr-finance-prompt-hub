import { useMemo } from "react";
import { getPromptStats } from "@/data/prompts";
import { PLATFORMS, DOMAINS, DOMAIN_ICONS } from "@/types/prompt";

export function Analytics() {
  const stats = useMemo(() => getPromptStats(), []);

  const maxDomainCount = Math.max(...Object.values(stats.byDomain));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Domain Distribution */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-5">
        <h3 className="mb-4 font-display text-sm font-semibold text-foreground">Prompts by Domain</h3>
        <div className="space-y-3">
          {DOMAINS.map((d) => {
            const count = stats.byDomain[d] || 0;
            const pct = (count / maxDomainCount) * 100;
            return (
              <div key={d} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span>{DOMAIN_ICONS[d]}</span>
                    <span className="truncate">{d}</span>
                  </span>
                  <span className="font-semibold text-foreground">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full gradient-gold transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Distribution */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-5">
        <h3 className="mb-4 font-display text-sm font-semibold text-foreground">Prompts by Platform</h3>
        <div className="flex items-center justify-center gap-6 py-4">
          {PLATFORMS.map((p) => {
            const count = stats.byPlatform[p.key] || 0;
            const pct = ((count / stats.total) * 100).toFixed(0);
            return (
              <div key={p.key} className="flex flex-col items-center gap-2">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] text-2xl"
                  style={{ borderColor: p.color }}
                >
                  {p.icon}
                </div>
                <span className="text-xs font-medium text-foreground">{p.label}</span>
                <span className="text-lg font-bold text-foreground">{count}</span>
                <span className="text-[10px] text-muted-foreground">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
