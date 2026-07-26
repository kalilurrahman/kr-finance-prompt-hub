import { describe, it, expect } from "vitest";
import {
  evaluatePurchase,
  withinActivationLimit,
  DEFAULT_ACTIVATION_LIMIT,
} from "@/lib/licensePolicy";

describe("evaluatePurchase", () => {
  it("accepts a clean one-time purchase", () => {
    expect(evaluatePurchase({ email: "buyer@example.com" })).toEqual({ active: true });
  });

  it("rejects refunded purchases", () => {
    expect(evaluatePurchase({ refunded: true })).toEqual({ active: false, reason: "refunded" });
  });

  it("rejects chargebacked purchases", () => {
    expect(evaluatePurchase({ chargebacked: true })).toEqual({
      active: false,
      reason: "chargebacked",
    });
  });

  it("rejects open disputes but accepts disputes the seller won", () => {
    expect(evaluatePurchase({ disputed: true })).toEqual({ active: false, reason: "disputed" });
    expect(evaluatePurchase({ disputed: true, dispute_won: true })).toEqual({ active: true });
  });

  it("rejects lapsed subscriptions in every lapse mode", () => {
    for (const flag of [
      "subscription_cancelled_at",
      "subscription_ended_at",
      "subscription_failed_at",
    ] as const) {
      expect(evaluatePurchase({ [flag]: "2026-07-01T00:00:00Z" })).toEqual({
        active: false,
        reason: "subscription_inactive",
      });
    }
  });

  it("accepts a live subscription (all lapse flags null)", () => {
    expect(
      evaluatePurchase({
        subscription_cancelled_at: null,
        subscription_ended_at: null,
        subscription_failed_at: null,
      }),
    ).toEqual({ active: true });
  });

  it("refund takes precedence over subscription state", () => {
    expect(
      evaluatePurchase({ refunded: true, subscription_cancelled_at: "2026-01-01T00:00:00Z" }),
    ).toEqual({ active: false, reason: "refunded" });
  });
});

describe("withinActivationLimit", () => {
  it("allows activations up to the default limit", () => {
    expect(withinActivationLimit(1)).toBe(true);
    expect(withinActivationLimit(DEFAULT_ACTIVATION_LIMIT)).toBe(true);
    expect(withinActivationLimit(DEFAULT_ACTIVATION_LIMIT + 1)).toBe(false);
  });

  it("scales the cap by seat quantity for multi-seat licenses", () => {
    expect(withinActivationLimit(12, 5, 3)).toBe(true);
    expect(withinActivationLimit(16, 5, 3)).toBe(false);
  });

  it("treats quantity 0 (missing) as a single seat", () => {
    expect(withinActivationLimit(5, 5, 0)).toBe(true);
    expect(withinActivationLimit(6, 5, 0)).toBe(false);
  });
});
