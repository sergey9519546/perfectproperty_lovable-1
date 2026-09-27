import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";
import { BRAND_CONFIG } from "@/lib/brand";
import { CheckCircle, Clock, ShieldCheck, Mail, AlertCircle, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/refunds")({
  ssr: false,
  head: () => ({
    meta: [
      { title: `Refund & Cancellation Policy — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content: `30-Day Money-Back Guarantee and cancellation terms for ${BRAND_CONFIG.name} (${BRAND_CONFIG.legalName}).`,
      },
    ],
  }),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <LegalLayout
      id="refund-policy-page"
      title="Refund & Cancellation Policy"
      badge="30-Day Guarantee"
      description={`Clear, transparent terms regarding your subscription cancellations and our 30-Day Money-Back Guarantee, operated by ${BRAND_CONFIG.legalName} and fulfilled by Paddle.`}
    >
      {/* 30-Day Guarantee Callout Card */}
      <div className="rounded-xl border border-emerald-300/60 bg-emerald-50/70 p-5 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-200 space-y-2">
        <div className="flex items-center gap-2 font-bold text-base text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span>Our 30-Day Full Satisfaction Guarantee</span>
        </div>
        <p className="text-xs leading-relaxed text-emerald-900/90 dark:text-emerald-200/90">
          We want you to explore our cadastral intelligence, deal rankings, and Prophecy underwriting models with total confidence. If for any reason {BRAND_CONFIG.name} does not meet your expectations, you may request a <strong>100% full refund within thirty (30) calendar days</strong> of your initial subscription purchase. No complicated hurdles or hidden caveats.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">1. Eligibility for Refunds</h2>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Initial Purchases:</strong> Any new subscriber who purchases a monthly or annual plan for the first time is eligible for a full refund if requested within 30 calendar days of the initial transaction.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Annual Subscription Renewals:</strong> For automatic annual renewals, you have a <strong>seven (7) day grace period</strong> following the renewal charge to request a full cancellation and refund if you forgot to cancel in advance.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Service Downtime or Technical Failures:</strong> In the unlikely event of major verified system outages or critical failure preventing platform usage, pro-rated credits or refunds will be granted upon investigation.
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">2. How to Request a Refund</h2>
        <p>Requesting a refund is quick and straightforward:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">1</span>
              <span>Email Us</span>
            </div>
            <p className="text-muted-foreground">
              Send an email to{" "}
              <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="text-primary font-medium hover:underline">
                {BRAND_CONFIG.supportEmail}
              </a>{" "}
              from the address associated with your account.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">2</span>
              <span>Provide Order Details</span>
            </div>
            <p className="text-muted-foreground">
              Include your account email or Paddle order receipt ID (starting with <code>pdl_</code> or numerical order number).
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">3</span>
              <span>Quick Processing</span>
            </div>
            <p className="text-muted-foreground">
              Our team verifies and issues the refund through Paddle within <strong>24 to 48 hours</strong>.
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          You may also request a refund directly through <a href="https://paddle.net" target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">paddle.net</a> using your transaction email and receipt number.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">3. Processing Time & Funds Return</h2>
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>Banking Return Timelines</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Once a refund is authorized by our team or by Paddle, the funds are credited directly back to the original payment method (Credit Card, Debit Card, PayPal, or Apple Pay). Depending on your banking institution, funds typically appear on your statement within <strong>5 to 10 business days</strong>.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">4. Subscription Cancellation</h2>
        <p>
          You have full control over your membership and may cancel at any time with zero cancellation penalties:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground text-xs">
          <li><strong>Self-Service:</strong> Click on your profile menu in the app header and select <em>&ldquo;Manage Billing&rdquo;</em> to access the Paddle customer portal, where you can pause or cancel your subscription with a single click.</li>
          <li><strong>Email Request:</strong> Alternatively, email <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="text-primary font-medium hover:underline">{BRAND_CONFIG.supportEmail}</a> and our support staff will cancel your renewal immediately.</li>
          <li><strong>Retained Access:</strong> After cancellation, your account retains full active subscription privileges through the remainder of the currently paid billing cycle. No further automatic payments will ever be charged.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">5. Fraud Prevention & Abuse</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {BRAND_CONFIG.legalName} reserves the right to decline refund requests in cases of documented bad-faith abuse, such as systematic high-frequency automated scraping of the entire cadastral database immediately preceding a refund request, or repeated cycles of purchasing and requesting refunds across multiple disposable accounts.
        </p>
      </section>

      <section className="space-y-3 border-t border-border pt-6">
        <h2 className="text-lg font-bold text-foreground">6. Merchant of Record & Support Inquiries</h2>
        <p>
          For any questions regarding a charge, receipt, cancellation, or refund status, please reach out to:
        </p>
        <div className="rounded-lg border border-border bg-muted/20 p-4 text-xs space-y-2">
          <div>
            <span className="font-bold text-foreground">{BRAND_CONFIG.legalName} Customer Support</span>
            <br />
            Email:{" "}
            <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="text-primary font-semibold hover:underline">
              {BRAND_CONFIG.supportEmail}
            </a>
          </div>
          <div className="border-t border-border pt-2">
            <span className="font-bold text-foreground">Paddle.com Reseller Support</span>
            <br />
            Website:{" "}
            <a href="https://paddle.net" target="_blank" rel="noreferrer" className="text-primary hover:underline">
              https://paddle.net
            </a>{" "}
            (Order Lookup & Buyer Assistance)
          </div>
        </div>
      </section>
    </LegalLayout>
  );
}
