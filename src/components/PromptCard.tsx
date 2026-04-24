import React from "react";
import { Copy, Heart, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Prompt } from "@/types/prompt";
import { DOMAIN_ICONS, PLATFORMS } from "@/types/prompt";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getSourceMeta } from "@/lib/promptSource";

interface PromptCardProps {
  prompt: Prompt;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClick: (prompt: Prompt) => void;
}

function getWordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export const PromptCard = React.memo(function PromptCard({ prompt, isFavorite, onToggleFavorite, onClick }: PromptCardProps) {
  const platformInfo = PLATFORMS.find((p) => p.key === prompt.platform);
  const domainIcon = DOMAIN_ICONS[prompt.domain] || "📄";
  const sourceMeta = getSourceMeta((prompt as Prompt & { prompt_source?: string }).prompt_source);
  const wordCount = getWordCount(prompt.content);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.content).then(() => {
      toast.success("Prompt copied to clipboard!", { duration: 2000 });
    }).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = prompt.content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast.success("Prompt copied!");
    });
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(prompt.id);
  };

  return (
    <Card
      className={cn(
        "group relative border-border/50 bg-card/50 transition-all duration-200 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/8 hover:-translate-y-0.5 cursor-pointer",
        isFavorite && "border-l-4 border-l-gold/70"
      )}
      style={!isFavorite ? { borderLeft: `3px solid ${platformInfo?.color || "transparent"}` } : {}}
    >
      {/* Invisible overlay for full-card click */}
      <button
        aria-label={`View details for ${prompt.title}`}
        onClick={() => onClick(prompt)}
        className="absolute inset-0 z-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />

      <CardContent className="flex flex-col gap-3 p-4">
        {/* Top row: domain icon + platform badge + source */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg" role="img" aria-label={prompt.domain}>{domainIcon}</span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
              style={{ backgroundColor: `${platformInfo?.color}20`, color: platformInfo?.color }}
            >
              {platformInfo?.icon} {platformInfo?.label}
            </span>
            <span className={`${sourceMeta.badgeClass} font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded`}>
              {sourceMeta.icon} {sourceMeta.shortLabel}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display text-sm font-semibold leading-snug text-foreground line-clamp-2 z-[1] relative">
          {prompt.title}
        </h3>

        {/* Snippet */}
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-4 z-[1] relative">
          {prompt.content.slice(0, 220)}…
        </p>

        {/* Footer: domain tag + word count + action buttons */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-md bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {prompt.domain}
            </span>
            <span className="rounded-md bg-secondary/40 px-2 py-0.5 text-[10px] text-muted-foreground/70 font-mono">
              {wordCount}w
            </span>
          </div>

          {/* Action buttons — always visible */}
          <div className="relative z-10 flex items-center gap-1 shrink-0">
            <button
              onClick={() => onClick(prompt)}
              className="rounded-md p-1.5 text-muted-foreground bg-secondary/50 hover:bg-secondary hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              title="View prompt"
              aria-label={`View full prompt: ${prompt.title}`}
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleCopy}
              className="rounded-md p-1.5 text-muted-foreground bg-secondary/50 hover:bg-secondary hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              title="Copy prompt"
              aria-label="Copy prompt to clipboard"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleFavorite}
              className={cn(
                "rounded-md p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                isFavorite
                  ? "text-gold bg-gold/10"
                  : "text-muted-foreground bg-secondary/50 hover:text-gold hover:bg-gold/10"
              )}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
              aria-pressed={isFavorite}
            >
              <Heart className={cn("h-3.5 w-3.5", isFavorite && "fill-current")} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
