import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import type { TerminalPrompt } from "@/types/terminal";
import { useTerminalFavorites } from "@/hooks/useTerminalFavorites";

export default function Admin() {
  const { clear: clearFavs } = useTerminalFavorites();
  const [sbUrl, setSbUrl] = useState(() => {
    try { return JSON.parse(localStorage.getItem("finprompt_config") || "{}").url || ""; } catch { return ""; }
  });
  const [sbKey, setSbKey] = useState(() => {
    try { return JSON.parse(localStorage.getItem("finprompt_config") || "{}").key || ""; } catch { return ""; }
  });
  const [logs, setLogs] = useState<{ type: "ok" | "err" | "info" | "dim"; msg: string }[]>([
    { type: "dim", msg: "// Waiting for operation..." },
  ]);
  const [loadedData, setLoadedData] = useState<TerminalPrompt[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const log = useCallback((type: "ok" | "err" | "info" | "dim", msg: string) => {
    setLogs((prev) => [...prev, { type, msg }]);
  }, []);

  const saveConfig = () => {
    localStorage.setItem("finprompt_config", JSON.stringify({ url: sbUrl, key: sbKey }));
    log("ok", "Configuration saved to localStorage");
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setLoadedData(data);
        setFileName(file.name);
        log("ok", `Parsed ${data.length} prompts from "${file.name}"`);
        const cats = [...new Set(data.map((d: TerminalPrompt) => d.category))];
        log("info", `Categories: ${cats.join(", ")}`);
      } catch (err: any) {
        log("err", `JSON parse error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const loadLocal = () => {
    if (!loadedData) return;
    localStorage.setItem("finprompt_cache", JSON.stringify(loadedData));
    log("ok", `${loadedData.length} prompts loaded to local cache`);
  };

  const clearCache = () => {
    if (confirm("Clear all cached prompt data? This will reload from bundled JSON on next visit.")) {
      localStorage.removeItem("finprompt_cache");
      log("info", "Local cache cleared");
    }
  };

  const clearFavorites = () => {
    if (confirm("Clear all favorites? This cannot be undone.")) {
      clearFavs();
      log("info", "All favorites cleared");
    }
  };

  const SQL_SCHEMA = `CREATE TABLE IF NOT EXISTS prompts (
  id          INTEGER PRIMARY KEY,
  title       TEXT NOT NULL,
  category    TEXT,
  prompt_text TEXT,
  tags        TEXT[],
  type        TEXT DEFAULT 'finance',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON prompts USING gin(
  to_tsvector('english', title || ' ' || COALESCE(prompt_text,''))
);
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON prompts FOR SELECT USING (true);`;

  return (
    <div className="terminal">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[90] bg-[rgba(6,10,15,0.97)] border-b border-[var(--t-border-bright)] backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 flex items-center gap-5 h-16">
          <Link to="/library" className="flex items-baseline gap-2 shrink-0 no-underline">
            <span className="font-bold text-lg text-[var(--t-amber)] tracking-[0.05em]" style={{ textShadow: "0 0 20px rgba(255,184,0,0.5)" }}>
              FINPROMPT
            </span>
            <span className="text-sm text-[var(--t-text-muted)]">//</span>
            <span className="text-[10px] text-[var(--t-text-secondary)] tracking-[0.2em] font-medium uppercase">Admin</span>
          </Link>
          <div className="ml-auto">
            <Link
              to="/library"
              className="bg-transparent border border-[var(--t-border)] text-[var(--t-text-secondary)] text-[11px] px-3.5 py-[7px] tracking-[0.1em] uppercase transition-all hover:border-[var(--t-amber)] hover:text-[var(--t-amber)] no-underline"
            >
              ← BACK TO LIBRARY
            </Link>
          </div>
        </div>
      </header>

      <main className="mt-16 p-6 md:p-10 max-w-[1200px] mx-auto">
        {/* Admin Header */}
        <div className="border-b-2 border-[var(--t-amber)] pb-4 mb-8 flex items-center gap-3.5">
          <span className="bg-[var(--t-red)] text-white text-[9px] font-bold tracking-[0.2em] px-2.5 py-1 uppercase">Restricted</span>
          <span className="text-lg text-[var(--t-amber)] font-bold tracking-[0.05em]">Admin Panel // Database Operations</span>
        </div>

        {/* Section 1: Supabase Config */}
        <section className="bg-[var(--t-bg-2)] border border-[var(--t-border)] p-6 mb-5">
          <h2 className="text-[10px] text-[var(--t-amber)] tracking-[0.2em] uppercase mb-4 pb-2.5 border-b border-[var(--t-border)] font-normal">
            Supabase Configuration
          </h2>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] text-[var(--t-text-secondary)] w-[140px] shrink-0">Project URL</span>
            <input
              value={sbUrl}
              onChange={(e) => setSbUrl(e.target.value)}
              placeholder="https://xxxxxxxxxxxx.supabase.co"
              className="flex-1 bg-[var(--t-bg-3)] border border-[var(--t-border)] text-[var(--t-text-primary)] text-xs p-2 px-3 outline-none transition-all focus:border-[var(--t-amber)]"
            />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] text-[var(--t-text-secondary)] w-[140px] shrink-0">Anon/Public Key</span>
            <input
              type="password"
              value={sbKey}
              onChange={(e) => setSbKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="flex-1 bg-[var(--t-bg-3)] border border-[var(--t-border)] text-[var(--t-text-primary)] text-xs p-2 px-3 outline-none transition-all focus:border-[var(--t-amber)]"
            />
          </div>
          <div className="flex gap-2.5 mt-2 flex-wrap">
            <button
              onClick={() => log("info", "Supabase connection requires Lovable Cloud to be enabled.")}
              className="bg-[var(--t-amber)] text-black border-none text-xs font-bold px-7 py-3 cursor-pointer tracking-[0.12em] uppercase transition-all hover:brightness-110"
            >
              CONNECT TO SUPABASE
            </button>
            <button
              onClick={saveConfig}
              className="bg-[var(--t-bg-4)] text-[var(--t-text-secondary)] border border-[var(--t-border)] text-xs px-7 py-3 cursor-pointer tracking-[0.12em] uppercase transition-all hover:border-[var(--t-amber)] hover:text-[var(--t-amber)]"
            >
              SAVE CONFIG
            </button>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-[var(--t-text-muted)] mb-2">
              <strong className="text-[var(--t-amber)]">SQL SCHEMA — run in Supabase SQL Editor:</strong>
            </p>
            <pre className="text-[10px] text-[var(--t-text-secondary)] bg-[var(--t-bg-0)] border border-[var(--t-border)] p-3 overflow-x-auto whitespace-pre">
              {SQL_SCHEMA}
            </pre>
          </div>
        </section>

        {/* Section 2: Import */}
        <section className="bg-[var(--t-bg-2)] border border-[var(--t-border)] p-6 mb-5">
          <h2 className="text-[10px] text-[var(--t-amber)] tracking-[0.2em] uppercase mb-4 pb-2.5 border-b border-[var(--t-border)] font-normal">
            Import Prompts from JSON
          </h2>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed p-8 text-center cursor-pointer transition-all text-xs ${
              dragOver
                ? "border-[var(--t-amber)] text-[var(--t-amber)] bg-[var(--t-amber-glow)]"
                : "border-[var(--t-border)] text-[var(--t-text-muted)] hover:border-[var(--t-amber)] hover:text-[var(--t-amber)]"
            }`}
          >
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <div className="text-2xl mb-2 opacity-50">📂</div>
            <div>Drop <strong className="text-[var(--t-text-primary)]">prompts_library.json</strong> here or click to browse</div>
            <div className="mt-1.5 text-[10px] text-[var(--t-text-muted)]">Supports the 500-prompt structured JSON format</div>
          </div>
          <div className="flex gap-2.5 mt-3 flex-wrap items-center">
            <button
              disabled={!loadedData}
              onClick={() => log("info", "Supabase upsert requires Lovable Cloud to be enabled.")}
              className="bg-[var(--t-amber)] text-black border-none text-xs font-bold px-7 py-3 cursor-pointer tracking-[0.12em] uppercase transition-all hover:brightness-110 disabled:bg-[var(--t-text-muted)] disabled:cursor-not-allowed"
            >
              UPSERT TO SUPABASE
            </button>
            <button
              disabled={!loadedData}
              onClick={loadLocal}
              className="bg-[var(--t-green)] text-black border-none text-xs font-bold px-7 py-3 cursor-pointer tracking-[0.12em] uppercase transition-all hover:brightness-110 disabled:bg-[var(--t-text-muted)] disabled:cursor-not-allowed"
            >
              LOAD LOCAL
            </button>
            <span className={`text-[10px] ${loadedData ? "text-[var(--t-green)]" : "text-[var(--t-text-muted)]"}`}>
              {loadedData ? `✓ ${fileName} — ${loadedData.length} records` : "No file loaded"}
            </span>
          </div>
          {importing && (
            <div className="bg-[var(--t-bg-0)] border border-[var(--t-border)] h-5 mt-3 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-[var(--t-amber-dim)] to-[var(--t-amber)] transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-black">
                {progress}%
              </div>
            </div>
          )}
          {/* Log */}
          <div className="mt-4 bg-[var(--t-bg-0)] border border-[var(--t-border)] p-4 text-[11px] text-[var(--t-text-secondary)] min-h-[80px] max-h-[300px] overflow-y-auto leading-[1.8]">
            {logs.map((l, i) => (
              <div key={i} className={
                l.type === "ok" ? "text-[var(--t-green)]" :
                l.type === "err" ? "text-[var(--t-red)]" :
                l.type === "info" ? "text-[var(--t-amber)]" :
                "text-[var(--t-text-muted)]"
              }>
                {l.type === "ok" ? "[OK] " : l.type === "err" ? "[ERR] " : l.type === "info" ? "[→] " : ""}{l.msg}
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Danger Zone */}
        <section className="bg-[var(--t-bg-2)] border border-[var(--t-border)] p-6">
          <h2 className="text-[10px] text-[var(--t-red)] tracking-[0.2em] uppercase mb-4 pb-2.5 border-b border-[var(--t-border)] font-normal">
            Danger Zone
          </h2>
          <p className="text-[11px] text-[var(--t-text-muted)] mb-3.5">These operations are irreversible.</p>
          <div className="flex gap-2.5 flex-wrap">
            <button
              onClick={clearFavorites}
              className="bg-[var(--t-red)] text-white border-none text-xs font-bold px-7 py-3 cursor-pointer tracking-[0.12em] uppercase transition-all hover:brightness-125"
            >
              CLEAR ALL FAVORITES
            </button>
            <button
              onClick={clearCache}
              className="bg-[var(--t-red)] text-white border-none text-xs font-bold px-7 py-3 cursor-pointer tracking-[0.12em] uppercase transition-all hover:brightness-125"
            >
              CLEAR LOCAL CACHE
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
