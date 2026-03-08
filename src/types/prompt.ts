export type Platform = "claude" | "perplexity" | "gemini";

export type Domain =
  | "Corporate Strategy & Growth"
  | "Mergers & Acquisitions"
  | "Investment Banking & Equity Research"
  | "Private Equity & Venture Capital"
  | "Economics & Macroeconomic Analysis"
  | "FP&A & Budgeting";

export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  platform: Platform;
  domain: Domain;
  prompt_source?: string;
  // ⚡ Bolt: Pre-computed string containing title, content, and domain for fast O(1) search filtering
  _searchableText?: string;
}

export const DOMAINS: Domain[] = [
  "Corporate Strategy & Growth",
  "Mergers & Acquisitions",
  "Investment Banking & Equity Research",
  "Private Equity & Venture Capital",
  "Economics & Macroeconomic Analysis",
  "FP&A & Budgeting",
];

export const PLATFORMS: { key: Platform; label: string; icon: string; color: string }[] = [
  { key: "claude", label: "Claude", icon: "🟠", color: "hsl(25, 90%, 55%)" },
  { key: "perplexity", label: "Perplexity", icon: "⬡", color: "hsl(270, 70%, 55%)" },
  { key: "gemini", label: "Google Gemini", icon: "🔵", color: "hsl(210, 80%, 55%)" },
];

export const DOMAIN_ICONS: Record<Domain, string> = {
  "Corporate Strategy & Growth": "🏢",
  "Mergers & Acquisitions": "🤝",
  "Investment Banking & Equity Research": "📊",
  "Private Equity & Venture Capital": "💼",
  "Economics & Macroeconomic Analysis": "🌍",
  "FP&A & Budgeting": "📈",
};
