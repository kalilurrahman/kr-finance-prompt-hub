// ============================================================
// Download utility for prompts — TXT, HTML, PDF formats
// ============================================================

const SITE_NAME = "KR Financial Prompts Reference";
const AUTHOR = "Kalilur Rahman";
const SITE_URL = "https://kr-finance-prompt-hub.lovable.app";

interface DownloadData {
  title: string;
  content: string;
  category?: string;
  platform?: string;
}

function getFooter() {
  return `\n\n---\nDownloaded from ${SITE_NAME} (${SITE_URL}) by ${AUTHOR}\n© ${new Date().getFullYear()} All Rights Reserved`;
}

export function downloadAsTxt(prompt: DownloadData) {
  const text = `${prompt.title}\n${"=".repeat(prompt.title.length)}\n\nCategory: ${prompt.category || "N/A"}\nPlatform: ${prompt.platform || "N/A"}\n\n${prompt.content}${getFooter()}`;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  triggerDownload(blob, `${slugify(prompt.title)}.txt`);
}

export function downloadAsHtml(prompt: DownloadData) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(prompt.title)}</title>
  <style>
    body { font-family: 'IBM Plex Mono', 'Courier New', monospace; background: #060a0f; color: #e8e0cc; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.8; }
    h1 { color: #ffb800; font-size: 1.4em; border-bottom: 1px solid rgba(255,184,0,0.3); padding-bottom: 12px; }
    .meta { font-size: 0.8em; color: #8a8070; margin-bottom: 24px; }
    .meta span { background: rgba(255,184,0,0.1); border: 1px solid rgba(255,184,0,0.2); padding: 2px 8px; margin-right: 8px; }
    .content { white-space: pre-wrap; font-size: 0.9em; }
    footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid rgba(255,184,0,0.15); font-size: 0.75em; color: #4a4540; text-align: center; }
    footer a { color: #cc9400; }
  </style>
</head>
<body>
  <h1>${escapeHtml(prompt.title)}</h1>
  <div class="meta">
    <span>${escapeHtml(prompt.category || "N/A")}</span>
    <span>${escapeHtml(prompt.platform || "N/A")}</span>
  </div>
  <div class="content">${escapeHtml(prompt.content)}</div>
  <footer>Downloaded from <a href="${SITE_URL}">${SITE_NAME}</a> by ${AUTHOR} &copy; ${new Date().getFullYear()}</footer>
</body>
</html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  triggerDownload(blob, `${slugify(prompt.title)}.html`);
}

export function downloadAsPdf(prompt: DownloadData) {
  // 🛡️ Sentinel enhancement: Use secure Blob URL instead of unsafe window.open("") + document.write()
  // This prevents the new window from retaining a reference to the parent (window.opener)
  // and avoids using document.write() which is a known security risk.
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(prompt.title)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&display=swap');
    body { font-family: 'IBM Plex Mono', monospace; max-width: 700px; margin: 40px auto; padding: 20px; line-height: 1.8; color: #1a1a1a; }
    h1 { font-size: 1.3em; border-bottom: 2px solid #ffb800; padding-bottom: 10px; color: #0a0e14; }
    .meta { font-size: 0.8em; color: #666; margin-bottom: 20px; }
    .meta span { background: #f5f0e8; border: 1px solid #ddd; padding: 2px 8px; margin-right: 8px; border-radius: 3px; }
    .content { white-space: pre-wrap; font-size: 0.85em; }
    footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 0.7em; color: #999; text-align: center; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(prompt.title)}</h1>
  <div class="meta">
    <span>${escapeHtml(prompt.category || "N/A")}</span>
    <span>${escapeHtml(prompt.platform || "N/A")}</span>
  </div>
  <div class="content">${escapeHtml(prompt.content)}</div>
  <footer>Downloaded from ${SITE_NAME} (${SITE_URL}) by ${AUTHOR} &copy; ${new Date().getFullYear()}</footer>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");

  // Clean up the URL object after allowing time for the window to load and print dialog to open
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
