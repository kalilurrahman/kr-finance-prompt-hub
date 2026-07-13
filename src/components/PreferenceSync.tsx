// ============================================================
// FINPROMPT — PreferenceSync.tsx
//
// Bridges Auth ↔ Theme. When a user is signed in:
//   • on sign-in, load their saved theme/font from `user_preferences`
//     (cloud wins); if they have no row yet, seed it from current local prefs.
//   • whenever they change theme/font locally, upsert it (debounced).
// Renders nothing. Inert when Supabase auth is disabled.
// ============================================================
import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, THEMES, FONTS } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

export function PreferenceSync() {
  const { enabled, user } = useAuth();
  const { theme, font, setTheme, setFont } = useTheme();
  const applyingRemote = useRef(false);
  const loadedFor = useRef<string | null>(null);

  // --- Load on sign-in (cloud wins) ---
  useEffect(() => {
    if (!enabled || !supabase || !user) {
      loadedFor.current = null;
      return;
    }
    if (loadedFor.current === user.id) return;

    let active = true;
    (async () => {
      const { data, error } = await supabase!
        .from('user_preferences')
        .select('theme,font')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!active) return;
      loadedFor.current = user.id;

      const validTheme = data?.theme && THEMES.some((t) => t.id === data.theme);
      const validFont = data?.font && FONTS.some((f) => f.id === data.font);

      if (error || (!validTheme && !validFont)) {
        // No usable row yet → seed the cloud from the current local prefs.
        await supabase!
          .from('user_preferences')
          .upsert({ user_id: user.id, theme: theme.id, font: font.id, updated_at: new Date().toISOString() });
        return;
      }
      // Apply cloud prefs without triggering a write-back.
      applyingRemote.current = true;
      if (validTheme) setTheme(data!.theme);
      if (validFont) setFont(data!.font);
      // Release the guard after the resulting state updates flush.
      setTimeout(() => {
        applyingRemote.current = false;
      }, 0);
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, user?.id]);

  // --- Persist on local change (debounced) ---
  useEffect(() => {
    if (!enabled || !supabase || !user) return;
    if (loadedFor.current !== user.id) return; // wait for the initial load
    if (applyingRemote.current) return; // don't echo a cloud-applied change back
    const t = setTimeout(() => {
      supabase!
        .from('user_preferences')
        .upsert({ user_id: user.id, theme: theme.id, font: font.id, updated_at: new Date().toISOString() });
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.id, font.id, enabled, user?.id]);

  return null;
}
