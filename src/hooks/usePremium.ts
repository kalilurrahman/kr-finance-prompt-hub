import { useCallback, useEffect, useState } from "react";
import type { Prompt } from "@/types/prompt";
import { mergePremiumPrompts, clearPremiumPrompts, getPremiumCount } from "@/data/prompts";

/**
 * License unlock flow for FinPrompt Pro.
 *
 * Disabled unless VITE_PREMIUM_API_URL is set (e.g. "/api" when the site and
 * its Pages Functions share an origin) — with the flag unset the site behaves
 * exactly as before. Only the license key and the short-lived session JWT are
 * persisted; premium content itself is never written to localStorage.
 */

const API_BASE = (import.meta.env.VITE_PREMIUM_API_URL as string | undefined) ?? "";
export const premiumEnabled = API_BASE.length > 0;

const STORAGE_KEY = "finprompt_license_v1";

interface StoredLicense {
  key: string;
  token: string;
  expiresAt: number;
}

interface PremiumPayload {
  version: string;
  prompts: Prompt[];
}

export type PremiumStatus = "disabled" | "locked" | "activating" | "unlocked" | "error";

function readStored(): StoredLicense | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredLicense;
    if (typeof parsed?.key !== "string" || typeof parsed?.token !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(license: StoredLicense | null) {
  try {
    if (license) localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function usePremium() {
  const [status, setStatus] = useState<PremiumStatus>(premiumEnabled ? "locked" : "disabled");
  const [error, setError] = useState<string | null>(null);
  const [premiumCount, setPremiumCount] = useState(getPremiumCount());

  const fetchPremium = useCallback(async (token: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/premium/prompts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const payload = (await res.json()) as PremiumPayload;
    if (!Array.isArray(payload.prompts)) return false;
    mergePremiumPrompts(payload.prompts);
    setPremiumCount(payload.prompts.length);
    return true;
  }, []);

  const activate = useCallback(
    async (licenseKey: string): Promise<boolean> => {
      if (!premiumEnabled) return false;
      setStatus("activating");
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/license/activate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ licenseKey }),
        });
        const data = (await res.json()) as { token?: string; expiresAt?: number; error?: string };
        if (!res.ok || !data.token) {
          setStatus("error");
          setError(data.error ?? "activation_failed");
          return false;
        }
        writeStored({ key: licenseKey, token: data.token, expiresAt: data.expiresAt ?? 0 });
        if (await fetchPremium(data.token)) {
          setStatus("unlocked");
          return true;
        }
        setStatus("error");
        setError("content_unavailable");
        return false;
      } catch {
        setStatus("error");
        setError("network_error");
        return false;
      }
    },
    [fetchPremium],
  );

  const deactivate = useCallback(() => {
    writeStored(null);
    clearPremiumPrompts();
    setPremiumCount(0);
    if (premiumEnabled) setStatus("locked");
  }, []);

  // Silent restore on mount: valid token → fetch; expired token → re-activate
  // with the stored key (a refunded/revoked license fails here and stays locked).
  useEffect(() => {
    if (!premiumEnabled) return;
    const stored = readStored();
    if (!stored) return;
    let cancelled = false;
    (async () => {
      if (stored.expiresAt > Date.now() + 60_000 && (await fetchPremium(stored.token))) {
        if (!cancelled) setStatus("unlocked");
        return;
      }
      if (!cancelled) await activate(stored.key);
    })();
    return () => {
      cancelled = true;
    };
  }, [activate, fetchPremium]);

  return { premiumEnabled, status, error, premiumCount, activate, deactivate };
}
