/**
 * Meta-Prompt Engine — Core Synthesis Logic
 * Builds high-context, platform-specific prompts by cross-referencing the FinPrompt library.
 * 100% client-side, no backend required.
 */

import { getAllPrompts } from "@/data/prompts";
import type { Domain } from "@/types/prompt";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type TargetPlatform =
  | "gemini"
  | "claude"
  | "antigravity"
  | "lovable"
  | "codex";

export type ContextLevel = "simple" | "enterprise";

export interface MetaEngineConfig {
  objective: string;
  platform: TargetPlatform;
  contextLevel: ContextLevel;
  domain: Domain | "all";
  remixPromptId?: string | null; // optional: id of a library prompt to remix
  /** Optional: a real AI sample-output snippet to inject as additional grounding. */
  exampleReference?: { title: string; platform: string; snippet: string } | null;
}

/**
 * Derive a sensible objective sentence from a library prompt's title so we can
 * auto-generate a remix without forcing the user to write the objective.
 */
export function deriveObjectiveFromPrompt(title: string, contentSnippet?: string): string {
  const cleaned = title.replace(/^[\d.\-:\s]+/, "").trim();
  const lead = cleaned.length > 0 ? cleaned : "the user's analytical goal";
  const tail = contentSnippet
    ? ` Use the linked FinPrompt as the structural baseline and adapt it with the chosen companies, geographies and parameters.`
    : "";
  return `Produce a board-ready, fully expanded version of: "${lead}".${tail}`;
}

export interface SourcePromptRef {
  id: string;
  title: string;
  platform: string;
  snippet: string; // first 120 chars of content
}

export interface MetaPromptResult {
  title: string;
  prompt: string;
  platform: TargetPlatform;
  contextLevel: ContextLevel;
  domain: string;
  sourcePrompts: SourcePromptRef[];
  generatedAt: string;
}

// ─────────────────────────────────────────────
// Platform Config
// ─────────────────────────────────────────────

export const TARGET_PLATFORMS: {
  key: TargetPlatform;
  label: string;
  emoji: string;
  color: string;
  description: string;
}[] = [
  {
    key: "gemini",
    label: "Google Gemini",
    emoji: "✦",
    color: "hsl(210, 80%, 55%)",
    description: "Structured role + grounded finance context",
  },
  {
    key: "claude",
    label: "Claude / Claude Code",
    emoji: "⬡",
    color: "hsl(25, 90%, 55%)",
    description: "System-role XML block + task instructions",
  },
  {
    key: "antigravity",
    label: "Antigravity (Agentic)",
    emoji: "🤖",
    color: "hsl(160, 60%, 45%)",
    description: "Agentic Mission format with steps & constraints",
  },
  {
    key: "lovable",
    label: "Lovable (No-Code UI)",
    emoji: "💜",
    color: "hsl(270, 70%, 60%)",
    description: "UI generation spec with component breakdown",
  },
  {
    key: "codex",
    label: "AI Coding (Codex/Cursor)",
    emoji: "⌨",
    color: "hsl(140, 50%, 45%)",
    description: "Code scaffold with function signatures & tests",
  },
];

export const CONTEXT_LEVELS: { key: ContextLevel; label: string; description: string }[] = [
  {
    key: "simple",
    label: "Simple",
    description: "Concise, direct prompt for quick analysis",
  },
  {
    key: "enterprise",
    label: "Enterprise",
    description: "Full-context prompt with data sources, constraints & output specs",
  },
];

// ─────────────────────────────────────────────
// Template Builders
// ─────────────────────────────────────────────

function buildGeminiPrompt(
  config: MetaEngineConfig,
  contextSnippets: string[],
  remixContent: string | null
): string {
  const isEnterprise = config.contextLevel === "enterprise";

  const roleBlock = isEnterprise
    ? `You are an elite financial analyst with 20+ years of experience in ${config.domain === "all" ? "global finance" : config.domain}. You have access to real-time market data, Bloomberg terminals, and proprietary research.`
    : `You are a skilled financial analyst specializing in ${config.domain === "all" ? "finance" : config.domain}.`;

  const contextBlock =
    contextSnippets.length > 0
      ? `\n\n## Reference Context (from FinPrompt Library)\n${contextSnippets
          .map((s, i) => `[Source ${i + 1}]: ${s}`)
          .join("\n\n")}`
      : "";

  const remixBlock = remixContent
    ? `\n\n## Base Prompt to Extend\n> ${remixContent.slice(0, 400)}...`
    : "";

  const enterpriseAdditions = isEnterprise
    ? `\n\n## Output Requirements
- Provide structured analysis with clear sections
- Include quantitative metrics where applicable
- Cite data sources and assumptions
- Flag key risks and sensitivities
- Deliver executive-summary quality output

## Constraints
- Do not hallucinate statistics — use ranges if uncertain
- Maintain confidentiality standards for client data
- Apply IFRS/GAAP standards where relevant`
    : "";

  return `## Role
${roleBlock}

## Objective
${config.objective}${remixBlock}${contextBlock}${enterpriseAdditions}

## Instructions
Please provide a comprehensive, well-structured response that directly addresses the objective above. Ground your analysis in current best practices for ${config.domain === "all" ? "financial markets" : config.domain}.`;
}

function buildClaudePrompt(
  config: MetaEngineConfig,
  contextSnippets: string[],
  remixContent: string | null
): string {
  const isEnterprise = config.contextLevel === "enterprise";

  const systemRole = isEnterprise
    ? `You are a Senior ${config.domain === "all" ? "Finance" : config.domain} Strategist and QE with 20+ years of Wall Street and consulting experience. You think in frameworks (MECE, Porter's Five Forces, DCF, LBO) and communicate at the C-suite level. You are rigorous, data-driven, and skeptical of unsupported claims.`
    : `You are a knowledgeable finance professional focused on ${config.domain === "all" ? "general finance" : config.domain}.`;

  const contextBlock =
    contextSnippets.length > 0
      ? `\n\n<reference_prompts>\n${contextSnippets
          .map((s, i) => `<source id="${i + 1}">\n${s}\n</source>`)
          .join("\n")}\n</reference_prompts>`
      : "";

  const remixBlock = remixContent
    ? `\n\n<base_prompt_to_extend>\n${remixContent.slice(0, 500)}\n</base_prompt_to_extend>`
    : "";

  const enterpriseAdditions = isEnterprise
    ? `\n\n<output_format>
Respond with:
1. Executive Summary (3-5 bullets)
2. Detailed Analysis (structured sections)
3. Key Risks & Mitigants
4. Recommended Next Steps
5. Data Sources & Assumptions
</output_format>

<constraints>
- Reference supporting frameworks (Porter, MECE, DCF, LBO, etc.) where applicable
- Flag any assumptions explicitly
- Maintain professional, board-ready tone
</constraints>`
    : "";

  return `<system>
${systemRole}
</system>

<human>
${config.objective}${remixBlock}${contextBlock}${enterpriseAdditions}

Please provide a thorough, actionable response.
</human>`;
}

function buildAntigravityPrompt(
  config: MetaEngineConfig,
  contextSnippets: string[],
  remixContent: string | null
): string {
  const isEnterprise = config.contextLevel === "enterprise";
  const domain = config.domain === "all" ? "Finance" : config.domain;

  const missionBlock = `🎯 MISSION
${config.objective}`;

  const contextBlock =
    contextSnippets.length > 0
      ? `\n\n📚 KNOWLEDGE CONTEXT (from FinPrompt Library)\n${contextSnippets
          .map((s, i) => `  [Ref-${i + 1}] ${s.slice(0, 200)}`)
          .join("\n\n")}`
      : "";

  const remixBlock = remixContent
    ? `\n\n🔄 BASE PROMPT TO EXTEND\n  ${remixContent.slice(0, 400)}`
    : "";

  const stepsBlock = isEnterprise
    ? `\n\n🧱 EXECUTION STEPS
  Step 1: Research & Context Gathering
    - Pull relevant ${domain} data and benchmarks
    - Cross-reference with industry reports and market data
    - Identify key stakeholders and their priorities

  Step 2: Framework Application
    - Apply appropriate financial models (DCF / LBO / Porter / MECE)
    - Run sensitivity analysis on key assumptions
    - Validate against comparable transactions or benchmarks

  Step 3: Synthesis & Output Generation
    - Structure findings in executive-ready format
    - Generate supporting visualizations / data tables
    - Draft key recommendations with supporting rationale

  Step 4: Quality Assurance
    - Verify all numbers and data sources
    - Check for MECE compliance in recommendations
    - Review for C-suite readability and impact

  Step 5: Delivery
    - Package output in [format: report / deck / model / memo]
    - Highlight top 3 decisions requiring executive action`
    : `\n\n🧱 EXECUTION STEPS
  Step 1: Understand the objective and gather context
  Step 2: Apply relevant ${domain} frameworks
  Step 3: Synthesize findings and generate output
  Step 4: Review and refine for clarity`;

  const constraintsBlock = isEnterprise
    ? `\n\n⚠️ CONSTRAINTS & GUARDRAILS
  - Do NOT fabricate statistics — use ranges or flag uncertainty
  - Apply IFRS / GAAP standards where applicable
  - Maintain confidentiality; anonymize client-specific data
  - All outputs must be audit-ready and citation-backed
  - Escalate decision points that require human judgment`
    : `\n\n⚠️ CONSTRAINTS
  - Be accurate — flag uncertainty rather than guess
  - Be concise and actionable`;

  const successBlock = `\n\n✅ SUCCESS CRITERIA
  - Objective fully addressed with concrete output
  - All key risks explicitly identified
  - Recommendations tied to quantifiable impact`;

  return `${missionBlock}

🏛️ DOMAIN: ${domain}${contextBlock}${remixBlock}${stepsBlock}${constraintsBlock}${successBlock}`;
}

function buildLovablePrompt(
  config: MetaEngineConfig,
  contextSnippets: string[],
  remixContent: string | null
): string {
  const isEnterprise = config.contextLevel === "enterprise";
  const domain = config.domain === "all" ? "Finance" : config.domain;

  const intro = `Build a production-ready ${isEnterprise ? "enterprise" : "clean"} web application that: ${config.objective}`;

  const techStack = isEnterprise
    ? `\n\n## Tech Stack
- Framework: React 18 + TypeScript + Vite
- Styling: Tailwind CSS with a dark, premium gold-on-dark color palette
- UI Library: shadcn/ui components
- State: Zustand or React Context
- Data: Client-side with JSON data layer (no backend required for v1)
- Icons: lucide-react`
    : `\n\n## Tech Stack
- React + TypeScript + Tailwind CSS
- shadcn/ui components
- lucide-react icons`;

  const pages = isEnterprise
    ? `\n\n## Pages & Routes
1. \`/\` — Dashboard / Home with KPI cards and summary charts
2. \`/library\` — Searchable ${domain} data with filter sidebar
3. \`/analyze\` — Analysis workspace with form + output panel
4. \`/settings\` — User preferences and data configuration`
    : `\n\n## Pages
1. Home page with hero section
2. Main content/feature page
3. Results/output panel`;

  const components = `\n\n## Key Components
- \`Header\` — sticky nav with KR branding, gold gradient logo
- \`FilterBar\` — domain/platform filter chips
- \`DataCard\` — premium card with hover effects and gold accent
- \`OutputPanel\` — syntax-highlighted output with copy-to-clipboard
- \`Footer\` — minimal with links`;

  const contextBlock =
    contextSnippets.length > 0
      ? `\n\n## Finance Context (from FinPrompt Library)\nIncorporate these ${domain} prompt patterns as sample data or example queries:\n${contextSnippets
          .map((s, i) => `${i + 1}. ${s.slice(0, 150)}...`)
          .join("\n")}`
      : "";

  const remixBlock = remixContent
    ? `\n\n## Extend This Pattern\nBase the core functionality on this existing prompt:\n> ${remixContent.slice(0, 400)}`
    : "";

  const designSpec = `\n\n## Design Requirements
- Dark theme: background \`#0a0e14\`, text \`#e8e0cc\`, accent gold \`#d4a843\`
- Glassmorphism cards with \`backdrop-blur\` and subtle borders
- Smooth micro-animations on hover and state transitions
- Fully responsive (mobile-first)
- Accessible with proper ARIA labels`;

  return `${intro}${techStack}${pages}${components}${contextBlock}${remixBlock}${designSpec}

## Deliverables
- Complete, runnable code with no placeholder components
- All routes wired and navigable
- README with setup instructions`;
}

function buildCodexPrompt(
  config: MetaEngineConfig,
  contextSnippets: string[],
  remixContent: string | null
): string {
  const isEnterprise = config.contextLevel === "enterprise";
  const domain = config.domain === "all" ? "Finance" : config.domain;

  const taskBlock = `// Task: ${config.objective}
// Domain: ${domain}
// Context Level: ${config.contextLevel}`;

  const contextBlock =
    contextSnippets.length > 0
      ? `\n\n// Reference Prompt Patterns (from FinPrompt Library):\n${contextSnippets
          .map((s, i) => `// [Pattern-${i + 1}]: ${s.slice(0, 180).replace(/\n/g, " ")}`)
          .join("\n")}`
      : "";

  const remixBlock = remixContent
    ? `\n\n// Base Logic to Extend:\n// ${remixContent.slice(0, 400).replace(/\n/g, "\n// ")}`
    : "";

  const scaffold = isEnterprise
    ? `\n\n// ─── File Structure ───────────────────────────────────
// src/
// ├── types/${domain.split(" ")[0].toLowerCase()}.ts       // Domain type definitions
// ├── services/${domain.split(" ")[0].toLowerCase()}Service.ts  // Core business logic
// ├── hooks/use${domain.split(" ")[0]}Analysis.ts          // React hook wrapping service
// ├── components/${domain.split(" ")[0]}Panel.tsx           // UI component
// └── utils/financialCalcs.ts                             // Pure calculation utilities
// ────────────────────────────────────────────────────────

// ─── Types ────────────────────────────────────────────
interface AnalysisInput {
  objective: string;
  domain: string;
  contextLevel: 'simple' | 'enterprise';
  parameters: Record<string, unknown>;
}

interface AnalysisOutput {
  summary: string;
  details: string[];
  recommendations: string[];
  risks: string[];
  dataSourcesUsed: string[];
}

// ─── Service Layer ────────────────────────────────────
class ${domain.split(" ")[0]}AnalysisService {
  async analyze(input: AnalysisInput): Promise<AnalysisOutput> {
    // TODO: Implement core analysis logic
    // 1. Validate input parameters
    // 2. Apply relevant financial frameworks
    // 3. Compute metrics and KPIs
    // 4. Generate structured output
    throw new Error('Not implemented');
  }
}

// ─── Tests ────────────────────────────────────────────
describe('${domain.split(" ")[0]}AnalysisService', () => {
  it('should return structured analysis for valid input', async () => {
    // TODO: Add test implementation
  });

  it('should handle empty input gracefully', async () => {
    // TODO: Add test implementation
  });
});`
    : `\n\n// ─── Implementation ─────────────────────────────────
function analyze(objective: string, domain: string): string {
  // TODO: Implement the core logic for:
  // ${config.objective}
  return '';
}

// ─── Test ─────────────────────────────────────────────
describe('analyze', () => {
  it('should work correctly', () => {
    const result = analyze('test objective', '${domain}');
    expect(result).toBeTruthy();
  });
});`;

  return `${taskBlock}${contextBlock}${remixBlock}${scaffold}

// ─── Instructions ─────────────────────────────────────
// 1. Review the task and reference patterns above
// 2. Implement the TODOs following TypeScript best practices
// 3. Ensure all types are strictly typed (no \`any\`)
// 4. Add JSDoc comments for public API surface
// 5. Write tests for edge cases`;
}

// ─────────────────────────────────────────────
// Main Synthesis Function
// ─────────────────────────────────────────────

export function buildMetaPrompt(config: MetaEngineConfig): MetaPromptResult {
  const allPrompts = getAllPrompts();

  // 1. Filter by domain
  const domainFiltered =
    config.domain === "all"
      ? allPrompts
      : allPrompts.filter((p) => p.domain === config.domain);

  // 2. Filter by objective keywords (simple relevance scoring)
  const objectiveWords = config.objective
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);

  const scored = domainFiltered.map((p) => {
    const text = p._searchableText || (p.title + " " + p.content).toLowerCase();
    const score = objectiveWords.reduce(
      (acc, word) => acc + (text.includes(word) ? 1 : 0),
      0
    );
    return { prompt: p, score };
  });

  // Sort by relevance, pick top 3
  scored.sort((a, b) => b.score - a.score);
  const topPrompts = scored.slice(0, 3).map((s) => s.prompt);

  // 3. Build source refs
  const sourcePrompts: SourcePromptRef[] = topPrompts.map((p) => ({
    id: p.id,
    title: p.title,
    platform: p.platform,
    snippet: p.content.slice(0, 120).trim() + (p.content.length > 120 ? "…" : ""),
  }));

  // 4. Build context snippets from top prompts
  const contextSnippets = topPrompts.map(
    (p) =>
      `**${p.title}** (${p.platform})\n${p.content
        .slice(0, config.contextLevel === "enterprise" ? 300 : 150)
        .trim()}…`
  );

  // 4b. If we have a real AI example output, prepend it as the strongest reference
  if (config.exampleReference) {
    const ex = config.exampleReference;
    const max = config.contextLevel === "enterprise" ? 600 : 280;
    contextSnippets.unshift(
      `**[REAL AI SAMPLE OUTPUT — ${ex.platform.toUpperCase()}] ${ex.title}**\n${ex.snippet
        .slice(0, max)
        .trim()}…`
    );
  }

  // 5. Find remix base content if requested
  const remixPrompt = config.remixPromptId
    ? allPrompts.find((p) => p.id === config.remixPromptId)
    : null;
  const remixContent = remixPrompt ? remixPrompt.content : null;

  // 6. Build the prompt using platform-specific template
  let promptText: string;
  switch (config.platform) {
    case "gemini":
      promptText = buildGeminiPrompt(config, contextSnippets, remixContent);
      break;
    case "claude":
      promptText = buildClaudePrompt(config, contextSnippets, remixContent);
      break;
    case "antigravity":
      promptText = buildAntigravityPrompt(config, contextSnippets, remixContent);
      break;
    case "lovable":
      promptText = buildLovablePrompt(config, contextSnippets, remixContent);
      break;
    case "codex":
      promptText = buildCodexPrompt(config, contextSnippets, remixContent);
      break;
    default:
      promptText = buildGeminiPrompt(config, contextSnippets, remixContent);
  }

  // 7. Generate title
  const platformLabel =
    TARGET_PLATFORMS.find((p) => p.key === config.platform)?.label ?? config.platform;
  const domainLabel = config.domain === "all" ? "All Domains" : config.domain;
  const title = `${platformLabel} · ${domainLabel} · ${config.contextLevel === "enterprise" ? "Enterprise" : "Simple"}`;

  return {
    title,
    prompt: promptText,
    platform: config.platform,
    contextLevel: config.contextLevel,
    domain: domainLabel,
    sourcePrompts,
    generatedAt: new Date().toISOString(),
  };
}
