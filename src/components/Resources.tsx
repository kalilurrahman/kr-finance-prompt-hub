import React, { useCallback } from "react";
import { Download, FileText, FileType2, File, Terminal, FlaskConical } from "lucide-react";
import { getAllPrompts } from "@/data/prompts";
import { getMappedSampleOutputs } from "@/lib/sampleOutputLibrary";

const resources = [
  {
    platform: "Claude",
    icon: "🟠",
    color: "hsl(25, 90%, 55%)",
    filename: "Claude_Finance_Economics_Prompts.txt",
    description: "500 finance & advisory prompts, Claude-formatted — nuanced reasoning & long context",
    format: "TXT",
    FormatIcon: FileText,
  },
  {
    platform: "Google Gemini",
    icon: "🔵",
    color: "hsl(210, 80%, 55%)",
    filename: "Gemini_Finance_Economics_Prompts.docx",
    description: "500 finance & advisory prompts, Gemini-formatted — multimodal analysis",
    format: "DOCX",
    FormatIcon: FileType2,
  },
  {
    platform: "Perplexity",
    icon: "⬡",
    color: "hsl(270, 70%, 55%)",
    filename: "Perplexity_Finance_Economics_Prompts.pdf",
    description: "120 finance & advisory prompts, Perplexity-formatted — web search & citations",
    format: "PDF",
    FormatIcon: File,
  },
];

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ⚡ Bolt: Memoize static component to prevent re-renders on every search keystroke
// Expected impact: Skips React reconciliation for a large DOM tree during rapid text input
export const Resources = React.memo(function Resources() {
  const allPrompts = getAllPrompts();
  const sampleOutputs = getMappedSampleOutputs();

  const downloadTerminalLibrary = useCallback(
    (format: "json" | "md") => {
      if (format === "json") {
        triggerDownload(
          `FINPROMPT_Terminal_Library_${allPrompts.length}.json`,
          JSON.stringify(allPrompts, null, 2),
          "application/json",
        );
        return;
      }
      const md = allPrompts
        .map(
          (p, i) =>
            `## ${i + 1}. ${p.title}\n\n**Platform:** ${p.platform}  \n**Domain:** ${p.domain}\n\n\`\`\`\n${p.content}\n\`\`\`\n`,
        )
        .join("\n---\n\n");
      triggerDownload(
        `FINPROMPT_Terminal_Library_${allPrompts.length}.md`,
        `# FINPROMPT Terminal — Full Prompt Library\n\n${allPrompts.length} curated prompts by Kalilur Rahman.\n\n${md}`,
        "text/markdown",
      );
    },
    [allPrompts],
  );

  const downloadSampleOutputs = useCallback(
    (format: "json" | "md") => {
      if (format === "json") {
        triggerDownload(
          `FINPROMPT_Sample_Outputs_${sampleOutputs.length}.json`,
          JSON.stringify(sampleOutputs, null, 2),
          "application/json",
        );
        return;
      }
      const md = sampleOutputs
        .map(
          (s, i) =>
            `## ${i + 1}. ${s.promptTitle || s.exampleTitle}\n\n**Domain:** ${s.domain}  \n**Platform:** ${s.platform}  \n**Prompt ID:** ${s.promptId || "—"}\n\n### Sample Output\n\n${s.output}\n`,
        )
        .join("\n---\n\n");
      triggerDownload(
        `FINPROMPT_Sample_Outputs_${sampleOutputs.length}.md`,
        `# FINPROMPT — Sample AI Outputs\n\n${sampleOutputs.length} mapped sample outputs across all finance domains.\n\n${md}`,
        "text/markdown",
      );
    },
    [sampleOutputs],
  );

  return (
    <section className="mb-10">
      <h2 className="mb-1 font-display text-lg font-bold text-foreground">
        Downloadable Resources
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Full prompt libraries — download and use offline with your preferred AI platform.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((r) => (
          <a
            key={r.platform}
            href={`/downloads/${r.filename}`}
            download
            aria-label={`Download ${r.platform} prompts in ${r.format} format`}
            className="group relative flex flex-col gap-3 rounded-xl border border-border/50 bg-card/50 p-5 transition-all hover:border-gold/40 hover:shadow-md hover:shadow-gold/5 no-underline"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg border text-lg"
                style={{ borderColor: r.color, backgroundColor: `${r.color}15` }}
              >
                {r.icon}
              </span>
              <div className="flex-1">
                <span className="text-sm font-semibold text-foreground">{r.platform}</span>
                <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
                  {r.format}
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{r.description}</p>
            <div className="mt-auto flex items-center gap-1.5 text-xs font-medium text-gold opacity-70 group-hover:opacity-100 transition-opacity">
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </div>
          </a>
        ))}
      </div>

      <h3 className="mt-10 mb-1 font-display text-lg font-bold text-foreground">
        FINPROMPT Terminal &amp; Sample Outputs
      </h3>
      <p className="mb-5 text-sm text-muted-foreground">
        Export the full FINPROMPT Terminal library and every mapped Sample AI Output — generated
        live from the same dataset that powers search and filters.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <DownloadCard
          icon={<Terminal className="h-5 w-5 text-gold" />}
          accent="hsl(45, 90%, 55%)"
          title="FINPROMPT Terminal Library"
          subtitle={`${allPrompts.length} curated prompts`}
          description="Complete Bloomberg-style terminal corpus — all prompts across Perplexity, Claude and Gemini with metadata."
          onJson={() => downloadTerminalLibrary("json")}
          onMarkdown={() => downloadTerminalLibrary("md")}
        />
        <DownloadCard
          icon={<FlaskConical className="h-5 w-5 text-emerald-400" />}
          accent="hsl(150, 65%, 50%)"
          title="Sample AI Outputs"
          subtitle={`${sampleOutputs.length} mapped examples`}
          description="Every FINPROMPT-mapped sample output across all 6 finance domains, paired with its source prompt."
          onJson={() => downloadSampleOutputs("json")}
          onMarkdown={() => downloadSampleOutputs("md")}
        />
      </div>
    </section>
  );
});

interface DownloadCardProps {
  icon: React.ReactNode;
  accent: string;
  title: string;
  subtitle: string;
  description: string;
  onJson: () => void;
  onMarkdown: () => void;
}

function DownloadCard({ icon, accent, title, subtitle, description, onJson, onMarkdown }: DownloadCardProps) {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-border/50 bg-card/50 p-5 transition-all hover:border-gold/40 hover:shadow-md hover:shadow-gold/5"
      style={{ borderTopColor: accent, borderTopWidth: 2 }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg border"
          style={{ borderColor: accent, backgroundColor: `${accent}1f` }}
        >
          {icon}
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-[11px] font-mono text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onJson}
          className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-gold/5 px-3 py-1.5 text-xs font-medium text-gold transition-all hover:bg-gold/10"
        >
          <Download className="h-3.5 w-3.5" /> JSON
        </button>
        <button
          type="button"
          onClick={onMarkdown}
          className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-gold/40 hover:bg-secondary"
        >
          <Download className="h-3.5 w-3.5" /> Markdown
        </button>
      </div>
    </div>
  );
}
