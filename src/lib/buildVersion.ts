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

export function installBuildVersionWatcher(intervalMs = 5 * 60 * 1000) {
  if (installed) return;
  installed = true;

  const current = getCurrentBuildVersion();
  // If the current page has no build-version tag we cannot compare — skip.
  if (!current) return;

  const check = async () => {
    const latest = await fetchLatestBuildVersion();
    if (latest && latest !== current) {
      // New build is live — hard reload to pick it up.
      // Use replace so users don't see a flash of stale state.
      window.location.reload();
    }
  };

  // Check on focus + interval
  window.addEventListener("focus", check);
  // Initial check after a short delay so first paint isn't disrupted
  window.setTimeout(check, 30 * 1000);
  timer = window.setInterval(check, intervalMs);
}

export function stopBuildVersionWatcher() {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
  installed = false;
}
