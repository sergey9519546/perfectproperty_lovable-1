import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createFileRoute, redirect, useSearch, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { safeNext } from "@/lib/safe-next";
import { ArrowLeft } from "@phosphor-icons/react";
import { Sparkles, UserCheck, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { z } from "zod";
import { Brand } from "@/features/perfect-property/components/Brand";
import { BRAND_CONFIG } from "@/lib/brand";
import { provisionDemoAccount, registerAccount } from "@/lib/auth.functions";
import { useFirebaseAuth, getAuthenticatedFirebaseUser } from "@/integrations/firebase";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { next?: string } => ({
    next: typeof s.next === "string" ? s.next : "/",
  }),
  beforeLoad: async ({ search }) => {
    const fbUser = await getAuthenticatedFirebaseUser();
    if (fbUser) throw redirect({ href: safeNext(search.next) });
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ href: safeNext(search.next) });
  },
  component: AuthPage,
});

function AuthPage() {
  const { next } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsDemoUser, user: firebaseUser } = useFirebaseAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [pendingAction, setPendingAction] = useState<"google" | "email" | "demo" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
  const busy = pendingAction !== null;

  const authSchema = z.object({
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName: z.string().optional(),
  });

  useEffect(() => {
    if (firebaseUser) {
      window.location.href = safeNext(next);
      return;
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        window.location.href = safeNext(next);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [next, firebaseUser]);

  async function handleDemoAccess() {
    setPendingAction("demo");
    setError(null);
    try {
      // Provision the demo analyst account credentials and signed session token
      const creds = await provisionDemoAccount();

      // Establish authenticated demo session
      if (typeof signInAsDemoUser === "function") {
        await signInAsDemoUser(creds);
      } else if (typeof localStorage !== "undefined") {
        localStorage.setItem("pp_demo_session", JSON.stringify(creds));
      }

      // Non-blocking attempt to authenticate with Supabase client if enabled
      try {
        await supabase.auth.signInWithPassword({
          email: creds.email,
          password: creds.password,
        });
      } catch {
        // Non-blocking: signed bearer token from provisionDemoAccount is attached via middleware
      }

      window.location.href = safeNext(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to provision demo access. Please try again.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleGoogle() {
    setPendingAction("google");
    setError(null);
    try {
      await signInWithGoogle();
      window.location.href = safeNext(next);
    } catch (caught) {
      console.warn("Firebase Google popup fallback to Lovable OAuth:", caught);
      try {
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: `${window.location.origin}/auth?next=${encodeURIComponent(safeNext(next))}`,
        });
        if (result.error) {
          setError(result.error.message);
          return;
        }
        if (result.redirected) return;
        window.location.href = safeNext(next);
      } catch (oauthErr) {
        setError(oauthErr instanceof Error ? oauthErr.message : "Unable to connect to Google. Please try again.");
      }
    } finally {
      setPendingAction(null);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setPendingAction("email");
    setError(null);
    const parsed = authSchema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      const errs: { email?: string; password?: string; fullName?: string } = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "email") errs.email = issue.message;
        if (issue.path[0] === "password") errs.password = issue.message;
      }
      setFieldErrors(errs);
      setPendingAction(null);
      return;
    }
    setFieldErrors({});

    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password, fullName || undefined);
        try {
          await registerAccount({
            data: {
              email,
              password,
              fullName: fullName || undefined,
            },
          });
        } catch {
          // non-blocking
        }
      } else {
        await signInWithEmail(email, password);
        try {
          await supabase.auth.signInWithPassword({ email, password });
        } catch {
          // non-blocking
        }
      }

      await navigate({ to: safeNext(next) as "/" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `Unable to ${mode === "signup" ? "create account" : "sign in"}. Please try again.`);
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <main className="grid min-h-[100dvh] bg-background text-foreground lg:grid-cols-[minmax(0,1.1fr)_minmax(460px,.9fr)]">
      <section className="relative hidden overflow-hidden border-r border-border bg-slate-900 lg:block">
        <img src="/perfect-property-hero.png" alt="" className="absolute inset-0 h-full w-full object-cover object-[58%_50%] opacity-40 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/60" />
        <div className="relative flex h-full flex-col p-10 xl:p-14 text-white">
          <Link to="/" id="auth-desktop-brand-link" aria-label={`${BRAND_CONFIG.name} home`} className="w-fit">
            <Brand id="auth-desktop-brand" />
          </Link>
          <div className="mt-auto max-w-[560px] pb-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 backdrop-blur-xs mb-4">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Investment intelligence, with evidence.
            </div>
            <h1 className="text-[42px] font-bold leading-[1.08] tracking-[-.04em] xl:text-[50px] text-white">
              See the opportunity.<br />Trace every signal.
            </h1>
            <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-slate-300">
              Access calibrated market scores, ranked deals, source lineage, and underwriting actions in one unified institutional workspace.
            </p>
            
            <div className="mt-8 flex items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Private & Row-Level Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Audited Source Provenance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-[100dvh] items-center justify-center bg-background px-5 py-10 sm:px-12">
        <div className="w-full max-w-[440px] rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-sm">
          <Link to="/" id="auth-mobile-brand-link" aria-label={`${BRAND_CONFIG.name} home`} className="mb-8 block w-fit lg:hidden">
            <Brand id="auth-mobile-brand" />
          </Link>
          
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[.14em] text-primary">Platform Access</span>
            <div className="flex bg-muted p-0.5 rounded-lg border border-border text-[12px]">
              <Button
                type="button"
                onClick={() => { setMode("signin"); setError(null); }}
                className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${mode === "signin" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"}`}
              >
                Sign In
              </Button>
              <Button
                type="button"
                onClick={() => { setMode("signup"); setError(null); }}
                className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${mode === "signup" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"}`}
              >
                Create Account
              </Button>
            </div>
          </div>

          <h1 className="mt-4 text-[26px] font-bold tracking-tight text-foreground">
            {mode === "signin" ? "Sign in to workspace" : "Create your account"}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground leading-normal">
            {mode === "signin" 
              ? "Access institutional deal memos, calibrated underwriting, and map intelligence."
              : "Set up instant access with fully provisioned analysis permissions."}
          </p>

          {/* Quick Demo Access Button */}
          <div className="mt-6 rounded-xl border border-blue-200 bg-primary/10/60 p-4 transition-all">
            <div>
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Demo Analyst Access</span>
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                Explore live parcels, underwriting models, and pipeline scoring with our pre-configured analyst account.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleDemoAccess}
              disabled={busy}
              aria-busy={pendingAction === "demo"}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50 cursor-pointer transition-all active:scale-[0.99]"
            >
              {pendingAction === "demo" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Provisioning Demo Access…</span>
                </>
              ) : (
                <>
                  <span>Launch Demo Analyst Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.12em] text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or credentials
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmailAuth} aria-busy={pendingAction === "email"} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label htmlFor="auth-name" className="block text-[12px] font-semibold text-foreground">Full Name</label>
                <Input
                  id="auth-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="auth-email" className="block text-[12px] font-semibold text-foreground">Email address</label>
              <Input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined })); }}
                placeholder="you@company.com"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "auth-email-error" : undefined}
                className="h-10 w-full rounded-lg border border-border bg-card px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {fieldErrors.email && (
                <p id="auth-email-error" role="alert" className="text-[11px] font-medium text-rose-600">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="auth-password" className="block text-[12px] font-semibold text-foreground">Password</label>
              <Input
                id="auth-password"
                name="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined })); }}
                placeholder="At least 6 characters"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? "auth-password-error" : undefined}
                className="h-10 w-full rounded-lg border border-border bg-card px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {fieldErrors.password && (
                <p id="auth-password-error" role="alert" className="text-[11px] font-medium text-rose-600">{fieldErrors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="mt-2 flex h-10 w-full items-center justify-center rounded-lg bg-foreground px-4 text-[13px] font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 cursor-pointer transition-all active:scale-[0.99]"
            >
              {pendingAction === "email" ? (
                mode === "signup" ? "Creating account…" : "Signing in…"
              ) : (
                mode === "signup" ? "Create Account & Enter" : "Sign in with Email"
              )}
            </Button>
          </form>

          <Button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            aria-busy={pendingAction === "google"}
            className="mt-3 flex h-10 w-full items-center justify-center rounded-lg border border-border bg-card px-4 text-[13px] font-semibold text-foreground hover:bg-muted hover:border-border-strong disabled:opacity-50 cursor-pointer transition-all shadow-2xs"
          >
            {pendingAction === "google" ? "Connecting to Google…" : "Continue with Google"}
          </Button>

          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-medium text-rose-700">
              {error}
            </p>
          )}

          <div className="mt-8 border-t border-border pt-4 flex items-center justify-between text-[11px] text-muted-foreground">
            <Link to="/" className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-foreground">
              <ArrowLeft size={14} aria-hidden="true" /> Back to {BRAND_CONFIG.name}
            </Link>
            <span className="font-medium">Role-Based Access Control</span>
          </div>
        </div>
      </section>
    </main>
  );
}
