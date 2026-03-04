// ============================================================
// ThemeSwitcher — horizontal pill buttons (Dark/Light/Sepia/Midnight style)
// ============================================================

import { useTheme, THEMES, type ThemeId } from '../contexts/ThemeContext';

interface Props {
  variant?: 'icon' | 'full' | 'pills';
  className?: string;
}

export function ThemeSwitcher({ variant = 'icon', className = '' }: Props) {
  const { theme, setTheme } = useTheme();

  // Pills variant — horizontal buttons like portfolio site
  if (variant === 'pills' || variant === 'full') {
    return (
      <div className={`flex items-center gap-0.5 rounded-lg border border-border/50 bg-secondary/30 p-0.5 ${className}`}>
        {THEMES.map(t => {
          const isActive = t.id === theme.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id as ThemeId)}
              title={t.description}
              className={`px-3 py-1 text-[11px] font-medium tracking-wide rounded-md transition-all duration-150 ${
                isActive
                  ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-secondary/50'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Icon variant — compact single button with dropdown
  return (
    <div className={`relative inline-block ${className}`}>
      <ThemeDropdown theme={theme} setTheme={setTheme} />
    </div>
  );
}

function ThemeDropdown({ theme, setTheme }: { theme: typeof THEMES[0]; setTheme: (id: ThemeId) => void }) {
  const [open, setOpen] = __import_useState(false);
  const containerRef = __import_useRef<HTMLDivElement>(null);

  __import_useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  __import_useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title="Change theme"
        aria-label="Change display theme"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] tracking-wider uppercase border rounded-md transition-all cursor-pointer ${
          open
            ? 'border-[var(--border-bright,hsl(var(--border)))] text-[var(--accent,hsl(var(--primary)))]'
            : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
        }`}
      >
        <span className="text-sm leading-none">{theme.emoji}</span>
        <span className="text-[8px] opacity-50">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[200px] bg-card border border-border rounded-lg shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-border/50 text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
            Theme
          </div>
          {THEMES.map(t => {
            const isActive = t.id === theme.id;
            return (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id as ThemeId); setOpen(false); }}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-left text-xs cursor-pointer transition-all border-l-2 ${
                  isActive
                    ? 'border-l-[var(--accent,hsl(var(--primary)))] bg-secondary/80 text-foreground font-semibold'
                    : 'border-l-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <span className="text-sm">{t.emoji}</span>
                <span className="flex-1">
                  <span className="block">{t.label}</span>
                  <span className="block text-[9px] text-muted-foreground/70 mt-0.5">{t.description}</span>
                </span>
                {isActive && <span className="text-[var(--accent,hsl(var(--primary)))]">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// React hooks — imported at module level to avoid issues
import { useState as __import_useState, useEffect as __import_useEffect, useRef as __import_useRef } from 'react';

export default ThemeSwitcher;
