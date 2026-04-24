/**
 * Prompt Variable Detection & Substitution
 * Detects [PLACEHOLDER] and {{placeholder}} patterns in FinPrompt library prompts.
 */

/**
 * Known non-variable bracket patterns to exclude.
 */
const EXCLUDED_PATTERNS: RegExp[] = [
  /^\d+$/,                          // Pure numbers: [1], [2]
  /^Ref-\d+$/i,                     // Reference markers: [Ref-1]
  /^Source \d+$/i,                   // Source refs: [Source 1]
  /^Pattern-\d+$/i,                  // Pattern refs: [Pattern-1]
  /^[A-Z]$/,                        // Single letter: [A], [B]
  /^NEW$/i,                          // Code diff markers
  /^DELETE$/i,
  /^MODIFY$/i,
  /^Note$/i,
  /^Optional$/i,
];

/**
 * Parse an "inputs" line like:
 *   [COMPANY NAME | TARGET COUNTRY | INDUSTRY | CAPITAL]
 * into individual variables.
 */
function parseInputsLine(raw: string): string[] {
  return raw
    .split("|")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !EXCLUDED_PATTERNS.some((p) => p.test(s)));
}

/**
 * Detect input variable slots in a prompt string.
 * Supports:
 *   [SINGLE VARIABLE]
 *   [VAR ONE | VAR TWO | VAR THREE]  (pipe-separated on one line)
 *   {{variable}}
 * Returns unique variable names in the order they appear.
 */
export function detectVariables(text: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();

  // Match all [...] blocks (possibly containing pipes)
  const bracketRegex = /\[([^\]]{2,200})\]/g;
  let match: RegExpExecArray | null;

  while ((match = bracketRegex.exec(text)) !== null) {
    const inner = match[1].trim();

    // Check if it looks like variable slots (contains uppercase words, possibly pipes)
    // Skip if it looks like a section heading or short code
    const hasPipe = inner.includes("|");
    const hasUpperWords = /[A-Z]{2,}/.test(inner);

    if (!hasUpperWords && !hasPipe) continue;
    if (EXCLUDED_PATTERNS.some((p) => p.test(inner))) continue;

    if (hasPipe) {
      // Multi-variable pipe-separated block
      const parts = parseInputsLine(inner);
      parts.forEach((v) => {
        if (!seen.has(v)) {
          seen.add(v);
          found.push(v);
        }
      });
    } else {
      // Single variable
      const v = inner.trim();
      if (v.length >= 2 && !EXCLUDED_PATTERNS.some((p) => p.test(v)) && !seen.has(v)) {
        seen.add(v);
        found.push(v);
      }
    }
  }

  // Also match {{variable}} patterns
  const mustacheRegex = /\{\{([^}]{2,80}?)\}\}/g;
  while ((match = mustacheRegex.exec(text)) !== null) {
    const v = match[1].trim();
    if (!seen.has(v) && !EXCLUDED_PATTERNS.some((p) => p.test(v))) {
      seen.add(v);
      found.push(v);
    }
  }

  return found;
}

/**
 * Substitute detected variables in a prompt with user-provided values.
 * Leaves unfilled variables as-is.
 */
export function substituteVariables(
  text: string,
  values: Record<string, string>
): string {
  let result = text;

  // Handle pipe-separated blocks first — replace entire block if all parts are filled
  const bracketRegex = /\[([^\]]{2,200})\]/g;
  result = result.replace(bracketRegex, (fullMatch, inner) => {
    const hasPipe = inner.includes("|");
    if (!hasPipe) {
      // Single variable substitution
      const v = inner.trim();
      const val = values[v];
      return val?.trim() ? val.trim() : fullMatch;
    } else {
      // Pipe-separated: build filled string
      const parts = parseInputsLine(inner);
      const allFilled = parts.every((p) => values[p]?.trim());
      if (allFilled) {
        return parts.map((p) => values[p].trim()).join(" | ");
      }
      // Partially filled: substitute what we can
      const partiallyFilled = parts
        .map((p) => (values[p]?.trim() ? values[p].trim() : `[${p}]`))
        .join(" | ");
      return partiallyFilled;
    }
  });

  // Handle {{variable}} patterns
  Object.entries(values).forEach(([key, val]) => {
    if (val.trim()) {
      result = result.split(`{{${key}}}`).join(val.trim());
    }
  });

  return result;
}

const DIV = "─".repeat(64);

/**
 * Build a fully contextualized prompt by:
 *  1. Prepending a CONTEXT block (filled variable values) at the very top
 *  2. Substituting all [VAR] / [VAR1|VAR2] patterns inline throughout the prompt body
 *  3. Reformatting the "My inputs:" section into a clean key→value list
 *  4. Appending tweaks in a clearly separated section at the bottom
 *
 * This ensures the LLM reads the context first and applies it throughout.
 */
export function buildFilledPrompt(
  promptContent: string,
  variableValues: Record<string, string>,
  tweaks: string
): string {
  const filledEntries = Object.entries(variableValues).filter(([, v]) => v.trim());
  const unfilledEntries = Object.entries(variableValues).filter(([, v]) => !v.trim());

  // ── 1. Build context preamble ────────────────────────────────────────────
  let contextBlock = "";
  if (filledEntries.length > 0) {
    const maxKeyLen = Math.max(...filledEntries.map(([k]) => k.length));
    const rows = filledEntries
      .map(([k, v]) => `  ${k.padEnd(maxKeyLen)}  →  ${v}`)
      .join("\n");
    const unfilled =
      unfilledEntries.length > 0
        ? `\n  (${unfilledEntries.length} variable${unfilledEntries.length > 1 ? "s" : ""} left unfilled: ${unfilledEntries.map(([k]) => k).join(", ")})`
        : "";

    contextBlock = [
      DIV,
      "  ◆  YOUR CONTEXT  —  injected by Meta-Prompt Engine",
      DIV,
      rows,
      unfilled,
      DIV,
      "",
      "",
    ].join("\n");
  }

  // ── 2. Substitute variables inline throughout the prompt body ────────────
  let body = substituteVariables(promptContent, variableValues);

  // ── 3. Reformat "My inputs:" line into a clean structured block ──────────
  // The inputs line typically looks like:
  //   My inputs: Value1 | Value2 | [UNFILLED] | …
  // after substituteVariables(). We replace it with a nicer format.
  body = body.replace(
    /My inputs?:?\s*([\s\S]{1,400}?)(?:\n{2,}|$)/i,
    (_match, inputContent) => {
      const parts = inputContent
        .split("|")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      if (parts.length === 0) return _match;

      // Map each part to its key (bracket) or filled value
      const formatted = parts.map((part: string) => {
        const isBracket = /^\[.+\]$/.test(part);
        const label = isBracket ? part.slice(1, -1) : part;
        const isEmpty = isBracket;
        return isEmpty ? `  ▷  ${label}: (to be specified)` : `  ▶  ${label}`;
      });

      return (
        "\n" +
        DIV +
        "\n  ◆  PROMPT INPUTS\n" +
        DIV +
        "\n" +
        formatted.join("\n") +
        "\n" +
        DIV +
        "\n\n"
      );
    }
  );

  // ── 4. Append tweaks ─────────────────────────────────────────────────────
  const tweaksSection = tweaks.trim()
    ? [
        "",
        DIV,
        "  ◆  ADDITIONAL CONTEXT & MODIFICATIONS",
        DIV,
        "",
        tweaks.trim(),
        "",
        DIV,
      ].join("\n")
    : "";

  return `${contextBlock}${body}${tweaksSection}`;
}
