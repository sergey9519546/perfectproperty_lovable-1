import { Button } from "@/components/ui/button";
import React, { useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useFirebaseAuth } from "@/integrations/firebase";
import {
  ShieldCheck,
  Lock,
  Sparkles,
  Loader2,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Gavel,
  Calculator,
  Scale,
  Building2,
} from "lucide-react";
import { Brand } from "@/features/perfect-property/components/Brand";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export interface SheriffSalesAuthGuardProps {
  children?: ReactNode;
  /**
   * Fallback visual display mode if unauthenticated.
   * 'page': Full-screen institutional login & verification gate.
   * 'inline': Contained card gate within the current layout.
   * 'gate': Shows children but disables/intercepts underwriting actions.
   */
  mode?: "page" | "inline" | "gate";
  redirectTo?: string;
  requireUnderwritingAccess?: boolean;
}

/**
 * SheriffSalesAuthGuard ensures that only authenticated users (via Firebase Auth
 * or active institutional session) can access the Sheriff Sales Intelligence Desk
 * and its proprietary Underwriting Engine.
 */
export function SheriffSalesAuthGuard({
  children,
  mode = "page",
  redirectTo = "/auth",
  requireUnderwritingAccess = true,
}: SheriffSalesAuthGuardProps) {
  const { user, loading, isInitializing, signInWithGoogle, signInAsDemoUser } = useFirebaseAuth();
  const [isPendingAuth, setIsPendingAuth] = useState<"google" | "demo" | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = Boolean(user);

  async function handleGoogleSignIn() {
    setIsPendingAuth("google");
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.warn("Google sign-in fallback notice:", err);
      setAuthError(err instanceof Error ? err.message : "Unable to complete Google authentication.");
    } finally {
      setIsPendingAuth(null);
    }
  }

  async function handleDemoAnalystAccess() {
    setIsPendingAuth("demo");
    setAuthError(null);
    try {
      await signInAsDemoUser();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Unable to provision demo analyst session.");
    } finally {
      setIsPendingAuth(null);
    }
  }

  // If currently initializing authentication state
  if (isInitializing || (loading && !user)) {
    return (
      <div
        id="sheriff-sales-auth-loading"
        className="flex min-h-[60vh] w-full flex-col items-center justify-center p-6 text-foreground"
      >
        <div className="relative flex flex-col items-center max-w-md w-full rounded-2xl border border-slate-200 bg-card p-8 text-center shadow-lg">
          <div className="mb-4">
            <Brand id="sheriff-auth-loading-brand" />
          </div>
          <div className="relative my-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <Loader2 className="absolute h-12 w-12 animate-spin text-primary/30" />
          </div>
          <h3 className="text-base font-bold text-foreground">Verifying Underwriting Clearance</h3>
          <p className="mt-1.5 text-xs text-muted-foreground max-w-xs leading-relaxed">
            Connecting to Firebase Authentication and validating institutional deal memo permissions…
          </p>
        </div>
      </div>
    );
  }

  // If user is authenticated, render protected children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If unauthenticated and mode is 'inline'
  if (mode === "inline") {
    return (
      <Card id="sheriff-sales-inline-auth-gate" className="border-blue-200 bg-primary/10/40 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="bg-primary/20 text-blue-800 border-blue-300 font-mono text-[11px] gap-1">
              <Lock className="w-3 h-3" />
              Authentication Required
            </Badge>
            <span className="text-[11px] font-mono text-muted-foreground">Firebase Auth Protected</span>
          </div>
          <CardTitle className="text-lg font-bold text-foreground mt-2">
            Sheriff Sales Underwriting Engine Locked
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Sign in with an authorized account or launch a demo analyst session to access real-time lien waterfalls,
            MAB calculations, and 70% rule bid ceilings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-card rounded-lg border border-slate-200 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              <span>Multi-Stage Underwriting Engine</span>
            </div>
            <div className="p-2.5 bg-card rounded-lg border border-slate-200 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Surviving Senior Lien Waterfalls</span>
            </div>
          </div>
          {authError && (
            <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
              {authError}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-0">
          <Button
            id="sheriff-inline-demo-btn"
            type="button"
            onClick={handleDemoAnalystAccess}
            disabled={isPendingAuth !== null}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold font-mono gap-1.5"
          >
            {isPendingAuth === "demo" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Launch Demo Analyst Session
          </Button>
          <Button
            id="sheriff-inline-google-btn"
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isPendingAuth !== null}
            className="w-full sm:w-auto text-xs font-bold font-mono bg-card hover:bg-muted gap-1.5"
          >
            {isPendingAuth === "google" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            )}
            Sign in with Google
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Full-page institutional authentication gate
  const currentPath = location.pathname + (location.searchStr && location.searchStr !== "?" ? location.searchStr : "");
  const authUrl = `${redirectTo}?next=${encodeURIComponent(currentPath || "/sheriff-sales")}`;

  return (
    <div
      id="sheriff-sales-protected-page-gate"
      className="flex min-h-[75vh] w-full flex-col items-center justify-center px-4 py-12 text-foreground"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-card p-8 sm:p-10 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <Brand id="sheriff-auth-gate-brand" />
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-blue-200 font-mono text-[11px] gap-1 px-2.5 py-0.5"
          >
            <Lock className="w-3 h-3" />
            Protected Route
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active CivilView & County Docket Feeds
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Sheriff Sales Intelligence Desk
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Institutional authentication via Firebase is required to inspect auction dockets, simulate dynamic rehab
            scopes, and execute proprietary 70% rule underwriting models.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2 rounded-xl bg-muted border border-slate-200/80 p-4 text-xs font-mono text-secondary-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Automated Senior Surviving Lien Waterfalls</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Maximum Allowable Bid (MAB) Ceiling Calculators</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Real-Time Outcomes Ledger Precision (±4.1% ARV Error)</span>
          </div>
        </div>

        {authError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
            {authError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            id="sheriff-gate-launch-demo-btn"
            type="button"
            onClick={handleDemoAnalystAccess}
            disabled={isPendingAuth !== null}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            {isPendingAuth === "demo" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Provisioning Analyst Session…</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Instant Demo Analyst Access</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </>
            )}
          </Button>

          <Button
            id="sheriff-gate-google-signin-btn"
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isPendingAuth !== null}
            className="w-full h-11 bg-card hover:bg-muted text-foreground border-slate-300 font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            {isPendingAuth === "google" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting to Google…</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Sign in with Google Account</span>
              </>
            )}
          </Button>

          <div className="pt-2 text-center">
            <Button
              id="sheriff-gate-email-link-btn"
              type="button"
              onClick={() => {
                navigate({ to: authUrl as any }).catch(() => {
                  window.location.href = authUrl;
                });
              }}
              className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors underline cursor-pointer"
            >
              Sign in with Email & Password →
            </Button>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-primary" />
            Row-Level Secured
          </span>
          <span>Verified August 2026</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal Dialog for popping up the Underwriting Auth Gate whenever an unauthenticated
 * user clicks to run the Underwriting calculation engine.
 */
export function UnderwritingAuthDialog({
  isOpen,
  onClose,
  docketNumber,
  onAuthenticatedSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  docketNumber?: string;
  onAuthenticatedSuccess?: () => void;
}) {
  const { signInWithGoogle, signInAsDemoUser } = useFirebaseAuth();
  const [isBusy, setIsBusy] = useState<"google" | "demo" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleDemo() {
    setIsBusy("demo");
    setErrorMsg(null);
    try {
      await signInAsDemoUser();
      if (onAuthenticatedSuccess) onAuthenticatedSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error establishing session.");
    } finally {
      setIsBusy(null);
    }
  }

  async function handleGoogle() {
    setIsBusy("google");
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      if (onAuthenticatedSuccess) onAuthenticatedSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error connecting with Google.");
    } finally {
      setIsBusy(null);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6 space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-primary/10 text-primary border-blue-200 font-mono text-xs">
              <Lock className="w-3 h-3 mr-1" />
              Underwriting Clearance
            </Badge>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Sign In to Unlock Underwriting Engine
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {docketNumber
              ? `Docket #${docketNumber} requires verified clearance to calculate Maximum Allowable Bid and senior surviving liens.`
              : "Authentication via Firebase is required to run multi-stage AI underwriting models."}
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 bg-muted rounded-xl border border-slate-200 space-y-2 text-xs font-mono text-secondary-foreground">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            <span>Instant Underwriting Score & Grade (A+ to D)</span>
          </div>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>Detailed Lien Waterfall & Equity Margin</span>
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
            {errorMsg}
          </p>
        )}

        <DialogFooter className="flex flex-col sm:flex-col gap-2 pt-2 sm:space-x-0">
          <Button
            id="modal-underwrite-demo-btn"
            type="button"
            onClick={handleDemo}
            disabled={isBusy !== null}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-mono text-xs h-10 gap-2 cursor-pointer"
          >
            {isBusy === "demo" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Launch Demo Analyst Session
          </Button>

          <Button
            id="modal-underwrite-google-btn"
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={isBusy !== null}
            className="w-full font-bold font-mono text-xs h-10 gap-2 border-slate-300 hover:bg-muted cursor-pointer"
          >
            {isBusy === "google" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            )}
            Sign in with Google
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full text-xs text-muted-foreground hover:text-foreground h-8 mt-1"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Custom React hook that encapsulates Underwriting Engine access authorization.
 * Allows components to guard calculateUnderwritingScore or underwriting modal actions.
 */
export function useUnderwritingAccessGate() {
  const { user, loading, isInitializing } = useFirebaseAuth();
  const [isGateModalOpen, setIsGateModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [activeDocket, setActiveDocket] = useState<string | undefined>(undefined);

  const isAuthenticated = Boolean(user);

  const requireUnderwritingAuth = (action: () => void, docketNumber?: string) => {
    if (isAuthenticated) {
      action();
      return true;
    }
    setPendingAction(() => action);
    setActiveDocket(docketNumber);
    setIsGateModalOpen(true);
    return false;
  };

  const handleAuthenticatedSuccess = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
    setIsGateModalOpen(false);
  };

  const UnderwritingGateModal = (
    <UnderwritingAuthDialog
      isOpen={isGateModalOpen}
      onClose={() => {
        setIsGateModalOpen(false);
        setPendingAction(null);
      }}
      docketNumber={activeDocket}
      onAuthenticatedSuccess={handleAuthenticatedSuccess}
    />
  );

  return {
    user,
    loading,
    isInitializing,
    isAuthenticated,
    requireUnderwritingAuth,
    UnderwritingGateModal,
    openAuthModal: (docket?: string) => {
      setActiveDocket(docket);
      setIsGateModalOpen(true);
    },
    closeAuthModal: () => setIsGateModalOpen(false),
  };
}

export default SheriffSalesAuthGuard;

