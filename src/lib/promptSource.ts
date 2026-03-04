// ============================================================
// FINPROMPT — promptSource.ts
// Path: src/lib/promptSource.ts
//
// 1. Source metadata for display badges
// 2. fixPerplexityLabels() — one-shot migration to correct the
//    120 prompts mislabeled as 'claude' → should be 'perplexity'
// 3. SQL alternative if you prefer to run it in Supabase directly
// ============================================================

import { supabase } from './supabase';

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
  explicitIds?: number[]
): Promise<{ fixed: number; skipped: number; errors: number }> {
  const log = (msg: string) => onProgress?.(msg);

  log('→ Fetching prompts currently labeled as "claude"...');

  const { data, error } = await supabase
    .from('prompts')
    .select('id, title, prompt_text, tags, prompt_source')
    .eq('prompt_source', 'claude');

  if (error) {
    log(`[ERR] ${error.message}`);
    return { fixed: 0, skipped: 0, errors: 1 };
  }

  const candidates = data ?? [];
  log(`→ ${candidates.length} records labeled 'claude'. Running heuristic...`);

  const toFix: number[] = [];

  for (const p of candidates) {
    // Explicit ID override
    if (explicitIds?.length && explicitIds.includes(p.id)) {
      toFix.push(p.id);
      continue;
    }

    const text  = (p.prompt_text ?? '').toLowerCase();
    const title = (p.title ?? '').toLowerCase();
    const tags: string[] = p.tags ?? [];

    // Perplexity-style patterns: web search, citations, real-time
    const isPerplexity =
      tags.some((t: string) => t.toLowerCase().includes('perplexity')) ||
      title.includes('perplexity') ||
      text.includes('perplexity') ||
      text.includes('search the web') ||
      text.includes('web search') ||
      text.includes('real-time data') ||
      text.includes('real-time information') ||
      text.includes('browse the web') ||
      text.includes('latest news') ||
      // Citations pattern common in Perplexity prompts
      (text.includes('cite') && (text.includes('source') || text.includes('reference'))) ||
      (text.includes('[') && text.includes(']') && text.includes('http'));

    if (isPerplexity) toFix.push(p.id);
  }

  log(`→ ${toFix.length} records identified as Perplexity. Updating...`);

  if (toFix.length === 0) {
    log('→ Nothing to fix. Pass explicitIds if you know specific IDs.');
    return { fixed: 0, skipped: candidates.length, errors: 0 };
  }

  const CHUNK = 100;
  let fixed = 0, errors = 0;

  for (let i = 0; i < toFix.length; i += CHUNK) {
    const chunk = toFix.slice(i, i + CHUNK);
    const { error: err } = await supabase
      .from('prompts')
      .update({ prompt_source: 'perplexity' })
      .in('id', chunk);

    if (err) {
      log(`[ERR] chunk ${Math.floor(i / CHUNK) + 1}: ${err.message}`);
      errors += chunk.length;
    } else {
      fixed += chunk.length;
      log(`[OK] Updated IDs ${chunk[0]}–${chunk[chunk.length - 1]}`);
    }
  }

  log(`→ Complete. Fixed: ${fixed}  |  Errors: ${errors}  |  Unchanged: ${candidates.length - toFix.length}`);
  return { fixed, skipped: candidates.length - toFix.length, errors };
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
