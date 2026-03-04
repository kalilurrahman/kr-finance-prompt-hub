export interface TerminalPrompt {
  id: number;
  title: string;
  category: string;
  prompt_text: string;
  tags: string[];
  type?: string;
}

export const TERMINAL_CATEGORIES = [
  "Corporate Strategy & Growth",
  "Economics & Macroeconomic Analysis",
  "Financial Planning & Analysis (FP&A)",
  "Investment Banking & Equity Research",
  "Mergers & Acquisitions",
  "Private Equity & Venture Capital",
] as const;

export type TerminalCategory = (typeof TERMINAL_CATEGORIES)[number];
