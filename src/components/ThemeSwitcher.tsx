// ============================================================
// FINPROMPT — ThemeSwitcher.tsx
// Path: src/components/ThemeSwitcher.tsx
// Usage: <ThemeSwitcher /> — drop into any header/nav
// Deps: ThemeContext, no extra packages needed
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { useTheme, THEMES, type ThemeId } from '../contexts/ThemeContext';

interface Props {
  /** 'icon' shows only emoji + chevron; 'full' shows label too */
  variant?: 'icon' | 'full';
  className?: string;
}

export function ThemeSwitcher({ variant = 'icon', className = '' }: Props) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>

      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Change theme"
        aria-label="Change display theme"
        aria-expanded={open}
        aria-haspopup="listbox"
        className={[
          'flex items-center gap-1.5 px-3 py-1.5',
          'font-mono text-[11px] tracking-widest uppercase',
          'border transition-all duration-150',
          'cursor-pointer select-none',
          open
            ? 'border-[var(--border-bright)] text-[var(--accent)] bg-[var(--accent-glow)]'
            : 'border-[var(--border)] text-[var(--text-secondary)] bg-transparent hover:border-[var(--border-bright)] hover:text-[var(--accent)]',
        ].join(' ')}
      >
        <span className="text-sm leading-none">{theme.emoji}</span>
        {variant === 'full' && <span className="hidden sm:inline">{theme.label}</span>}
        <span className="text-[8px] opacity-50">{open ? '▲' : '▼'}</span>
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div
          role="listbox"
          aria-label="Select theme"
          className={[
            'absolute right-0 top-[calc(100%+6px)] z-50',
            'min-w-[220px]',
            'bg-[var(--bg-3)] border border-[var(--border-bright)]',
            'shadow-[0_12px_40px_rgba(0,0,0,0.5)]',
            'animate-[themeDropIn_0.15s_ease]',
          ].join(' ')}
        >
          {/* Header row */}
          <div className="px-3.5 py-2 border-b border-[var(--border)] font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--text-muted)]">
            Background Theme
          </div>

          {/* Options */}
          {THEMES.map(t => {
            const isActive = t.id === theme.id;
            return (
              <button
                key={t.id}
                role="option"
                aria-selected={isActive}
                onClick={() => { setTheme(t.id as ThemeId); setOpen(false); }}
                className={[
                  'flex items-center gap-2.5 w-full px-3.5 py-2.5 text-left',
                  'font-mono text-[11px] cursor-pointer transition-all duration-100',
                  'border-l-2',
                  isActive
                    ? 'border-l-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent)]'
                    : 'border-l-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-4)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                <span className="text-sm leading-none flex-shrink-0">{t.emoji}</span>
                <span className="flex-1 min-w-0">
                  <span className={`block ${isActive ? 'font-bold' : 'font-normal'}`}>
                    {t.label}
                  </span>
                  <span className="block text-[9px] text-[var(--text-muted)] tracking-[0.08em] mt-0.5">
                    {t.description}
                  </span>
                </span>
                {isActive && (
                  <span className="text-[var(--accent)] text-xs flex-shrink-0">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Keyframe — injected once, Tailwind can't do named custom animations inline */}
      <style>{`
        @keyframes themeDropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default ThemeSwitcher;
