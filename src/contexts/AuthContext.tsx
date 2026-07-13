// ============================================================
// FINPROMPT — AuthContext.tsx  (optional OAuth via Supabase Auth)
//
// Provides session state + OAuth sign-in/out. When Supabase is not configured
// (`isSupabaseEnabled === false`), this is inert: enabled=false, user=null, and
// the sign-in/out actions are no-ops — the app is unchanged.
// ============================================================
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseEnabled } from '../lib/supabase';

export type OAuthProvider = 'google' | 'github';

interface AuthContextValue {
  /** Whether Supabase auth is configured/available. */
  enabled: boolean;
  loading: boolean;
  user: User | null;
  session: Session | null;
  signIn: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  // Only "loading" when we actually have a client to query.
  const [loading, setLoading] = useState<boolean>(isSupabaseEnabled);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (provider: OAuthProvider) => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        enabled: isSupabaseEnabled,
        loading,
        user: session?.user ?? null,
        session,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
