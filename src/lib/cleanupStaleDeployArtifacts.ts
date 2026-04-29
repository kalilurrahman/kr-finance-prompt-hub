// Eagerly removes any leftover service workers and Cache Storage entries from
// previous app versions. If anything was actually removed, we hard-reload once
// so the user immediately gets the fresh bundles instead of staying on the
// stale, SW-intercepted ones that already loaded for this page view.

const RELOAD_FLAG = "kr-cache-reloaded";

let cleanupStarted = false;

async function runCleanup(): Promise<boolean> {
  let removedSomething = false;

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length > 0) {
      removedSomething = true;
      await Promise.allSettled(registrations.map((r) => r.unregister()));
    }
  }

  if ("caches" in window) {
    const cacheKeys = await caches.keys();
    if (cacheKeys.length > 0) {
      removedSomething = true;
      await Promise.allSettled(cacheKeys.map((key) => caches.delete(key)));
    }
  }

  return removedSomething;
}

export function cleanupStaleDeployArtifacts() {
  if (cleanupStarted || typeof window === "undefined") {
    return;
  }
  cleanupStarted = true;

  const startCleanup = () => {
    void runCleanup().then((removed) => {
      if (!removed) return;
      // Avoid an infinite reload loop: only reload once per page load.
      try {
        if (sessionStorage.getItem(RELOAD_FLAG) === "1") return;
        sessionStorage.setItem(RELOAD_FLAG, "1");
      } catch {
        // sessionStorage unavailable — skip the guard but still reload once.
      }
      window.location.reload();
    });
  };

  // Clear the reload guard for the next navigation so future stale deploys
  // can still trigger one reload.
  window.addEventListener("pagehide", () => {
    try {
      sessionStorage.removeItem(RELOAD_FLAG);
    } catch {
      // ignore
    }
  });

  if (document.readyState === "complete") {
    startCleanup();
    return;
  }

  window.addEventListener("load", startCleanup, { once: true });
}
