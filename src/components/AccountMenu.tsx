// ============================================================
// AccountMenu — optional sign-in / account popover (Supabase OAuth)
//
// Renders nothing unless Supabase auth is configured. Signed out → a compact
// sign-in popover (Google / GitHub). Signed in → avatar + email + sign out.
// ============================================================
import { useEffect, useRef, useState } from 'react';
import { LogIn, LogOut, Github, Cloud, Loader2 } from 'lucide-react';
import { useAuth, type OAuthProvider } from '../contexts/AuthContext';

interface Props {
  className?: string;
}

export function AccountMenu({ className = '' }: Props) {
  const { enabled, loading, user, signIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<OAuthProvider | 'out' | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Feature is off unless configured — keep the header exactly as before.
  if (!enabled) return null;

  const avatarUrl = (user?.user_metadata?.avatar_url as string | undefined) ?? undefined;
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email ??
    'Account';
  const initial = (displayName || 'A').trim().charAt(0).toUpperCase();

  async function handleSignIn(provider: OAuthProvider) {
    setBusy(provider);
    try {
      await signIn(provider); // redirects away
    } finally {
      setBusy(null);
    }
  }

  async function handleSignOut() {
    setBusy('out');
    try {
      await signOut();
      setOpen(false);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={user ? displayName : 'Sign in'}
        aria-label={user ? 'Account menu' : 'Sign in'}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          open
            ? 'border-primary/50 bg-secondary/60 text-primary'
            : 'border-border/60 text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
        }`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : user ? (
          avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-gold text-xs font-bold text-primary-foreground">
              {initial}
            </span>
          )
        ) : (
          <LogIn className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[248px] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-2xl animate-fade-in-up"
        >
          {user ? (
            <>
              <div className="flex items-center gap-2.5 border-b border-border/60 px-3 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold text-xs font-bold text-primary-foreground">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    initial
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-foreground">{displayName}</span>
                  {user.email && <span className="block truncate text-[10px] text-muted-foreground">{user.email}</span>}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 text-[11px] text-muted-foreground">
                <Cloud className="h-3.5 w-3.5 text-success" />
                Theme &amp; font sync <span className="font-semibold text-foreground">on</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={busy === 'out'}
                className="flex w-full items-center gap-2 border-t border-border/60 px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground disabled:opacity-60"
              >
                {busy === 'out' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                Sign out
              </button>
            </>
          ) : (
            <>
              <div className="border-b border-border/60 px-3 py-2.5">
                <p className="text-xs font-semibold text-foreground">Sign in</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Sync your theme &amp; font across devices.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSignIn('google')}
                disabled={busy !== null}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs text-foreground transition-colors hover:bg-secondary/60 disabled:opacity-60"
              >
                {busy === 'google' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#4285F4]">
                    G
                  </span>
                )}
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => handleSignIn('github')}
                disabled={busy !== null}
                className="flex w-full items-center gap-2.5 border-t border-border/60 px-3 py-2.5 text-left text-xs text-foreground transition-colors hover:bg-secondary/60 disabled:opacity-60"
              >
                {busy === 'github' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
                Continue with GitHub
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AccountMenu;
