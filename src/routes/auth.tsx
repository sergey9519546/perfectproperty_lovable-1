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
    <main className="perfect-property-ui grid min-h-[100dvh] bg-[#01070c] text-[#f3f6f8] lg:grid-cols-[minmax(0,1.1fr)_minmax(430px,.9fr)]">
      <section className="relative hidden overflow-hidden border-r border-[#7893a5]/18 lg:block">
        <img src="/perfect-property-hero.png" alt="" className="absolute inset-0 h-full w-full object-cover object-[58%_50%]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(1,7,12,.92),rgba(1,7,12,.35)),linear-gradient(180deg,rgba(1,7,12,.08),rgba(1,7,12,.92))]" />
        <div className="relative flex h-full flex-col p-10 xl:p-14">
          <Link to="/" id="auth-desktop-brand-link" aria-label={`${BRAND_CONFIG.name} home`} className="w-fit"><Brand id="auth-desktop-brand" /></Link>
          <div className="mt-auto max-w-[560px] pb-5">
            <p className="text-[12px] font-medium text-[#efaa2d]">Investment intelligence, with evidence.</p>
            <h1 className="mt-4 text-[44px] font-semibold leading-[1.08] tracking-[-.04em] xl:text-[52px]">See the opportunity.<br />Trace every signal.</h1>
            <p className="mt-5 max-w-[48ch] text-[15px] leading-7 text-[#b0bcc4]">Access calibrated market scores, ranked deals, source lineage, and underwriting actions in one workspace.</p>
            
            <div className="mt-8 flex items-center gap-6 text-xs text-[#8798a3]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#efaa2d]" />
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

      <section className="flex min-h-[100dvh] items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[440px]">
          <Link to="/" id="auth-mobile-brand-link" aria-label={`${BRAND_CONFIG.name} home`} className="mb-10 block w-fit lg:hidden"><Brand id="auth-mobile-brand" /></Link>
          
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-[.14em] text-[#efaa2d]">Platform Access</p>
            <div className="flex bg-[#07131d] p-0.5 rounded border border-[#7893a5]/20 text-[12px]">
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(null); }}
                className={`px-3 py-1 rounded transition-colors ${mode === "signin" ? "bg-[#142838] text-[#edf3f6] font-medium" : "text-[#7893a5] hover:text-[#edf3f6]"}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(null); }}
                className={`px-3 py-1 rounded transition-colors ${mode === "signup" ? "bg-[#142838] text-[#edf3f6] font-medium" : "text-[#7893a5] hover:text-[#edf3f6]"}`}
              >
                Create Account
              </button>
            </div>
          </div>

          <h1 className="mt-3 text-[30px] font-semibold tracking-[-.03em]">
            {mode === "signin" ? "Sign in to workspace" : "Create your account"}
          </h1>
          <p className="mt-1.5 text-[13px] text-[#8798a3]">
            {mode === "signin" 
              ? "Access institutional deal memos, calibrated underwriting, and map intelligence."
              : "Set up instant access with fully provisioned analysis permissions."}
          </p>

          {/* Quick Demo Access Button */}
          <div className="mt-6 rounded-lg border border-blue-500/30 bg-blue-950/20 p-4 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant Demo Analyst Access</span>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-[#94a3b8]">
                  Explore live parcels, underwriting models, and pipeline scoring with our pre-configured analyst account.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoAccess}
              disabled={busy}
              aria-busy={pendingAction === "demo"}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded bg-blue-600 px-4 text-[13px] font-medium text-white shadow hover:bg-blue-500 disabled:opacity-50 cursor-pointer transition-all active:scale-[0.99]"
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
            </button>
          </div>

          <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[.12em] text-[#657985]">
            <div className="h-px flex-1 bg-[#7893a5]/18" />
            or continue with credentials
            <div className="h-px flex-1 bg-[#7893a5]/18" />
          </div>

          <form onSubmit={handleEmailAuth} aria-busy={pendingAction === "email"} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <label htmlFor="auth-name" className="block text-[12px] font-medium text-[#aab8c2]">Full Name</label>
                <input
                  id="auth-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="h-11 w-full rounded-[4px] border border-[#7893a5]/22 bg-[#030b11] px-3 text-[13px] text-[#edf3f6] outline-none transition-colors placeholder:text-[#5a6b76] focus:border-[#efaa2d]/70"
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="auth-email" className="block text-[12px] font-medium text-[#aab8c2]">Email address</label>
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined })); }}
                placeholder="you@company.com"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "auth-email-error" : undefined}
                className="h-11 w-full rounded-[4px] border border-[#7893a5]/22 bg-[#030b11] px-3 text-[13px] text-[#edf3f6] outline-none transition-colors placeholder:text-[#5a6b76] focus:border-[#efaa2d]/70"
              />
              {fieldErrors.email && (
                <p id="auth-email-error" role="alert" className="text-[11px] text-[#ef8189]">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="auth-password" className="block text-[12px] font-medium text-[#aab8c2]">Password</label>
              <input
                id="auth-password"
                name="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined })); }}
                placeholder="At least 6 characters"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? "auth-password-error" : undefined}
                className="h-11 w-full rounded-[4px] border border-[#7893a5]/22 bg-[#030b11] px-3 text-[13px] text-[#edf3f6] outline-none transition-colors placeholder:text-[#5a6b76] focus:border-[#efaa2d]/70"
              />
              {fieldErrors.password && (
                <p id="auth-password-error" role="alert" className="text-[11px] text-[#ef8189]">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="primary-button h-11 w-full disabled:opacity-50 cursor-pointer"
            >
              {pendingAction === "email" ? (
                mode === "signup" ? "Creating account…" : "Signing in…"
              ) : (
                mode === "signup" ? "Create Account & Enter" : "Sign in with Email"
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            aria-busy={pendingAction === "google"}
            className="control-button mt-3 h-11 w-full justify-center disabled:opacity-50 cursor-pointer"
          >
            {pendingAction === "google" ? "Connecting to Google…" : "Continue with Google"}
          </button>

          {error && (
            <p role="alert" className="mt-4 rounded border border-[#dc5d66]/25 bg-[#dc5d66]/8 px-3 py-2 text-[12px] text-[#ef8189]">
              {error}
            </p>
          )}

          <div className="mt-8 border-t border-[#7893a5]/16 pt-5 flex items-center justify-between text-[11px] text-[#718592]">
            <Link to="/" className="inline-flex items-center gap-1.5 transition-colors hover:text-[#f3f6f8]">
              <ArrowLeft size={14} aria-hidden="true" /> Back to {BRAND_CONFIG.name}
            </Link>
            <span>Role-Based Access Control</span>
          </div>
        </div>
      </section>
    </main>
  );
}
