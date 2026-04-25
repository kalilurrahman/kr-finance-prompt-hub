import examples from "@/data/examples.json";
import terminalPromptLibrary from "@/data/prompts-library.json";
import type { Domain } from "@/types/prompt";
import type { TerminalPrompt } from "@/types/terminal";

export const SAMPLE_OUTPUT_LIMIT = 250;

type ExamplePlatform = "claude" | "gemini" | "perplexity";

export interface SampleOutputEntry {
  id: string;
  promptId: number;
  promptTitle: string;
  domain: Domain;
  platform: ExamplePlatform | "finprompt";
  model: string;
  parameters: Record<string, string>;
  generatedAt: string;
  output: string;
  sourceType: "sample_output" | "prompt_reference";
}

const terminalCategoryToDomain: Record<string, Domain> = {
  "Corporate Strategy & Growth": "Corporate Strategy & Growth",
  "Economics & Macroeconomic Analysis": "Economics & Macroeconomic Analysis",
  "Financial Planning & Analysis (FP&A)": "FP&A & Budgeting",
  "Investment Banking & Equity Research": "Investment Banking & Equity Research",
  "Mergers & Acquisitions": "Mergers & Acquisitions",
  "Private Equity & Venture Capital": "Private Equity & Venture Capital",
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const terminalPrompts = (terminalPromptLibrary as TerminalPrompt[]).map((prompt) => ({
  ...prompt,
  tags: prompt.tags || [],
  type: prompt.type || "finance",
}));

const sampleOutputByTitle = new Map(
  (examples as Array<{
    promptTitle: string;
    platform: ExamplePlatform;
    model: string;
    parameters: Record<string, string>;
    generatedAt: string;
    output: string;
  }>).map((example) => [normalize(example.promptTitle), example]),
);

function buildPromptReference(prompt: TerminalPrompt) {
  const tags = prompt.tags.length > 0 ? prompt.tags.join(" · ") : "General";

  return [
    "## FINPROMPT Prompt Reference",
    "",
    "### Prompt Title",
    prompt.title,
    "",
    "### FINPROMPT Category",
    prompt.category,
    "",
    "### Tags",
    tags,
    "",
    "### Prompt Body",
    prompt.prompt_text,
  ].join("\n");
}

function buildPromptParameters(prompt: TerminalPrompt) {
  return {
    "FINPROMPT ID": `#${prompt.id}`,
    Category: prompt.category,
    Tags: prompt.tags.length > 0 ? prompt.tags.slice(0, 3).join(", ") : "General",
  };
}

const mappedSampleOutputs: SampleOutputEntry[] = terminalPrompts
  .slice(0, SAMPLE_OUTPUT_LIMIT)
  .map((prompt) => {
    const mappedDomain = terminalCategoryToDomain[prompt.category] ?? "Corporate Strategy & Growth";
    const sampleOutput = sampleOutputByTitle.get(normalize(prompt.title));

    if (sampleOutput) {
      return {
        id: `sample-${prompt.id}`,
        promptId: prompt.id,
        promptTitle: prompt.title,
        domain: mappedDomain,
        platform: sampleOutput.platform,
        model: sampleOutput.model,
        parameters: {
          "FINPROMPT ID": `#${prompt.id}`,
          ...sampleOutput.parameters,
        },
        generatedAt: sampleOutput.generatedAt,
        output: sampleOutput.output,
        sourceType: "sample_output" as const,
      };
    }

    return {
      id: `sample-${prompt.id}`,
      promptId: prompt.id,
      promptTitle: prompt.title,
      domain: mappedDomain,
      platform: "finprompt" as const,
      model: "FINPROMPT Prompt Reference",
      parameters: buildPromptParameters(prompt),
      generatedAt: new Date("2026-01-01T00:00:00Z").toISOString(),
      output: buildPromptReference(prompt),
      sourceType: "prompt_reference" as const,
    };
  });

const sampleOutputByPromptId = new Map(mappedSampleOutputs.map((entry) => [entry.promptId, entry]));

export function getMappedSampleOutputs() {
  return mappedSampleOutputs;
}

export function getMappedSampleOutputByPromptId(promptId: number) {
  return sampleOutputByPromptId.get(promptId);
}
