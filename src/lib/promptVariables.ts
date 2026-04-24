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

/**
 * Build a "filled" preview of the prompt showing substituted and unsubstituted vars.
 * Returns the text with substituted values bolded in a semantic sense (plain text markers).
 */
export function buildFilledPrompt(
  promptContent: string,
  variableValues: Record<string, string>,
  tweaks: string
): string {
  let filled = substituteVariables(promptContent, variableValues);

  if (tweaks.trim()) {
    filled += `\n\n---\n\n## Additional Context & Tweaks\n${tweaks.trim()}`;
  }

  return filled;
}
