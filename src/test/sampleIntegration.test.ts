import { describe, it, expect } from "vitest";
import examples from "@/data/examples.json";
import {
  getMappedSampleOutputs,
  getRealExampleCount,
  REAL_OUTPUT_MIN_LENGTH,
  SAMPLE_OUTPUT_LIMIT,
} from "@/lib/sampleOutputLibrary";

const VALID_DOMAINS = new Set([
  "Corporate Strategy & Growth",
  "Mergers & Acquisitions",
  "Investment Banking & Equity Research",
  "Private Equity & Venture Capital",
  "Economics & Macroeconomic Analysis",
  "FP&A & Budgeting",
]);

describe("Sample examples integration (ex-221..280 move + ex-501..550 additions)", () => {
  const all = examples as Array<{ id: string; promptTitle: string; domain: string; output: string }>;
  const byId = new Map(all.map((e) => [e.id, e]));

  it("ex-501..560 source IDs were moved (not duplicated)", () => {
    for (let n = 551; n <= 560; n++) {
      expect(byId.has(`ex-${n}`)).toBe(false);
    }
  });

  it("ex-221..310 contain full outputs (no placeholders) with canonical domains", () => {
    for (let n = 221; n <= 310; n++) {
      const e = byId.get(`ex-${n}`);
      expect(e, `ex-${n} missing`).toBeDefined();
      expect(e!.output.length).toBeGreaterThan(400);
      expect(VALID_DOMAINS.has(e!.domain)).toBe(true);
    }
  });

  it("ex-501..550 are present and indexed by the resolver", () => {
    const resolved = getMappedSampleOutputs();
    const resolvedIds = new Set(resolved.map((r) => r.id));
    for (let n = 501; n <= 550; n++) {
      expect(byId.has(`ex-${n}`)).toBe(true);
      expect(resolvedIds.has(`ex-${n}`)).toBe(true);
    }
  });

  it("category filter returns the new examples", () => {
    const resolved = getMappedSampleOutputs();
    const newOnes = resolved.filter((r) => {
      const m = r.id.match(/ex-(\d+)/);
      return m && +m[1] >= 501 && +m[1] <= 550;
    });
    const domains = new Set(newOnes.map((r) => r.domain));
    expect(newOnes.length).toBe(50);
    // Should span multiple canonical domains
    expect(domains.size).toBeGreaterThanOrEqual(4);
    for (const d of domains) expect(VALID_DOMAINS.has(d)).toBe(true);
  });

  it("simple search by title surfaces new entries", () => {
    const resolved = getMappedSampleOutputs();
    const sample = byId.get("ex-510")!;
    const q = sample.promptTitle.split(" ").slice(0, 3).join(" ").toLowerCase();
    const hit = resolved.find(
      (r) =>
        r.id === "ex-510" &&
        (r.promptTitle + " " + r.exampleTitle).toLowerCase().includes(q),
    );
    expect(hit).toBeTruthy();
  });

  it("SAMPLE_OUTPUT_LIMIT reflects the full dataset", () => {
    expect(SAMPLE_OUTPUT_LIMIT).toBe(all.length);
    expect(SAMPLE_OUTPUT_LIMIT).toBeGreaterThanOrEqual(550);
  });
});
