import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";
import { BRAND_CONFIG } from "@/lib/brand";
import { Lock, Eye, Database, Globe } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  ssr: false,
  head: () => ({
    meta: [
      { title: `Privacy Policy — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content: `Privacy Policy and data practices for ${BRAND_CONFIG.name} operated by ${BRAND_CONFIG.legalName}.`,
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalLayout
      id="privacy-policy-page"
      title="Privacy Policy"
      badge="Data Protection"
      description={`How ${BRAND_CONFIG.legalName} collects, safeguards, and respects your personal information and commercial workspace privacy.`}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">1. Introduction</h2>
        <p>
          At <strong>{BRAND_CONFIG.legalName}</strong> (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), we take your privacy and data security seriously. This Privacy Policy describes how we collect, use, process, and disclose your personal and analytical information when you visit or subscribe to{" "}
          <a href={`https://${BRAND_CONFIG.domain}`} className="text-primary hover:underline">
            {BRAND_CONFIG.domain}
          </a>{" "}
          (the &ldquo;Service&rdquo;).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">2. Information We Collect</h2>
        <p>We collect several categories of information to provide and enhance our real estate intelligence platform:</p>

        <div className="space-y-3 text-xs">
          <div className="rounded-lg border border-border bg-card p-3.5 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Lock className="h-3.5 w-3.5 text-primary" />
              <span>Account Credentials</span>
            </div>
            <p className="text-muted-foreground">
              When you register, we collect your email address, name, password hash (via secure Firebase/Supabase Auth), and organizational affiliation.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-3.5 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Database className="h-3.5 w-3.5 text-emerald-600" />
              <span>Workspace & Portfolio Data</span>
            </div>
            <p className="text-muted-foreground">
              Properties added to your saved watchlists, custom underwriting notes, custom ARV overrides, target purchase offers, and deal tags.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-3.5 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Eye className="h-3.5 w-3.5 text-amber-600" />
              <span>Usage & Telemetry Data</span>
            </div>
            <p className="text-muted-foreground">
              Search queries, geographic viewport coordinates on the interactive cadastral map, feature engagement, browser type, operating system, and IP address for security logging and rate-limiting.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">3. Payment Information & Paddle.com</h2>
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-xs leading-relaxed">
          <p>
            <strong>Paddle as Merchant of Record:</strong> All subscription payments, order fulfillment, and invoicing are processed by our authorized reseller and Merchant of Record, <strong>Paddle.com Market Ltd.</strong>
          </p>
          <p>
            When you purchase a subscription, your payment details (credit/debit card numbers, PayPal, Apple Pay) are collected and processed directly by Paddle under strict PCI-DSS Level 1 security standards.
          </p>
          <p>
            <strong>{BRAND_CONFIG.legalName} does not store, process, or have access to your full credit card numbers or banking secrets.</strong> We only receive anonymized transaction identifiers, customer IDs, subscription status, and billing cycle renewal timestamps from Paddle webhooks.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">4. How We Use Your Information</h2>
        <p>We use collected data strictly for legitimate business and operational purposes:</p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-xs">
          <li>Authenticating your analyst profile and managing workspace access</li>
          <li>Calculating and rendering personalized Monte Carlo deal rankings and cadastral layers</li>
          <li>Delivering deal alerts, watchlist updates, and subscription billing receipts</li>
          <li>Preventing abuse, malicious bot activity, and unauthorized bulk scraping</li>
          <li>Continuous platform performance monitoring, error logging, and latency optimization</li>
        </ul>
        <p className="text-xs font-semibold text-foreground">
          We never sell, rent, or trade your personal information or proprietary portfolio watchlists to third-party data brokers or marketing syndicates.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">5. Third-Party Service Providers</h2>
        <p>We collaborate with carefully selected infrastructure vendors to deliver our platform:</p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-xs">
          <li><strong>Paddle:</strong> Global merchant of record, billing, VAT/sales tax calculations, and checkout.</li>
          <li><strong>Google Cloud & Firebase:</strong> Cloud infrastructure, server-side compute, and authentication services.</li>
          <li><strong>Supabase / PostgreSQL:</strong> Cadastral database indexing and secure session management.</li>
          <li><strong>Google Maps Platform:</strong> Geospatial map tiles, geocoding, and address validation.</li>
          <li><strong>Realie API:</strong> Public parcel boundaries, assessor deed history, and structural characteristics.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">6. Cookies & Client-Side Storage</h2>
        <p>
          We use browser session storage, local storage, and essential cookies to maintain user authentication, preserve map layer preferences, and ensure seamless navigation. We support the <strong>Global Privacy Control (GPC)</strong> and respect browser Do-Not-Track signals.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">7. Your Privacy Rights (GDPR & CCPA/CPRA)</h2>
        <p>Depending on your jurisdiction, you possess the following rights regarding your personal information:</p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-xs">
          <li><strong>Right to Access:</strong> Request a copy of all personal records we hold concerning you.</li>
          <li><strong>Right to Rectification:</strong> Correct any inaccurate or incomplete personal records.</li>
          <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Request the permanent deletion of your user account and portfolio data.</li>
          <li><strong>Right to Portability:</strong> Receive your saved parcels and notes in a standard structured format (CSV/JSON).</li>
          <li><strong>Right to Non-Discrimination:</strong> Exercise your rights without fear of penalty, pricing discrimination, or reduced service quality.</li>
        </ul>
        <p className="text-xs">
          To exercise any of these rights, email us at{" "}
          <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="text-primary font-semibold hover:underline">
            {BRAND_CONFIG.supportEmail}
          </a>
          . We respond to all verified requests within thirty (30) days.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">8. Security & Data Retention</h2>
        <p>
          We apply industry-standard physical, technical, and managerial safeguards including SSL/TLS 256-bit encryption in transit, encrypted databases at rest, and strict role-based access controls. We retain your personal data only for as long as your account remains active or as required by law for accounting and tax audits.
        </p>
      </section>

      <section className="space-y-3 border-t border-border pt-6">
        <h2 className="text-lg font-bold text-foreground">9. Contact Us</h2>
        <p>
          For questions, concerns, or data requests regarding this Privacy Policy, please contact our Data Protection Officer:
        </p>
        <div className="rounded-lg border border-border bg-muted/20 p-4 text-xs space-y-1">
          <p className="font-semibold text-foreground">{BRAND_CONFIG.legalName}</p>
          <p className="text-muted-foreground">Privacy & Data Governance Team</p>
          <p className="text-muted-foreground">
            Email:{" "}
            <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="text-primary hover:underline">
              {BRAND_CONFIG.supportEmail}
            </a>
          </p>
          <p className="text-muted-foreground">Website: {BRAND_CONFIG.domain}</p>
        </div>
      </section>
    </LegalLayout>
  );
}
