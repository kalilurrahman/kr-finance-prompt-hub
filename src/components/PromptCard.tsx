import { Copy, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Prompt } from "@/types/prompt";
import { DOMAIN_ICONS, PLATFORMS } from "@/types/prompt";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getSourceMeta } from "@/lib/promptSource";

interface PromptCardProps {
  prompt: Prompt;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
}

export function PromptCard({ prompt, isFavorite, onToggleFavorite, onClick }: PromptCardProps) {
  const platformInfo = PLATFORMS.find((p) => p.key === prompt.platform);
  const domainIcon = DOMAIN_ICONS[prompt.domain] || "📄";
  const sourceMeta = getSourceMeta((prompt as Prompt & { prompt_source?: string }).prompt_source);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.content);
    toast.success("Prompt copied to clipboard!");
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      className="group cursor-pointer border-border/50 bg-card/50 transition-all duration-200 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        {/* Top row: domain icon + platform badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{domainIcon}</span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: `${platformInfo?.color}20`, color: platformInfo?.color }}
            >
              {platformInfo?.icon} {platformInfo?.label}
            </span>
            <span className={`${sourceMeta.badgeClass} font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded`}>
              {sourceMeta.icon} {sourceMeta.shortLabel}
            </span>
          </div>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={handleCopy}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              title="Copy prompt"
              aria-label="Copy prompt"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleFavorite}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                isFavorite ? "text-gold" : "text-muted-foreground hover:text-gold"
              )}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={cn("h-3.5 w-3.5", isFavorite && "fill-current")} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display text-sm font-semibold leading-snug text-foreground line-clamp-2">
          {prompt.title}
        </h3>

        {/* Snippet */}
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
          {prompt.content.slice(0, 150)}...
        </p>

        {/* Domain tag */}
        <div className="mt-auto">
          <span className="rounded-md bg-secondary/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {prompt.domain}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
