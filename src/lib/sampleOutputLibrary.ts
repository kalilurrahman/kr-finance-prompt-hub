import examples from "@/data/examples.json";
import terminalPromptLibrary from "@/data/prompts-library.json";
import type { Domain } from "@/types/prompt";
import type { TerminalPrompt } from "@/types/terminal";

type ExamplePlatform = "claude" | "gemini" | "perplexity" | "chatgpt" | "finprompt";

export interface SampleOutputEntry {
  id: string;
  promptId: number;          // 0 if no library match
  promptTitle: string;
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
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// Build lookup of library prompts by normalized title (for cross-linking from prompt cards)
const terminalPrompts = (terminalPromptLibrary as TerminalPrompt[]).map((prompt) => ({
  ...prompt,
  tags: prompt.tags || [],
  type: prompt.type || "finance",
}));
const libraryByTitle = new Map(terminalPrompts.map((p) => [normalize(p.title), p]));

// Map every example.json entry to a SampleOutputEntry — examples.json is the source of truth.
const allExamples: SampleOutputEntry[] = (examples as RawExample[]).map((ex) => {
  const matchedPrompt = libraryByTitle.get(normalize(ex.promptTitle));
  const domain = (VALID_DOMAINS.includes(ex.domain as Domain)
    ? ex.domain
    : "Corporate Strategy & Growth") as Domain;

  return {
    id: ex.id,
    promptId: matchedPrompt?.id ?? 0,
    promptTitle: ex.promptTitle,
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
for (const entry of allExamples) {
  if (entry.promptId > 0 && !sampleByPromptId.has(entry.promptId)) {
    sampleByPromptId.set(entry.promptId, entry);
  }
}

export const SAMPLE_OUTPUT_LIMIT = allExamples.length;

export function getMappedSampleOutputs() {
  return allExamples;
}

export function getMappedSampleOutputByPromptId(promptId: number) {
  return sampleByPromptId.get(promptId);
}
