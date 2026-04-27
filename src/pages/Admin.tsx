import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SampleOutputsModal } from "@/components/SampleOutputsModal";
import {
  getLibraryCoverage,
  getMappedSampleOutputs,
  SAMPLE_OUTPUT_LIMIT,
} from "@/lib/sampleOutputLibrary";
import { DOMAIN_ICONS } from "@/types/prompt";
import type { Domain } from "@/types/prompt";
import { CheckCircle2, AlertCircle, Database, FlaskConical, Layers, ExternalLink, Eye } from "lucide-react";

export default function Admin() {
  const [search, setSearch] = useState("");
  const [openExampleId, setOpenExampleId] = useState<string | null>(null);
  const coverage = useMemo(() => getLibraryCoverage(), []);
  const examples = useMemo(() => getMappedSampleOutputs(), []);

  const coveragePct = coverage.totals.prompts === 0
    ? 0
    : Math.round((coverage.totals.mapped / coverage.totals.prompts) * 100);

  // Group examples by category for the detail table
  const examplesByCategory = useMemo(() => {
    const map = new Map<string, typeof examples>();
    for (const ex of examples) {
      const list = map.get(ex.domain) ?? [];
      list.push(ex);
      map.set(ex.domain, list);
    }
    return map;
  }, [examples]);

  const filteredCategories = coverage.byCategory.filter((c) =>
    c.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        search={search}
        onSearchChange={setSearch}
        showFavorites={false}
        onToggleFavorites={() => {}}
        favCount={0}
      />

      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        {/* Hero */}
        <header className="mb-8 sm:mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gold">
              <Database className="h-3 w-3" />
              Admin
            </span>
            <span className="text-[11px] text-muted-foreground/85 font-mono">
              FINPROMPT · Library Coverage Dashboard
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold leading-tight text-foreground">
            Prompt &amp; Example Coverage
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Real-time view of every prompt in the library and the sample outputs mapped to them.
            Updates automatically when <code className="text-gold/90 bg-secondary/40 px-1 rounded text-[12px]">examples.json</code> or
            <code className="text-gold/90 bg-secondary/40 px-1 rounded text-[12px] ml-1">prompts-library.json</code> changes.
          </p>
        </header>

        {/* Top stat tiles */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          <StatTile
            icon={<Layers className="h-4 w-4" />}
            label="Library prompts"
            value={coverage.totals.prompts}
            tone="neutral"
          />
          <StatTile
            icon={<FlaskConical className="h-4 w-4" />}
            label="Sample outputs"
            value={SAMPLE_OUTPUT_LIMIT}
            tone="gold"
          />
          <StatTile
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Mapped to prompts"
            value={coverage.totals.mapped}
            sub={`${coveragePct}% coverage`}
            tone="success"
          />
          <StatTile
            icon={<AlertCircle className="h-4 w-4" />}
            label="Missing examples"
            value={coverage.promptsWithoutExamples.length}
            sub={
              coverage.promptsWithoutExamples.length === 0
                ? "All prompts covered ✓"
                : "Prompts without samples"
            }
            tone={coverage.promptsWithoutExamples.length === 0 ? "success" : "warn"}
          />
        </section>

        {/* Category coverage table */}
        <section className="mb-8 sm:mb-10">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground">
              Coverage by category
            </h2>
            <span className="text-[11px] text-muted-foreground font-mono">
              {filteredCategories.length} categor{filteredCategories.length === 1 ? "y" : "ies"}
            </span>
          </div>
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-secondary/40 border-b border-border/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Category</th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">Prompts</th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">Examples</th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">Mapped</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground hidden sm:table-cell">
                      Coverage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((c, i) => {
                    const pct = c.promptCount === 0
                      ? 0
                      : Math.round((c.mappedCount / c.promptCount) * 100);
                    const icon = DOMAIN_ICONS[c.category as Domain] ?? "📊";
                    return (
                      <tr
                        key={c.category}
                        className={`border-b border-border/30 hover:bg-secondary/30 transition-colors ${
                          i % 2 === 1 ? "bg-secondary/10" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{icon}</span>
                            <span className="font-medium text-foreground">{c.category}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-foreground">
                          {c.promptCount}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-gold/90">
                          {c.exampleCount}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span
                            className={
                              c.mappedCount === c.promptCount && c.promptCount > 0
                                ? "text-emerald-400"
                                : "text-muted-foreground"
                            }
                          >
                            {c.mappedCount} / {c.promptCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-32 bg-secondary/60 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-gold/70 to-gold rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-muted-foreground font-mono w-10 text-right">
                              {pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Per-category drilldown */}
        <section className="space-y-6">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground">
            Examples per category
          </h2>
          {Array.from(examplesByCategory.entries()).map(([category, items]) => (
            <details
              key={category}
              className="group rounded-xl border border-border/60 bg-card overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors list-none">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{DOMAIN_ICONS[category as Domain] ?? "📊"}</span>
                  <span className="font-medium text-foreground truncate">{category}</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                  {items.length} example{items.length === 1 ? "" : "s"}
                </span>
              </summary>
              <div className="border-t border-border/40 max-h-96 overflow-y-auto overscroll-contain">
                <ul className="divide-y divide-border/30">
                  {items.map((ex) => (
                    <li key={ex.id} className="flex items-start gap-3 px-4 py-2.5 text-xs hover:bg-secondary/20 transition-colors">
                      <span className="font-mono text-[10px] text-muted-foreground/80 shrink-0 w-12">
                        {ex.id}
                      </span>
                      <button
                        onClick={() => setOpenExampleId(ex.id)}
                        className="flex-1 min-w-0 text-left group"
                        title="Open example output"
                      >
                        <p className="text-foreground/90 truncate group-hover:text-gold transition-colors">
                          {ex.promptTitle}
                        </p>
                        <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                          <span className="uppercase tracking-wider">{ex.platform}</span>
                          <span className="mx-1.5">·</span>
                          {ex.model}
                        </p>
                      </button>
                      <button
                        onClick={() => setOpenExampleId(ex.id)}
                        className="shrink-0 inline-flex items-center gap-1 rounded-md border border-gold/30 bg-gold/10 px-2 py-1 text-[10px] font-semibold text-gold hover:bg-gold/20 transition-colors"
                        title="View AI sample output"
                      >
                        <Eye className="h-3 w-3" />
                        Output
                      </button>
                      {ex.promptId > 0 ? (
                        <Link
                          to={`/library?prompt=${ex.promptId}`}
                          className="shrink-0 inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-2 py-1 text-[10px] text-emerald-400 hover:bg-emerald-500/15 transition-colors"
                          title={`Open original FinPrompt #${ex.promptId}`}
                        >
                          #{ex.promptId}
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      ) : (
                        <span className="shrink-0 text-[10px] rounded-md border border-gold/30 bg-gold/10 text-gold/90 px-2 py-1 uppercase tracking-wider">
                          Reference
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </section>

        {/* Prompts missing examples */}
        {coverage.promptsWithoutExamples.length > 0 && (
          <section className="mt-8 sm:mt-10">
            <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-3">
              Prompts without examples
            </h2>
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <ul className="divide-y divide-border/30 max-h-96 overflow-y-auto overscroll-contain">
                {coverage.promptsWithoutExamples.map((p) => (
                  <li key={p.id} className="flex items-start gap-3 px-4 py-2.5 text-xs hover:bg-secondary/20">
                    <span className="font-mono text-[10px] text-muted-foreground/80 shrink-0 w-10">
                      #{p.id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground/90 truncate">{p.title}</p>
                      <p className="text-[10px] text-muted-foreground/80 mt-0.5">{p.category}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>

      <Footer />

      <SampleOutputsModal
        isOpen={openExampleId !== null}
        onClose={() => setOpenExampleId(null)}
        initialExampleId={openExampleId ?? undefined}
      />
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  tone: "neutral" | "gold" | "success" | "warn";
}) {
  const toneClass =
    tone === "gold"
      ? "border-gold/30 bg-gold/5 text-gold"
      : tone === "success"
        ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
        : tone === "warn"
          ? "border-amber-500/30 bg-amber-500/5 text-amber-400"
          : "border-border/60 bg-secondary/30 text-foreground";
  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-90">
        {icon}
        <span>{label}</span>
      </div>
      <p className="font-display text-2xl sm:text-3xl font-bold mt-2 leading-none">
        {value.toLocaleString()}
      </p>
      {sub && <p className="text-[11px] mt-1 opacity-80">{sub}</p>}
    </div>
  );
}
