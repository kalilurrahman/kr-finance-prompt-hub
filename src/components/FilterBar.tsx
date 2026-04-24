import React from "react";
import { Button } from "@/components/ui/button";
import { PLATFORMS, DOMAINS, DOMAIN_ICONS } from "@/types/prompt";
import type { Platform, Domain } from "@/types/prompt";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface FilterBarProps {
  platform: Platform | "all";
  onPlatformChange: (p: Platform | "all") => void;
  domain: Domain | "all";
  onDomainChange: (d: Domain | "all") => void;
  totalCount: number;
  filteredCount: number;
}

// ⚡ Memoize filter bar to prevent re-renders on every search keystroke
export const FilterBar = React.memo(function FilterBar({
  platform,
  onPlatformChange,
  domain,
  onDomainChange,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  const isFiltered = platform !== "all" || domain !== "all";

  const clearAll = () => {
    onPlatformChange("all");
    onDomainChange("all");
  };

  return (
    <div className="space-y-4 rounded-xl border border-border/40 bg-card/30 p-4 backdrop-blur-sm">
      {/* Platform Tabs */}
      <div>
        <p className="mb-2.5 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">AI Platform</p>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <PlatformTab
            active={platform === "all"}
            onClick={() => onPlatformChange("all")}
            label="All"
            icon="🌐"
            color="#d97706"
          />
          {PLATFORMS.map((p) => (
            <PlatformTab
              key={p.key}
              active={platform === p.key}
              onClick={() => onPlatformChange(p.key)}
              label={p.label}
              icon={p.icon}
              color={p.color}
            />
          ))}
        </div>
      </div>

      {/* Domain Pills */}
      <div>
        <p className="mb-2.5 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Domain</p>
        <div className="flex flex-wrap items-center gap-2">
          <DomainPill
            active={domain === "all"}
            onClick={() => onDomainChange("all")}
            label="All Domains"
            icon="📋"
          />
          {DOMAINS.map((d) => (
            <DomainPill
              key={d}
              active={domain === d}
              onClick={() => onDomainChange(d)}
              label={d}
              icon={DOMAIN_ICONS[d] || "📄"}
            />
          ))}
        </div>
      </div>

      {/* Counter + Clear All */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-bold text-foreground">{filteredCount.toLocaleString()}</span>
          {filteredCount !== totalCount && (
            <span className="text-xs"> of <span className="text-gold">{totalCount.toLocaleString()}</span></span>
          )}{" "}
          prompts
        </div>
        {isFiltered && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-xs text-muted-foreground transition-all hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label="Clear all filters"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
});

function PlatformTab({
  active,
  onClick,
  label,
  icon,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
        active
          ? "shadow-md border-transparent text-white"
          : "border-border/50 bg-secondary/50 text-muted-foreground hover:border-border hover:text-foreground hover:bg-secondary"
      )}
      style={active ? { backgroundColor: color, boxShadow: `0 0 16px ${color}40` } : {}}
    >
      <span className="text-sm">{icon}</span>
      {label}
    </button>
  );
}

function DomainPill({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}) {
  // Shorten long domain labels
  const shortLabel = label
    .replace("Corporate Strategy & Growth", "Corp. Strategy")
    .replace("Investment Banking & Equity Research", "IB & Equity")
    .replace("Private Equity & Venture Capital", "PE & VC")
    .replace("Economics & Macroeconomic Analysis", "Economics")
    .replace("FP&A & Budgeting", "FP&A");

  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "bg-gold/15 text-gold border-gold/50 shadow-sm shadow-gold/10"
          : "bg-secondary/50 text-muted-foreground border-border/50 hover:border-gold/30 hover:text-foreground hover:bg-secondary"
      )}
    >
      <span>{icon}</span>
      {shortLabel}
    </button>
  );
}
