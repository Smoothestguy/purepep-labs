"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

/**
 * Client-side view of who's signed in.
 *
 * Mounted once at the root so the header, the price gates, and the buy
 * buttons all read the same session and react to sign-in/sign-out together
 * — previously each component opened its own Supabase subscription, which
 * meant N listeners and components that could disagree mid-transition.
 *
 * This is presentation only. It decides what the browser draws, never what
 * the server permits: purchasing is gated again in POST /api/checkout,
 * where the JWT is actually revalidated.
 */
type AuthState = {
  user: User | null;
  /** True until the first session lookup resolves. */
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ user: null, loading: true });

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

/** Convenience for the common "is this person allowed to see prices" check. */
export function useSignedIn(): { signedIn: boolean; loading: boolean } {
  const { user, loading } = useAuth();
  return { signedIn: Boolean(user), loading };
}

/**
 * Whether Supabase is provisioned at all. Read once at module scope: when
 * it's missing there is no session to wait for, so we can start in the
 * resolved signed-out state instead of ever flipping `loading`.
 */
const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: SUPABASE_CONFIGURED,
  });

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return;

    let active = true;
    let unsubscribe: (() => void) | undefined;

    // Wrapped in an async IIFE so every setState lands in a callback or
    // after an await, never synchronously in the effect body.
    void (async () => {
      try {
        const supabase = createClient();

        // Subscribe before the first lookup so a sign-in that happens
        // while getUser is in flight isn't missed.
        const { data: sub } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            if (!active) return;
            setState({ user: session?.user ?? null, loading: false });
          },
        );
        unsubscribe = () => sub.subscription.unsubscribe();

        const { data } = await supabase.auth.getUser();
        if (!active) return;
        setState({ user: data.user ?? null, loading: false });
      } catch {
        // Misconfigured or unreachable — fall back to signed-out rather
        // than leaving the whole tree stuck in a loading state.
        if (!active) return;
        setState({ user: null, loading: false });
      }
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
