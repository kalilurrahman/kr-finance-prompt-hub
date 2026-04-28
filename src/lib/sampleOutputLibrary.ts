import examples from "@/data/examples.json";
import terminalPromptLibrary from "@/data/prompts-library.json";
import type { Domain } from "@/types/prompt";
import type { TerminalPrompt } from "@/types/terminal";
import { getAllOverrides, getOverride } from "./sampleMappingOverrides";

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
  /** How the example was linked to its FinPrompt — useful for the admin view. */
  matchSource: "override" | "id" | "title" | "domain+platform" | "none";
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

/** Pull the first integer out of any id-like string: "ex-42" → 42, "gemini-7" → 7. */
const extractId = (id: string | number | undefined): number => {
  if (typeof id === "number") return id > 0 ? id : 0;
  if (!id) return 0;
  const m = String(id).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
};

const coerceDomain = (raw: string): Domain =>
  (VALID_DOMAINS.includes(raw as Domain) ? raw : "Corporate Strategy & Growth") as Domain;

// ─── Library indexes ──────────────────────────────────────────────
const terminalPrompts = (terminalPromptLibrary as TerminalPrompt[]).map((prompt) => ({
  ...prompt,
  tags: prompt.tags || [],
  type: prompt.type || "finance",
}));
const libraryById = new Map(terminalPrompts.map((p) => [p.id, p]));
const libraryByTitle = new Map(terminalPrompts.map((p) => [normalize(p.title), p]));

// Pre-compute remaining, unmapped library prompts grouped by category for the
// last-resort domain+platform fallback. We pop entries off these lists as we
// assign them to examples so each library prompt gets at most one fallback link.
const libraryByCategory = new Map<string, TerminalPrompt[]>();
for (const p of terminalPrompts) {
  const list = libraryByCategory.get(p.category) ?? [];
  list.push(p);
  libraryByCategory.set(p.category, list);
}

/** Public list of all library prompts (used by the admin mapping editor). */
export function getAllLibraryPrompts(): { id: number; title: string; category: string }[] {
  return terminalPrompts.map((p) => ({ id: p.id, title: p.title, category: p.category }));
}

// ─── Resolve every example with the new fallback chain ────────────
//
// Priority order:
//   1. Admin override (localStorage)  — highest fidelity, manual
//   2. Numeric id extracted from `ex.id`
//   3. Normalized library-title match
//   4. Domain match against an unclaimed library prompt
//
// Step 4 is one-shot per library prompt to avoid every Strategy example
// pointing at the same prompt #1.
function buildResolved(): SampleOutputEntry[] {
  const overrides = getAllOverrides();
  const claimedLibraryIds = new Set<number>();

  // First pass: claim by id + title so deterministic links happen first
  // regardless of the order of `examples`.
  const passOne = (examples as RawExample[]).map((ex) => {
    const overrideId = overrides[ex.id];
    if (typeof overrideId === "number") {
      if (overrideId === 0) {
        return { ex, matched: undefined, matchSource: "override" as const };
      }
      const matched = libraryById.get(overrideId);
      if (matched) {
        claimedLibraryIds.add(matched.id);
        return { ex, matched, matchSource: "override" as const };
      }
    }

    const numericId = extractId(ex.id);
    const byId = numericId > 0 ? libraryById.get(numericId) : undefined;
    if (byId) {
      claimedLibraryIds.add(byId.id);
      return { ex, matched: byId, matchSource: "id" as const };
    }

    const byTitle = libraryByTitle.get(normalize(ex.promptTitle));
    if (byTitle) {
      claimedLibraryIds.add(byTitle.id);
      return { ex, matched: byTitle, matchSource: "title" as const };
    }

    return { ex, matched: undefined as TerminalPrompt | undefined, matchSource: "none" as const };
  });

  // Second pass: domain+platform fallback for still-unmatched examples.
  // Walk category lists and assign the first unclaimed library prompt.
  const cursor = new Map<string, number>();

  return passOne.map(({ ex, matched, matchSource }) => {
    let finalMatched = matched;
    let finalSource: SampleOutputEntry["matchSource"] = matchSource;

    if (!finalMatched && matchSource !== "override") {
      const domain = coerceDomain(ex.domain);
      const pool = libraryByCategory.get(domain) ?? [];
      let idx = cursor.get(domain) ?? 0;
      while (idx < pool.length && claimedLibraryIds.has(pool[idx].id)) {
        idx++;
      }
      if (idx < pool.length) {
        finalMatched = pool[idx];
        claimedLibraryIds.add(pool[idx].id);
        finalSource = "domain+platform";
        cursor.set(domain, idx + 1);
      }
    }

    const promptTitle = finalMatched?.title ?? ex.promptTitle;
    const domain = finalMatched?.category
      ? coerceDomain(finalMatched.category)
      : coerceDomain(ex.domain);

    return {
      id: ex.id,
      promptId: finalMatched?.id ?? 0,
      promptTitle,
      exampleTitle: ex.promptTitle,
      domain,
      platform: ex.platform,
      model: ex.model,
      parameters: ex.parameters,
      generatedAt: ex.generatedAt,
      output: ex.output,
      sourceType: "sample_output" as const,
      matchSource: finalMatched ? finalSource : "none",
    };
  });
}

let cached: SampleOutputEntry[] | null = null;
let sampleByPromptId: Map<number, SampleOutputEntry> = new Map();
let sampleByNormalizedTitle: Map<string, SampleOutputEntry> = new Map();

function rebuild() {
  cached = buildResolved();
  sampleByPromptId = new Map();
  sampleByNormalizedTitle = new Map();
  for (const entry of cached) {
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
}

function ensure() {
  if (!cached) rebuild();
}

/** Force a rebuild — call this after admin overrides change. */
export function refreshSampleLibrary() {
  rebuild();
}

export const SAMPLE_OUTPUT_LIMIT = (examples as RawExample[]).length;

export function getMappedSampleOutputs(): SampleOutputEntry[] {
  ensure();
  return cached!;
}

export function getMappedSampleOutputByPromptId(promptId: number) {
  ensure();
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
  ensure();
  const numeric = extractId(opts.id);
  if (numeric > 0) {
    const direct = sampleByPromptId.get(numeric);
    if (direct) return direct;
  }
  if (opts.title) {
    return sampleByNormalizedTitle.get(normalize(opts.title));
  }
  return undefined;
}

/** Return the override (if any) for a given example id. */
export function getOverrideFor(exampleId: string): number | undefined {
  return getOverride(exampleId);
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
  ensure();
  const all = cached!;

  const promptsByCategory = new Map<string, TerminalPrompt[]>();
  for (const p of terminalPrompts) {
    const list = promptsByCategory.get(p.category) ?? [];
    list.push(p);
    promptsByCategory.set(p.category, list);
  }

  const examplesByCategory = new Map<string, SampleOutputEntry[]>();
  for (const e of all) {
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

  const mapped = all.filter((e) => e.promptId > 0).length;
  const promptsWithoutExamples = terminalPrompts
    .filter((p) => !sampleByPromptId.has(p.id))
    .map((p) => ({ id: p.id, title: p.title, category: p.category }));

  return {
    totals: {
      prompts: terminalPrompts.length,
      examples: all.length,
      mapped,
      unmapped: all.length - mapped,
    },
    byCategory,
    promptsWithoutExamples,
  };
}
