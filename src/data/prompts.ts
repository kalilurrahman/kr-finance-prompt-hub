import type { Prompt, Domain, Platform } from "@/types/prompt";
import geminiRaw from "./perplexity-prompts.json";
import claudeRaw from "./claude-prompts-full.txt?raw";

const categoryToDomain: Record<string, Domain> = {
  Strategy: "Corporate Strategy & Growth",
  "M&A": "Mergers & Acquisitions",
  "Equity Research": "Investment Banking & Equity Research",
  "Private Equity": "Private Equity & Venture Capital",
  Macroeconomics: "Economics & Macroeconomic Analysis",
  "FP&A / Finance": "FP&A & Budgeting",
};

function inferDomain(title: string, content: string): Domain {
  const text = (title + " " + content).toLowerCase();
  if (text.includes("fp&a") || text.includes("budgeting") || text.includes("operating plan") || text.includes("financial planning") || text.includes("zero-based") || text.includes("treasury") || text.includes("forecasting"))
    return "FP&A & Budgeting";
  if (text.includes("macroeconom") || text.includes("geopolitical") || text.includes("monetary policy") || text.includes("central bank") || text.includes("emerging market") || text.includes("sovereign") || text.includes("inflation") || text.includes("gdp"))
    return "Economics & Macroeconomic Analysis";
  if (text.includes("private equity") || text.includes("venture capital") || text.includes("lbo") || text.includes("buyout") || text.includes("portfolio company") || text.includes("vc ") || text.includes("series a") || text.includes("series b"))
    return "Private Equity & Venture Capital";
  if (text.includes("equity research") || text.includes("stock pitch") || text.includes("earnings") || text.includes("initiat") || text.includes("coverage") || text.includes("ipo") || text.includes("valuation") || text.includes("fairness opinion"))
    return "Investment Banking & Equity Research";
  if (text.includes("m&a") || text.includes("merger") || text.includes("acquisition") || text.includes("due diligence") || text.includes("synergy") || text.includes("carve-out") || text.includes("spin-off") || text.includes("sell-side") || text.includes("integration"))
    return "Mergers & Acquisitions";
  return "Corporate Strategy & Growth";
}

function parseClaudePrompts(raw: string): Prompt[] {
  const prompts: Prompt[] = [];
  const sections = raw.split(/\nPROMPT\s+(\d+)\s*[—–-]\s*/);

  for (let i = 1; i < sections.length; i += 2) {
    const num = parseInt(sections[i]);
    const body = sections[i + 1];
    if (!body) continue;

    const lines = body.trim().split("\n");
    const title = lines[0]?.replace(/^[─\-─]+$/, "").trim() || `Claude Prompt ${num}`;

    let contentStart = 1;
    for (let j = 1; j < lines.length; j++) {
      if (/^[─\-]+$/.test(lines[j].trim())) {
        contentStart = j + 1;
        break;
      }
    }

    const content = lines.slice(contentStart).join("\n").trim();
    if (!content) continue;

    const domain = inferDomain(title, content);

    prompts.push({
      id: `claude-${num}`,
      title,
      content,
      category: title,
      platform: "claude",
      domain,
    });
  }

  return prompts;
}

function normalizeGemini(raw: typeof geminiRaw): Prompt[] {
  return (raw as { id: number; title: string; category: string; content: string }[]).map((p) => {
    const domain = categoryToDomain[p.category] || inferDomain(p.title, p.content);
    const shortTitle = p.title.length > 80
      ? p.title.slice(0, p.title.indexOf("...") > 0 ? p.title.indexOf("...") : 80).trim()
      : p.title;
    return {
      id: `gemini-${p.id}`,
      title: shortTitle,
      content: p.content,
      category: p.category,
      platform: "gemini" as Platform,
      domain,
    };
  });
}

let _allPrompts: Prompt[] | null = null;

export function getAllPrompts(): Prompt[] {
  if (_allPrompts) return _allPrompts;

  const gemini = normalizeGemini(geminiRaw);
  const claude = parseClaudePrompts(claudeRaw);

  _allPrompts = [...gemini, ...claude];
  return _allPrompts;
}

export function getPromptStats() {
  const all = getAllPrompts();
  const byPlatform: Record<string, number> = {};
  const byDomain: Record<string, number> = {};

  all.forEach((p) => {
    byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1;
    byDomain[p.domain] = (byDomain[p.domain] || 0) + 1;
  });

  return { total: all.length, byPlatform, byDomain };
}
