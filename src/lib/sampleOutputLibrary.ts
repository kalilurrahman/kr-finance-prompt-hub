import examples from "@/data/examples.json";
import terminalPromptLibrary from "@/data/prompts-library.json";
import type { Domain } from "@/types/prompt";
import type { TerminalPrompt } from "@/types/terminal";

type ExamplePlatform = "claude" | "gemini" | "perplexity" | "chatgpt" | "finprompt";

export interface SampleOutputEntry {
  id: string;
  promptId: number;          // 0 if no library match
  promptTitle: string;       // Always the canonical library title when mapped
  exampleTitle: string;      // The original (often shorter) title used in the example file
  domain: Domain;
  platform: ExamplePlatform;
  model: string;
  parameters: Record<string, string>;
  generatedAt: string;
  output: string;
  sourceType: "sample_output";
}

interface RawExample {
  id: string;
  promptTitle: string;
  domain: string;
  platform: ExamplePlatform;
  model: string;
  parameters: Record<string, string>;
  generatedAt: string;
  output: string;
}

const VALID_DOMAINS: Domain[] = [
  "Corporate Strategy & Growth",
  "Mergers & Acquisitions",
  "Investment Banking & Equity Research",
  "Private Equity & Venture Capital",
  "Economics & Macroeconomic Analysis",
  "FP&A & Budgeting",
];

const normalize = (value: string) =>
  value.toLowerCase().replace(/^the\s+/, "").replace(/[^a-z0-9]+/g, " ").trim();

// Library lookup: by canonical id and by normalized title
const terminalPrompts = (terminalPromptLibrary as TerminalPrompt[]).map((prompt) => ({
  ...prompt,
  tags: prompt.tags || [],
  type: prompt.type || "finance",
}));
const libraryById = new Map(terminalPrompts.map((p) => [p.id, p]));
const libraryByTitle = new Map(terminalPrompts.map((p) => [normalize(p.title), p]));

const coerceDomain = (raw: string): Domain =>
  (VALID_DOMAINS.includes(raw as Domain) ? raw : "Corporate Strategy & Growth") as Domain;

// Examples are conventionally keyed `ex-N` where N is the library prompt id.
// We map by id first (highest fidelity), then fall back to normalized title.
const allExamples: SampleOutputEntry[] = (examples as RawExample[]).map((ex) => {
  const idMatch = ex.id.match(/^ex-(\d+)$/);
  const numericId = idMatch ? parseInt(idMatch[1], 10) : 0;

  const matchedById = numericId > 0 ? libraryById.get(numericId) : undefined;
  const matchedByTitle = matchedById ?? libraryByTitle.get(normalize(ex.promptTitle));
  const matched = matchedById ?? matchedByTitle;

  // Prefer the library's canonical title + category whenever we have a match.
  const promptTitle = matched?.title ?? ex.promptTitle;
  const domain = matched?.category ? coerceDomain(matched.category) : coerceDomain(ex.domain);

  return {
    id: ex.id,
    promptId: matched?.id ?? 0,
    promptTitle,
    exampleTitle: ex.promptTitle,
    domain,
    platform: ex.platform,
    model: ex.model,
    parameters: ex.parameters,
    generatedAt: ex.generatedAt,
    output: ex.output,
    sourceType: "sample_output" as const,
  };
});

const sampleByPromptId = new Map<number, SampleOutputEntry>();
const sampleByNormalizedTitle = new Map<string, SampleOutputEntry>();
for (const entry of allExamples) {
  if (entry.promptId > 0 && !sampleByPromptId.has(entry.promptId)) {
    sampleByPromptId.set(entry.promptId, entry);
  }
  const key = normalize(entry.promptTitle);
  if (key && !sampleByNormalizedTitle.has(key)) {
    sampleByNormalizedTitle.set(key, entry);
  }
  const altKey = normalize(entry.exampleTitle);
  if (altKey && !sampleByNormalizedTitle.has(altKey)) {
    sampleByNormalizedTitle.set(altKey, entry);
  }
}

export const SAMPLE_OUTPUT_LIMIT = allExamples.length;

export function getMappedSampleOutputs() {
  return allExamples;
}

export function getMappedSampleOutputByPromptId(promptId: number) {
  return sampleByPromptId.get(promptId);
}

/**
 * Resolve an example for a workshop/library prompt that may use a string id like
 * `gemini-12`, `claude-7`, `perplexity-3`. Falls back to title matching.
 */
export function resolveSampleForPrompt(opts: {
  id?: string | number;
  title?: string;
}): SampleOutputEntry | undefined {
  if (typeof opts.id === "number" && opts.id > 0) {
    const direct = sampleByPromptId.get(opts.id);
    if (direct) return direct;
  }
  if (typeof opts.id === "string") {
    const m = opts.id.match(/(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      const direct = sampleByPromptId.get(n);
      if (direct) return direct;
    }
  }
  if (opts.title) {
    return sampleByNormalizedTitle.get(normalize(opts.title));
  }
  return undefined;
}

/** Coverage stats for the admin dashboard. */
export interface CategoryCoverage {
  category: string;
  promptCount: number;
  exampleCount: number;
  mappedCount: number;
}

export function getLibraryCoverage(): {
  totals: { prompts: number; examples: number; mapped: number; unmapped: number };
  byCategory: CategoryCoverage[];
  promptsWithoutExamples: { id: number; title: string; category: string }[];
} {
  const promptsByCategory = new Map<string, TerminalPrompt[]>();
  for (const p of terminalPrompts) {
    const list = promptsByCategory.get(p.category) ?? [];
    list.push(p);
    promptsByCategory.set(p.category, list);
  }

  const examplesByCategory = new Map<string, SampleOutputEntry[]>();
  for (const e of allExamples) {
    const list = examplesByCategory.get(e.domain) ?? [];
    list.push(e);
    examplesByCategory.set(e.domain, list);
  }

  const categories = new Set<string>([
    ...promptsByCategory.keys(),
    ...examplesByCategory.keys(),
  ]);

  const byCategory: CategoryCoverage[] = Array.from(categories)
    .map((category) => {
      const prompts = promptsByCategory.get(category) ?? [];
      const examples = examplesByCategory.get(category) ?? [];
      const mapped = examples.filter((e) => e.promptId > 0).length;
      return {
        category,
        promptCount: prompts.length,
        exampleCount: examples.length,
        mappedCount: mapped,
      };
    })
    .sort((a, b) => b.promptCount - a.promptCount);

  const mapped = allExamples.filter((e) => e.promptId > 0).length;
  const promptsWithoutExamples = terminalPrompts
    .filter((p) => !sampleByPromptId.has(p.id))
    .map((p) => ({ id: p.id, title: p.title, category: p.category }));

  return {
    totals: {
      prompts: terminalPrompts.length,
      examples: allExamples.length,
      mapped,
      unmapped: allExamples.length - mapped,
    },
    byCategory,
    promptsWithoutExamples,
  };
}
