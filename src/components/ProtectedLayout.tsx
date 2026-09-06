import React, { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate, Outlet } from "@tanstack/react-router";
import { useFirebaseAuth } from "@/integrations/firebase";
import { Loader2, ShieldCheck, Lock } from "lucide-react";
import { Brand } from "@/features/perfect-property/components/Brand";

interface ProtectedLayoutProps {
  children?: ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedLayout ensures that any route or component rendered within it
 * requires an active Firebase Authentication session.
 * Unauthenticated users are redirected to the login/auth page with their intended destination preserved.
 */
export function ProtectedLayout({
  children,
  redirectTo = "/auth",
}: ProtectedLayoutProps) {
  const { user, loading } = useFirebaseAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
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
  }, [user, loading, location, navigate, redirectTo]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] w-full flex-col items-center justify-center p-6 text-pp-text">
        <div className="relative flex flex-col items-center max-w-sm rounded-xl border border-pp-border/80 bg-pp-page/90 p-8 text-center shadow-2xl backdrop-blur-md">
          <div className="mb-4">
            <Brand id="protected-loading-brand" />
          </div>
          <div className="relative my-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
            <ShieldCheck className="h-6 w-6" />
            <Loader2 className="absolute h-10 w-10 animate-spin text-amber-400/40" />
          </div>
          <p className="text-sm font-medium text-pp-text">Verifying secure session...</p>
          <p className="mt-1 text-xs text-pp-muted">
            Connecting to Firebase Authentication and loading access credentials.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[70vh] w-full flex-col items-center justify-center p-6 text-pp-text">
        <div className="relative flex flex-col items-center max-w-sm rounded-xl border border-pp-border/80 bg-pp-page/90 p-8 text-center shadow-2xl backdrop-blur-md">
          <div className="mb-4">
            <Brand id="protected-auth-brand" />
          </div>
          <div className="my-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <Lock className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-pp-text">Authentication Required</p>
          <p className="mt-1 text-xs text-pp-muted">
            Redirecting to sign in to access the institutional property engine...
          </p>
        </div>
      </div>
    );
  }

  return <>{children || <Outlet />}</>;
}

export default ProtectedLayout;
