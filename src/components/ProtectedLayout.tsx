import React, { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate, Outlet } from "@tanstack/react-router";
import { useFirebaseAuth } from "@/integrations/firebase";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck, Lock } from "lucide-react";
import { Brand } from "@/features/perfect-property/components/Brand";

interface ProtectedLayoutProps {
  children?: ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedLayout ensures that any route or component rendered within it
 * requires an active session (Firebase Auth, active Supabase session, or demo mode).
 * Unauthenticated users are redirected to the login/auth page with their intended destination preserved.
 */
export function ProtectedLayout({
  children,
  redirectTo = "/auth",
}: ProtectedLayoutProps) {
  const { user, loading } = useFirebaseAuth();
  const [supabaseLoading, setSupabaseLoading] = useState(true);
  const [hasAlternateSession, setHasAlternateSession] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function checkAlternateSession() {
      try {
        if (typeof localStorage !== "undefined" && localStorage.getItem("pp_demo_session")) {
          if (mounted) {
            setHasAlternateSession(true);
            setSupabaseLoading(false);
          }
          return;
        }
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setHasAlternateSession(Boolean(data?.session));
          setSupabaseLoading(false);
        }
      } catch {
        if (mounted) setSupabaseLoading(false);
      }
    }
    checkAlternateSession();
    return () => {
      mounted = false;
    };
  }, []);

  const isChecking = loading || supabaseLoading;
  const isAuthenticated = Boolean(user || hasAlternateSession);

  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      const fullPath =
        location.pathname +
        (location.searchStr && location.searchStr !== "?" ? location.searchStr : "");
      const nextParam = fullPath && fullPath !== "/" ? `?next=${encodeURIComponent(fullPath)}` : "";
      
      navigate({
        to: `${redirectTo}${nextParam}` as any,
        replace: true,
      }).catch(() => {
        // Fallback for hard navigation
        window.location.href = `${redirectTo}${nextParam}`;
      });
    }
  }, [isAuthenticated, isChecking, location, navigate, redirectTo]);

  if (isChecking) {
    return (
      <div className="perfect-property-ui flex min-h-[100dvh] w-full flex-col items-center justify-center bg-pp-page p-6 text-pp-text">
        <div className="relative flex flex-col items-center max-w-sm rounded-xl border border-pp-border bg-pp-surface p-8 text-center shadow-lg">
          <div className="mb-4">
            <Brand id="protected-loading-brand" />
          </div>
          <div className="relative my-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
            <Loader2 className="absolute h-10 w-10 animate-spin text-primary/40" />
          </div>
          <p className="text-sm font-semibold text-pp-text">Verifying secure session...</p>
          <p className="mt-1.5 text-xs text-pp-muted">
            Connecting to authentication and loading credentials.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="perfect-property-ui flex min-h-[100dvh] w-full flex-col items-center justify-center bg-pp-page p-6 text-pp-text">
        <div className="relative flex flex-col items-center max-w-sm rounded-xl border border-pp-border bg-pp-surface p-8 text-center shadow-lg">
          <div className="mb-4">
            <Brand id="protected-auth-brand" />
          </div>
          <div className="my-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <Lock className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-pp-text">Authentication Required</p>
          <p className="mt-1.5 text-xs text-pp-muted">
            Redirecting to sign in to access the institutional property engine...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="perfect-property-ui min-h-[100dvh] bg-pp-page text-pp-text">
      {children || <Outlet />}
    </div>
  );
}

export default ProtectedLayout;
