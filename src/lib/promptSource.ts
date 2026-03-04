// ============================================================
// FINPROMPT — promptSource.ts
// Path: src/lib/promptSource.ts
//
// 1. Source metadata for display badges
// 2. fixPerplexityLabels() — one-shot migration to correct the
//    120 prompts mislabeled as 'claude' → should be 'perplexity'
// 3. SQL alternative if you prefer to run it in Supabase directly
// ============================================================

// supabase import removed — Lovable Cloud not enabled
// import { supabase } from './supabase';

// ── Types ────────────────────────────────────────────────────
export type PromptSource = 'claude' | 'perplexity' | 'chatgpt' | 'gemini' | 'grok' | 'general';

export interface SourceMeta {
  label: string;
  shortLabel: string;
  /** Maps to CSS class: badge-{key} defined in themes.css */
  badgeClass: string;
  icon: string;
  description: string;
}

// ── Source metadata map ──────────────────────────────────────
export const SOURCE_META: Record<string, SourceMeta> = {
  claude: {
    label: 'Claude (Anthropic)',
    shortLabel: 'CLAUDE',
    badgeClass: 'badge-claude',
    icon: '◆',
    description: 'Optimised for Claude — nuanced reasoning, long context',
  },
  perplexity: {
    label: 'Perplexity AI',
    shortLabel: 'PERPLEXITY',
    badgeClass: 'badge-perplexity',
    icon: '⬡',
    description: 'Optimised for Perplexity — web search + citations',
  },
  chatgpt: {
    label: 'ChatGPT (OpenAI)',
    shortLabel: 'CHATGPT',
    badgeClass: 'badge-chatgpt',
    icon: '◎',
    description: 'Optimised for GPT-4o / o-series models',
  },
  gemini: {
    label: 'Gemini (Google)',
    shortLabel: 'GEMINI',
    badgeClass: 'badge-gemini',
    icon: '✦',
    description: 'Optimised for Gemini 1.5 / 2.0',
  },
  grok: {
    label: 'Grok (xAI)',
    shortLabel: 'GROK',
    badgeClass: 'badge-general',
    icon: '⚡',
    description: 'Optimised for Grok with real-time data',
  },
  general: {
    label: 'Universal',
    shortLabel: 'UNIVERSAL',
    badgeClass: 'badge-general',
    icon: '◈',
    description: 'Works across all major LLMs',
  },
};

export function getSourceMeta(source?: string | null): SourceMeta {
  return SOURCE_META[source?.toLowerCase?.() ?? ''] ?? {
    label: source ?? 'Unknown',
    shortLabel: (source ?? 'N/A').toUpperCase().slice(0, 10),
    badgeClass: 'badge-general',
    icon: '◈',
    description: '',
  };
}

// ── One-shot fix: relabel 120 Perplexity prompts ─────────────
/**
 * The initial import tagged ~120 Perplexity prompts as 'claude'.
 * This function identifies them by heuristic and bulk-updates to 'perplexity'.
 *
 * Run once from Admin panel. Safe to re-run — already-fixed rows are skipped.
 *
 * @param onProgress  callback for log messages shown in the admin console
 * @param explicitIds optional array of known IDs to force-fix regardless of heuristic
 */
export async function fixPerplexityLabels(
  onProgress?: (msg: string) => void,
  _explicitIds?: number[]
): Promise<{ fixed: number; skipped: number; errors: number }> {
  const log = (msg: string) => onProgress?.(msg);
  log('→ Supabase not connected — Lovable Cloud is disabled.');
  log('[ERR] Enable Lovable Cloud to run this migration.');
  return { fixed: 0, skipped: 0, errors: 1 };
}

// ── SQL alternative (run in Supabase SQL Editor) ─────────────
export const MIGRATION_SQL = `
-- Step 1: add prompt_source column if not present
ALTER TABLE prompts
  ADD COLUMN IF NOT EXISTS prompt_source TEXT DEFAULT 'general';

-- Step 2: mark known Claude prompts correctly (adjust IDs as needed)
-- UPDATE prompts SET prompt_source = 'claude' WHERE id IN (...);

-- Step 3: relabel Perplexity prompts currently mislabeled as claude
UPDATE prompts
SET prompt_source = 'perplexity'
WHERE prompt_source = 'claude'
  AND (
       prompt_text ILIKE '%search the web%'
    OR prompt_text ILIKE '%perplexity%'
    OR prompt_text ILIKE '%web search%'
    OR prompt_text ILIKE '%real-time data%'
    OR prompt_text ILIKE '%browse the web%'
    OR prompt_text ILIKE '%latest news%'
    OR (prompt_text ILIKE '%cite%' AND (prompt_text ILIKE '%source%' OR prompt_text ILIKE '%reference%'))
  );

-- Step 4: verify counts
SELECT prompt_source, COUNT(*) FROM prompts GROUP BY prompt_source ORDER BY count DESC;
`;
