// ============================================================
// FINPROMPT — ThemeContext.tsx
// Path: src/contexts/ThemeContext.tsx
// ============================================================

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId =
  | 'terminal' | 'matrix' | 'arctic' | 'crimson' | 'slate'
  | 'kr-gold' | 'kr-financial-slate' | 'kr-forest' | 'kr-sunset' | 'kr-mono'
  | 'parchment' | 'kr-ivory' | 'daybreak' | 'solarized-light'
  | 'nord' | 'dracula';

export type FontId = 'system' | 'serif' | 'mono' | 'kr' | 'grotesk' | 'plex' | 'reading';
export type Mode = 'dark' | 'light';

export interface Theme {
  id: ThemeId;
  label: string;
  emoji: string;
  description: string;
  isDark: boolean;
}

export interface FontOption {
  id: FontId;
  label: string;
  description: string;
  /** CSS font-family stack */
  stack: string;
}

export const THEMES: Theme[] = [
  { id: 'terminal',           label: 'Bloomberg Terminal', emoji: '🟡', description: 'Dark amber — the classic',    isDark: true  },
  { id: 'matrix',             label: 'Midnight Matrix',    emoji: '🟢', description: 'Deep green on black',         isDark: true  },
  { id: 'crimson',            label: 'Crimson',            emoji: '🔴', description: 'Dark red — executive',        isDark: true  },
  { id: 'slate',              label: 'Slate',              emoji: '⚫', description: 'GitHub-style neutral dark',   isDark: true  },
  { id: 'kr-gold',            label: 'KR Gold',            emoji: '🥇', description: 'KR Tools — gold on midnight', isDark: true  },
  { id: 'kr-financial-slate', label: 'KR Financial Slate', emoji: '🟦', description: 'KR Tools — blue slate',       isDark: true  },
  { id: 'kr-forest',          label: 'KR Forest',          emoji: '🌲', description: 'KR Tools — emerald forest',   isDark: true  },
  { id: 'kr-sunset',          label: 'KR Sunset',          emoji: '🌅', description: 'KR Tools — orange sunset',    isDark: true  },
  { id: 'kr-mono',            label: 'KR Mono',            emoji: '◾', description: 'KR Tools — monochrome',       isDark: true  },
  // Light palettes
  { id: 'arctic',             label: 'Arctic',             emoji: '🔵', description: 'Clean light — blue white',    isDark: false },
  { id: 'kr-ivory',           label: 'KR Ivory',           emoji: '🤍', description: 'KR light — ivory & gold',     isDark: false },
  { id: 'parchment',          label: 'Parchment',          emoji: '📜', description: 'Warm sepia — editorial',      isDark: false },
  { id: 'daybreak',           label: 'Daybreak',           emoji: '🌤️', description: 'Soft neutral — indigo',       isDark: false },
  { id: 'solarized-light',    label: 'Solarized Light',    emoji: '☀️', description: 'Classic warm light',          isDark: false },
  // More dark palettes
  { id: 'nord',               label: 'Nord',               emoji: '❄️', description: 'Arctic blue-grey dark',       isDark: true  },
  { id: 'dracula',            label: 'Dracula',            emoji: '🧛', description: 'Purple night',                isDark: true  },
];

export const FONTS: FontOption[] = [
  { id: 'system',  label: 'System Sans',   description: 'Inter / system UI',             stack: "'Inter', system-ui, -apple-system, sans-serif" },
  { id: 'grotesk', label: 'Geometric',     description: 'Space Grotesk — modern display', stack: "'Space Grotesk', 'Inter', system-ui, sans-serif" },
  { id: 'plex',    label: 'Technical',     description: 'IBM Plex Sans — humanist',       stack: "'IBM Plex Sans', system-ui, sans-serif" },
  { id: 'kr',      label: 'KR Tools',      description: 'DM Sans — clean & warm',         stack: "'DM Sans', system-ui, sans-serif" },
  { id: 'serif',   label: 'Editorial',     description: 'Cormorant Garamond serif',       stack: "'Cormorant Garamond', Georgia, serif" },
  { id: 'reading', label: 'Reading Serif', description: 'Lora — comfortable long-form',   stack: "'Lora', Georgia, serif" },
  { id: 'mono',    label: 'Terminal Mono', description: 'JetBrains Mono — code-style',     stack: "'JetBrains Mono', Menlo, Consolas, monospace" },
];

const STORAGE_KEY = 'finprompt_theme';
const FONT_STORAGE_KEY = 'finprompt_font';
const MODE_STORAGE_KEY = 'finprompt_mode';

/** Pair a (theme, mode) — picks the closest theme matching desired light/dark. */
const DARK_DEFAULT: ThemeId = 'terminal';
const LIGHT_DEFAULT: ThemeId = 'arctic';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (id: ThemeId) => void;
  themes: Theme[];
  font: FontOption;
  setFont: (id: FontId) => void;
  fonts: FontOption[];
  mode: Mode;
  toggleMode: () => void;
  setMode: (m: Mode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeId;
      return THEMES.find(t => t.id === stored) ? stored : 'terminal';
    } catch {
      return 'terminal';
    }
  });

  const [fontId, setFontId] = useState<FontId>(() => {
    try {
      const stored = localStorage.getItem(FONT_STORAGE_KEY) as FontId;
      return FONTS.find(f => f.id === stored) ? stored : 'system';
    } catch {
      return 'system';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId);
    const isDark = THEMES.find(t => t.id === themeId)?.isDark ?? true;
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', isDark);
  }, [themeId]);

  useEffect(() => {
    const f = FONTS.find(x => x.id === fontId) ?? FONTS[0];
    document.documentElement.style.setProperty('--font-app', f.stack);
    document.documentElement.setAttribute('data-font', fontId);
  }, [fontId]);

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* ignore */ }
    const isDark = THEMES.find(t => t.id === id)?.isDark ?? true;
    try { localStorage.setItem(MODE_STORAGE_KEY, isDark ? 'dark' : 'light'); } catch { /* ignore */ }
  };

  const setFont = (id: FontId) => {
    setFontId(id);
    try { localStorage.setItem(FONT_STORAGE_KEY, id); } catch { /* ignore */ }
  };

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];
  const font = FONTS.find(f => f.id === fontId) ?? FONTS[0];
  const mode: Mode = theme.isDark ? 'dark' : 'light';

  const setMode = (m: Mode) => {
    if (m === mode) return;
    // Find a theme matching the requested mode; prefer staying within "kr-" family if user is on one.
    const isKr = themeId.startsWith('kr-');
    const candidates = THEMES.filter(t => t.isDark === (m === 'dark'));
    const krMatch = candidates.find(t => t.id.startsWith('kr-'));
    const next =
      (m === 'dark' && isKr && krMatch) ? krMatch.id :
      (m === 'dark' ? DARK_DEFAULT : LIGHT_DEFAULT);
    setTheme(next);
  };

  const toggleMode = () => setMode(mode === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider
      value={{
        theme, setTheme, themes: THEMES,
        font, setFont, fonts: FONTS,
        mode, toggleMode, setMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
