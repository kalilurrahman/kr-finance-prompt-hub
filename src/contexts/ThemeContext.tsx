// ============================================================
// FINPROMPT — ThemeContext.tsx
// Path: src/contexts/ThemeContext.tsx
// ============================================================

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId = 'terminal' | 'matrix' | 'arctic' | 'crimson' | 'slate';

export interface Theme {
  id: ThemeId;
  label: string;
  emoji: string;
  description: string;
  isDark: boolean;
}

export const THEMES: Theme[] = [
  { id: 'terminal', label: 'Bloomberg Terminal', emoji: '🟡', description: 'Dark amber — the classic',    isDark: true  },
  { id: 'matrix',   label: 'Midnight Matrix',    emoji: '🟢', description: 'Deep green on black',        isDark: true  },
  { id: 'arctic',   label: 'Arctic',             emoji: '🔵', description: 'Clean light — blue white',   isDark: false },
  { id: 'crimson',  label: 'Crimson',            emoji: '🔴', description: 'Dark red — executive',       isDark: true  },
  { id: 'slate',    label: 'Slate',              emoji: '⚫', description: 'GitHub-style neutral dark',  isDark: true  },
];

const STORAGE_KEY = 'finprompt_theme';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (id: ThemeId) => void;
  themes: Theme[];
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId);
    const isDark = THEMES.find(t => t.id === themeId)?.isDark ?? true;
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    // Also toggle Tailwind dark class for any components using dark: variants
    document.documentElement.classList.toggle('dark', isDark);
  }, [themeId]);

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* ignore */ }
  };

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
