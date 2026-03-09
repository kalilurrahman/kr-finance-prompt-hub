import { Button } from "@/components/ui/button";
import { PLATFORMS, DOMAINS } from "@/types/prompt";
import type { Platform, Domain } from "@/types/prompt";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  platform: Platform | "all";
  onPlatformChange: (p: Platform | "all") => void;
  domain: Domain | "all";
  onDomainChange: (d: Domain | "all") => void;
  totalCount: number;
  filteredCount: number;
}

export function FilterBar({
  platform,
  onPlatformChange,
  domain,
  onDomainChange,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Platform Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        <PlatformTab
          active={platform === "all"}
          onClick={() => onPlatformChange("all")}
          label="All Platforms"
          icon="🌐"
        />
        {PLATFORMS.map((p) => (
          <PlatformTab
            key={p.key}
            active={platform === p.key}
            onClick={() => onPlatformChange(p.key)}
            label={p.label}
            icon={p.icon}
          />
        ))}
      </div>

      {/* Domain Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <DomainPill
          active={domain === "all"}
          onClick={() => onDomainChange("all")}
          label="All Domains"
        />
        {DOMAINS.map((d) => (
          <DomainPill
            key={d}
            active={domain === d}
            onClick={() => onDomainChange(d)}
            label={d}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{filteredCount.toLocaleString()}</span> prompts
        {filteredCount !== totalCount && (
          <span> · <span className="text-gold">{totalCount.toLocaleString()}</span> total</span>
        )}
      </div>
    </div>
  );
}

function PlatformTab({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: string }) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 gap-1.5 text-xs",
        active && "bg-gold text-primary-foreground hover:bg-gold/90"
      )}
    >
      <span>{icon}</span>
      {label}
    </Button>
  );
}

function DomainPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "bg-gold/15 text-gold border border-gold/30"
          : "bg-secondary/50 text-muted-foreground border border-border/50 hover:border-gold/30 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
