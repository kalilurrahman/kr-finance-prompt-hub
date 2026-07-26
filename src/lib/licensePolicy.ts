/**
 * Pure license-policy evaluation shared by the serverless functions
 * (`functions/api/*`) and the client. No imports, no I/O — fully unit-testable.
 *
 * The Gumroad verify endpoint returns a `purchase` object whose flags encode
 * every state that should revoke access. Platform adapters (Gumroad today,
 * Polar later) normalize into `evaluatePurchase` so the policy lives in one place.
 */

export interface GumroadPurchase {
  refunded?: boolean;
  chargebacked?: boolean;
  disputed?: boolean;
  dispute_won?: boolean;
  subscription_cancelled_at?: string | null;
  subscription_ended_at?: string | null;
  subscription_failed_at?: string | null;
  email?: string;
  quantity?: number;
  is_multiseat_license?: boolean;
}

export type LicenseDenialReason =
  | "refunded"
  | "chargebacked"
  | "disputed"
  | "subscription_inactive";

export interface LicenseEvaluation {
  active: boolean;
  reason?: LicenseDenialReason;
}

export function evaluatePurchase(purchase: GumroadPurchase): LicenseEvaluation {
  if (purchase.refunded) return { active: false, reason: "refunded" };
  if (purchase.chargebacked) return { active: false, reason: "chargebacked" };
  if (purchase.disputed && !purchase.dispute_won) return { active: false, reason: "disputed" };
  if (
    purchase.subscription_cancelled_at ||
    purchase.subscription_ended_at ||
    purchase.subscription_failed_at
  ) {
    return { active: false, reason: "subscription_inactive" };
  }
  return { active: true };
}

export const DEFAULT_ACTIVATION_LIMIT = 5;

/**
 * Device-activation cap. `uses` is Gumroad's per-key verify counter (only
 * incremented on first-time activations, not background re-verifies).
 * Multi-seat purchases get `limit × quantity` activations.
 */
export function withinActivationLimit(
  uses: number,
  limit: number = DEFAULT_ACTIVATION_LIMIT,
  quantity: number = 1,
): boolean {
  const seats = Math.max(1, quantity);
  return uses <= limit * seats;
}
