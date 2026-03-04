import { Copy, Heart, Share2, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Prompt } from "@/types/prompt";
import { DOMAIN_ICONS, PLATFORMS } from "@/types/prompt";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { downloadAsTxt, downloadAsHtml, downloadAsPdf } from "@/utils/downloadPrompt";

interface PromptDetailProps {
  prompt: Prompt | null;
  open: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function PromptDetail({ prompt, open, onClose, isFavorite, onToggleFavorite }: PromptDetailProps) {
  if (!prompt) return null;

  const platformInfo = PLATFORMS.find((p) => p.key === prompt.platform);
  const domainIcon = DOMAIN_ICONS[prompt.domain] || "📄";

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    toast.success("Prompt copied to clipboard!");
  };

  const handleShare = () => {
    const url = `${window.location.origin}?prompt=${prompt.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const downloadData = {
    title: prompt.title,
    content: prompt.content,
    category: prompt.domain,
    platform: platformInfo?.label || prompt.platform,
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col border-border/50 bg-card p-0">
        <DialogHeader className="border-b border-border/30 px-6 pt-6 pb-4">
          <div className="flex items-start gap-3">
            <span className="mt-1 text-2xl">{domainIcon}</span>
            <div className="flex-1">
              <DialogTitle className="font-display text-lg font-semibold leading-snug pr-8">
                {prompt.title}
              </DialogTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: `${platformInfo?.color}20`, color: platformInfo?.color }}
                >
                  {platformInfo?.icon} {platformInfo?.label}
                </span>
                <span className="rounded-md bg-secondary/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {prompt.domain}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {prompt.content}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-border/30 px-6 py-4">
          <Button onClick={handleCopy} className="gap-2 bg-gold text-primary-foreground hover:bg-gold/90">
            <Copy className="h-4 w-4" /> Copy Prompt
          </Button>
          <Button variant="outline" onClick={onToggleFavorite} className="gap-2">
            <Heart className={cn("h-4 w-4", isFavorite && "fill-gold text-gold")} />
            {isFavorite ? "Saved" : "Save"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" title="Download prompt">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { downloadAsTxt(downloadData); toast.success("Downloaded as TXT"); }}>
                📄 Download as TXT
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { downloadAsHtml(downloadData); toast.success("Downloaded as HTML"); }}>
                🌐 Download as HTML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { downloadAsPdf(downloadData); toast.info("Print dialog opened — save as PDF"); }}>
                📑 Download as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
