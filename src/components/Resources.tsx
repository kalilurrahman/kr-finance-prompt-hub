import { Download, FileText, FileType2, File } from "lucide-react";

const resources = [
  {
    platform: "Claude",
    icon: "🟠",
    color: "hsl(25, 90%, 55%)",
    filename: "Claude_Finance_Economics_Prompts.txt",
    description: "500 prompts optimised for Claude — nuanced reasoning & long context",
    format: "TXT",
    FormatIcon: FileText,
  },
  {
    platform: "Google Gemini",
    icon: "🔵",
    color: "hsl(210, 80%, 55%)",
    filename: "Gemini_Finance_Economics_Prompts.docx",
    description: "500 prompts optimised for Google Gemini — multimodal analysis",
    format: "DOCX",
    FormatIcon: FileType2,
  },
  {
    platform: "Perplexity",
    icon: "⬡",
    color: "hsl(270, 70%, 55%)",
    filename: "Perplexity_Finance_Economics_Prompts.pdf",
    description: "120 prompts optimised for Perplexity — web search & citations",
    format: "PDF",
    FormatIcon: File,
  },
];

export function Resources() {
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
            {/* Platform badge */}
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

            {/* Description */}
            <p className="text-xs leading-relaxed text-muted-foreground">
              {r.description}
            </p>

            {/* Download CTA */}
            <div className="mt-auto flex items-center gap-1.5 text-xs font-medium text-gold opacity-70 group-hover:opacity-100 transition-opacity">
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
