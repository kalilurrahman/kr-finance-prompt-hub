let cleanupStarted = false;

async function runCleanup() {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(registrations.map((registration) => registration.unregister()));
  }

  if ("caches" in window) {
    const cacheKeys = await caches.keys();
    await Promise.allSettled(cacheKeys.map((key) => caches.delete(key)));
  }
}

export function cleanupStaleDeployArtifacts() {
  if (cleanupStarted || typeof window === "undefined") {
    return;
  }

  cleanupStarted = true;

  const startCleanup = () => {
    void runCleanup();
  };

  if (document.readyState === "complete") {
    startCleanup();
    return;
  }

  window.addEventListener("load", startCleanup, { once: true });
}
