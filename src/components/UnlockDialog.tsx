import { useState } from "react";
import { KeyRound, Crown, Check, LoaderCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePremium } from "@/hooks/usePremium";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_key: "That license key isn't valid for FinPrompt Pro. Check your receipt email.",
  refunded: "This purchase was refunded, so the license is no longer active.",
  chargebacked: "This license was deactivated after a payment dispute.",
  disputed: "This license is suspended while a payment dispute is open.",
  subscription_inactive: "This membership has lapsed — renew to restore access.",
  activation_limit: "This key has reached its device limit. Contact support to reset it.",
  revoked: "This license has been revoked. Contact support if you think this is a mistake.",
  verifier_unavailable: "The license service is temporarily unreachable — try again in a minute.",
  content_unavailable: "Verified, but premium content couldn't be loaded. Try again shortly.",
  network_error: "Network error — check your connection and try again.",
};

/**
 * License-key entry for FinPrompt Pro. Rendered only when premium is enabled
 * (VITE_PREMIUM_API_URL set), so the free site is untouched by default.
 */
export function UnlockDialog() {
  const { status, error, premiumCount, activate, deactivate } = usePremium();
  const [key, setKey] = useState("");
  const [open, setOpen] = useState(false);

  const unlocked = status === "unlocked";
  const busy = status === "activating";

  const submit = async () => {
    if (!key.trim() || busy) return;
    if (await activate(key.trim())) setKey("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 shrink-0 gap-1.5 border-gold/40 text-gold hover:bg-gold/10 hover:text-gold"
          aria-label={unlocked ? "FinPrompt Pro unlocked" : "Unlock FinPrompt Pro"}
        >
          {unlocked ? <Check className="h-3.5 w-3.5" /> : <Crown className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline text-xs font-semibold">PRO</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Crown className="h-4 w-4 text-gold" />
            FinPrompt Pro
          </DialogTitle>
          <DialogDescription>
            {unlocked
              ? `Unlocked — ${premiumCount} Pro prompts are live in your library on this device.`
              : "Enter the license key from your purchase receipt to unlock the Pro library."}
          </DialogDescription>
        </DialogHeader>

        {unlocked ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Access renews silently. Unlocking a different device counts toward your device limit.
            </p>
            <Button variant="outline" size="sm" onClick={deactivate}>
              Deactivate
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
                aria-label="License key"
                className="pl-9 font-mono text-sm"
                autoComplete="off"
                spellCheck={false}
                disabled={busy}
              />
            </div>
            {status === "error" && error && (
              <p className="text-sm text-destructive" role="alert">
                {ERROR_MESSAGES[error] ?? "Activation failed — please try again."}
              </p>
            )}
            <Button className="w-full bg-gold hover:bg-gold/90 text-primary-foreground" onClick={submit} disabled={busy || !key.trim()}>
              {busy ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" /> Verifying…
                </>
              ) : (
                "Unlock Pro"
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Your key is verified server-side and never stored anywhere except this browser.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
