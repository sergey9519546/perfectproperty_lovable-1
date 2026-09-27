import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PRICING_PLANS, SubscriptionTier, BillingCycle } from "@/lib/subscriptions/types";
import { BRAND_CONFIG } from "@/lib/brand";
import { useFirebaseAuth } from "@/integrations/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  HelpCircle,
  CreditCard,
  Lock,
  RefreshCw,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { initializePaddle, Paddle } from "@paddle/paddle-js";

export const Route = createFileRoute("/pricing")({
  ssr: false,
  head: () => ({
    meta: [
      { title: `Subscription Plans & Pricing — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content: `Professional real estate intelligence and algorithmic deal underwriting plans with a 30-Day Money-Back Guarantee.`,
      },
    ],
  }),
  component: PricingPage,
});

let paddleInstance: Paddle | null = null;

function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("month");
  const [isPaddleReady, setIsPaddleReady] = useState(false);
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const { user } = useFirebaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
    const env = import.meta.env.PADDLE_ENVIRONMENT || "sandbox";

    if (clientToken) {
      initializePaddle({
        token: clientToken,
        environment: env === "production" ? "production" : "sandbox",
      })
        .then((instance) => {
          if (instance) {
            paddleInstance = instance;
            setIsPaddleReady(true);
          }
        })
        .catch((err) => {
          console.warn("[Paddle] Failed to initialize Paddle SDK:", err);
        });
    }
  }, []);

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    if (tier === "enterprise") {
      window.location.href = `mailto:${BRAND_CONFIG.supportEmail}?subject=Enterprise%20Inquiry%20-%20PerfectProperty`;
      return;
    }

    if (!user) {
      toast.info("Please sign in or create an account to start your subscription.");
      navigate({ to: "/auth", search: { next: "/pricing" } });
      return;
    }

    setLoadingTier(tier);
    const plan = PRICING_PLANS.find((p) => p.id === tier);
    const priceConfig = plan?.prices[billingCycle];

    try {
      if (paddleInstance && priceConfig?.priceId && !priceConfig.priceId.startsWith("pri_starter_")) {
        // Real Paddle Checkout
        paddleInstance.Checkout.open({
          items: [{ priceId: priceConfig.priceId, quantity: 1 }],
          ...(user.email ? { customer: { email: user.email } } : {}),
          customData: {
            userId: user.uid,
            tier,
            billingCycle,
          },
          settings: {
            displayMode: "overlay",
            theme: "light",
            locale: "en",
            successUrl: `${window.location.origin}/deals?subscribed=true`,
          },
        });
      } else {
        // Interactive simulation / sandbox mode when live Paddle tokens are awaiting merchant live approval
        await new Promise((resolve) => setTimeout(resolve, 800));
        toast.success(
          `Activated ${plan?.name} (${billingCycle}ly) in sandbox mode! Redirecting to full deal pipeline…`,
          { duration: 4000 },
        );
        setTimeout(() => {
          navigate({ to: "/deals" });
        }, 1200);
      }
    } catch (e: any) {
      console.error("[PaddleCheckout] Error:", e);
      toast.error(e?.message || "Failed to initialize checkout. Please try again.");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="text-muted-foreground/60">/</span>
          <span className="font-semibold text-foreground">Pricing & Plans</span>
        </nav>
      </div>

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border bg-radial from-card via-background to-background py-16 px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>30-Day 100% Money-Back Guarantee</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Institutional Deal Underwriting <br className="hidden sm:inline" />
            <span className="text-primary">At Wholesale Speed</span>
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Gain an asymmetric advantage across Cook County, IL with predictive distress telemetry, Monte Carlo gross profit calibrations, and AI-scored sheriff auctions.
          </p>

          {/* Billing Interval Switcher */}
          <div className="pt-6 flex justify-center items-center gap-3">
            <div className="inline-flex items-center rounded-xl border border-border bg-card p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setBillingCycle("month")}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === "month"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("year")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === "year"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Annual Billing</span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-black uppercase">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6 items-stretch">
          {PRICING_PLANS.map((plan) => {
            const price = plan.prices[billingCycle];
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-200 bg-card p-6 sm:p-8 shadow-xs ${
                  isPopular
                    ? "border-primary ring-2 ring-primary/20 shadow-md"
                    : "border-border hover:border-border-strong"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[11px] font-bold text-primary-foreground shadow-xs uppercase tracking-wider">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    {plan.id === "pro" && <Sparkles className="h-5 w-5 text-primary" />}
                    {plan.id === "enterprise" && <Building className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground min-h-[36px]">{plan.tagline}</p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">
                      ${billingCycle === "year" && "monthlyEquivalent" in price ? (price as any).monthlyEquivalent : price.amount}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {billingCycle === "year" ? "/mo (billed annually)" : price.intervalLabel}
                    </span>
                  </div>

                  {billingCycle === "year" && "savingsBadge" in price && (
                    <div className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {(price as any).savingsBadge} · ${(price as any).amount}/yr
                    </div>
                  )}

                  {/* Features List */}
                  <ul className="mt-8 space-y-3.5 border-t border-border pt-6 text-xs">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        {feat.included ? (
                          <Check className={`h-4 w-4 shrink-0 mt-0.5 ${feat.highlight ? "text-primary font-bold" : "text-emerald-600"}`} />
                        ) : (
                          <X className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/40" />
                        )}
                        <span className={`${feat.included ? "text-foreground" : "text-muted-foreground/60 line-through"} ${feat.highlight ? "font-semibold text-foreground" : ""}`}>
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action CTA */}
                <div className="mt-8 pt-4">
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loadingTier === plan.id}
                    className={`w-full h-11 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isPopular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                        : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                    }`}
                  >
                    {loadingTier === plan.id ? "Launching Checkout…" : plan.ctaLabel}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust, Guarantee & Payment Notice */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-16">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">30-Day Money-Back Guarantee</h4>
                <p className="text-xs text-muted-foreground">
                  If {BRAND_CONFIG.name} does not meet your expectations, request a 100% refund within 30 days. Read our{" "}
                  <Link to="/refunds" className="text-primary hover:underline font-semibold">
                    Refund Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span>256-Bit SSL Encryption</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground pt-2">
            <div>
              <span>Operated by <strong>{BRAND_CONFIG.legalName}</strong></span>
              <span className="mx-2">·</span>
              <span>Merchant of Record & Reseller: <strong>Paddle.com</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded border border-border px-2 py-0.5 text-[11px] font-mono">VISA</span>
              <span className="rounded border border-border px-2 py-0.5 text-[11px] font-mono">Mastercard</span>
              <span className="rounded border border-border px-2 py-0.5 text-[11px] font-mono">AMEX</span>
              <span className="rounded border border-border px-2 py-0.5 text-[11px] font-mono">PayPal</span>
              <span className="rounded border border-border px-2 py-0.5 text-[11px] font-mono">Apple Pay</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-16 space-y-6">
        <h2 className="text-xl font-bold text-foreground text-center">Frequently Asked Questions</h2>
        <div className="space-y-4 text-xs">
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h4 className="font-bold text-foreground text-sm">How does the 30-day money-back guarantee work?</h4>
            <p className="text-muted-foreground leading-relaxed">
              If within your first 30 days you decide {BRAND_CONFIG.name} is not right for your acquisition workflow, simply email us at{" "}
              <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="text-primary font-medium hover:underline">
                {BRAND_CONFIG.supportEmail}
              </a>{" "}
              or open a ticket at paddle.net. We will promptly process a full refund to your original payment method within 24 to 48 hours.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h4 className="font-bold text-foreground text-sm">Can I cancel my subscription at any time?</h4>
            <p className="text-muted-foreground leading-relaxed">
              Yes, absolutely. You can cancel self-service at any time directly through the billing portal or by emailing support. When you cancel, your account will remain fully active until the end of your prepaid billing period with no further charges.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h4 className="font-bold text-foreground text-sm">What counties are currently covered?</h4>
            <p className="text-muted-foreground leading-relaxed">
              Our core focus is Cook County, IL (Chicago metro), with 500+ daily scored and ranked distressed parcels. Pro members also receive nationwide address lookups, automated cadastral comps radius, and sheriff auction scoring.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h4 className="font-bold text-foreground text-sm">Who is Paddle?</h4>
            <p className="text-muted-foreground leading-relaxed">
              Paddle.com is our Merchant of Record and authorized reseller. Paddle handles secure credit card processing, international tax compliance, and billing management for {BRAND_CONFIG.legalName}.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
