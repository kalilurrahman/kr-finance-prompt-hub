/**
 * Build-version detector. Periodically polls the deployed index.html for the
 * `<meta name="build-version">` tag and prompts a hard reload when the value
 * differs from the version embedded in the currently loaded JS bundle.
 *
 * No service worker / cache overhaul — just a lightweight network check.
 */

// Read the version embedded at build time (set in index.html by Lovable's deploy)
function getCurrentBuildVersion(): string | null {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="build-version"]');
  return meta?.content?.trim() || null;
}

async function fetchLatestBuildVersion(): Promise<string | null> {
  try {
    // Cache-busted fetch of index.html
    const res = await fetch(`/index.html?_=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/<meta[^>]+name=["']build-version["'][^>]+content=["']([^"']+)["']/i);
    return match?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
}

let timer: number | null = null;
let installed = false;

export function installBuildVersionWatcher(intervalMs = 20 * 1000) {
  if (installed) return;
  installed = true;

  const current = getCurrentBuildVersion();
  if (!current || current === "__BUILD_VERSION__") return;

  const reloadHard = async () => {
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.allSettled(keys.map((k) => caches.delete(k)));
      }
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.allSettled(regs.map((r) => r.unregister()));
      }
    } catch {
      // ignore
    }
    window.location.reload();
  };

  const check = async () => {
    const latest = await fetchLatestBuildVersion();
    if (!latest) return;
    if (latest === "__BUILD_VERSION__") return;
    if (latest !== current) {
      void reloadHard();
    }
  };

  window.addEventListener("focus", check);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void check();
  });
  window.setTimeout(check, 2 * 1000);
  timer = window.setInterval(check, intervalMs);
}

export function stopBuildVersionWatcher() {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
  installed = false;
}
