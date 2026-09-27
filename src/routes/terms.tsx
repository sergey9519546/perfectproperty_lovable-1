import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";
import { BRAND_CONFIG } from "@/lib/brand";
import { AlertTriangle, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/terms")({
  ssr: false,
  head: () => ({
    meta: [
      { title: `Terms of Service — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content: `Terms of Service and Customer Agreement for ${BRAND_CONFIG.name} (${BRAND_CONFIG.legalName}).`,
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalLayout
      id="terms-of-service-page"
      title="Terms of Service"
      badge="Agreement"
      description={`Please read these Terms of Service carefully before accessing or using the ${BRAND_CONFIG.name} platform operated by ${BRAND_CONFIG.legalName}.`}
    >
      {/* Real Estate Advice Disclaimer Alert */}
      <div className="rounded-xl border border-amber-300/50 bg-amber-50/70 p-5 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span>Notice Regarding Real Estate Analytics & Investment Risk</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-amber-900/90 dark:text-amber-300/90">
          {BRAND_CONFIG.name} provides computational property intelligence, public cadastral data compilation, spatial comp aggregations, and probabilistic modeling. <strong>We do not provide licensed real estate brokerage, legal, tax, appraisal, or financial investment advisory services.</strong> All scores, Prophecy forecasts, expected profits, and valuation metrics are automated computational estimates for educational and workflow analysis. You agree to perform independent physical, title, and legal due diligence before making any acquisition or financial commitment.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
        <p>
          By creating an account, accessing, browsing, or utilizing any services provided by{" "}
          <strong>{BRAND_CONFIG.legalName}</strong> (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) through the website located at{" "}
          <a href={`https://${BRAND_CONFIG.domain}`} className="text-primary hover:underline">
            {BRAND_CONFIG.domain}
          </a>{" "}
          and affiliated applications (collectively, the &ldquo;Service&rdquo;), you (&ldquo;User&rdquo;, &ldquo;Customer&rdquo;, or &ldquo;You&rdquo;) agree to be legally bound by these Terms of Service. If you do not agree to all terms and conditions, you must immediately discontinue use of the Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">2. Description of the Service</h2>
        <p>
          {BRAND_CONFIG.name} is a software-as-a-service (SaaS) platform offering real estate investors, analysts, and operators tools for:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-xs">
          <li>Automated cadastral parcel search and geospatial mapping</li>
          <li>Monte Carlo risk-adjusted deal ranking and buy-score calculations</li>
          <li>Comparative market analysis (comps) indexing and radius scoring</li>
          <li>Aggregated public notice and auction tracking (sheriff, trustee, tax sales)</li>
          <li>Predictive algorithmic trajectory models (Prophecy engine)</li>
        </ul>
        <p>
          We continuously update and refine our algorithms and data pipelines. We reserve the right to modify, suspend, or discontinue any feature, dataset, or coverage area at our discretion.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">3. Merchant of Record, Subscriptions, and Payments</h2>
        <p>
          Our order process is conducted by our online reseller and Merchant of Record, <strong>Paddle.com</strong> (&ldquo;Paddle&rdquo;). Paddle handles customer service inquiries, billing inquiries, transaction processing, and returns.
        </p>
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-xs">
          <p>
            <strong>Billing Cycles:</strong> Paid subscriptions (Starter, Pro, Enterprise) are billed in advance on a recurring monthly or annual basis depending on the plan selected at checkout.
          </p>
          <p>
            <strong>Auto-Renewal:</strong> Subscriptions automatically renew at the conclusion of each billing period unless cancelled by the Customer prior to the renewal date.
          </p>
          <p>
            <strong>Cancellations:</strong> You may cancel your subscription at any time directly through your account billing portal or by contacting{" "}
            <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="text-primary hover:underline font-medium">
              {BRAND_CONFIG.supportEmail}
            </a>
            . Cancellation stops future renewals while preserving access until the end of your prepaid period.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">4. Refund & Cancellation Policy</h2>
        <p>
          We stand firmly behind the quality of {BRAND_CONFIG.name}. We offer a transparent <strong>30-Day Money-Back Guarantee</strong> on all initial subscription purchases. Please refer to our complete{" "}
          <a href="/refunds" className="text-primary font-semibold hover:underline">
            Refund & Cancellation Policy
          </a>{" "}
          for detailed eligibility and instructions on how to request a refund.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">5. Acceptable Use & Conduct</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground text-xs">
          <li>Systematically scrape, exfiltrate, or harvest bulk parcel records, comp databases, or algorithmic outputs using automated bots, crawlers, or scripts outside official platform interfaces.</li>
          <li>Resell, sublicense, redistribute, or commercially syndicate platform data without prior written authorization from {BRAND_CONFIG.legalName}.</li>
          <li>Attempt to reverse-engineer, decompile, or disassemble our underlying scoring algorithms, Prophecy models, or neural pipelines.</li>
          <li>Use the Service for any unlawful purpose, in violation of Fair Housing laws, or in any manner that infringes on property owner rights.</li>
          <li>Circumvent or attempt to circumvent security controls, user authentication, quota limiters, or rate limiters.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">6. Intellectual Property</h2>
        <p>
          The Service, including software code, UI designs, logos, trademarks, data schemas, mathematical score weightings, and visual assets, is the exclusive property of <strong>{BRAND_CONFIG.legalName}</strong> and its licensors and is protected by United States and international copyright, trademark, and trade secret laws.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">7. Public Records & Third-Party Data Sources</h2>
        <p>
          {BRAND_CONFIG.name} synthesizes data from public municipal assessor rolls, county clerk offices, FEMA flood hazard databases, geographic GIS files, and third-party parcel APIs. <strong>Public records may contain clerical errors, indexing delays, or omissions outside our control.</strong> {BRAND_CONFIG.legalName} does not guarantee the continuous availability, timeliness, or accuracy of third-party public data sources.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">8. Disclaimer of Warranties</h2>
        <div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground leading-relaxed">
          THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR ACCURATE.
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">9. Limitation of Liability</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL {BRAND_CONFIG.legalName.toUpperCase()}, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR RESELLERS (INCLUDING PADDLE.COM) BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING LOSS OF PROFITS, LOSS OF INVESTMENT, OR DATA LOSS, ARISING OUT OF OR IN CONNECTION WITH THE USE OF OR INABILITY TO USE THE SERVICE. OUR MAXIMUM TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO THE COMPANY IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">10. Governing Law & Jurisdiction</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the United States and the State of Delaware, without regard to its conflict of law principles. Any legal suit or proceeding arising out of or related to these Terms shall be instituted exclusively in the federal or state courts situated therein.
        </p>
      </section>

      <section className="space-y-3 border-t border-border pt-6">
        <h2 className="text-lg font-bold text-foreground">11. Contact Information</h2>
        <p>
          If you have questions, feedback, or legal inquiries regarding these Terms of Service, please contact us at:
        </p>
        <div className="rounded-lg border border-border bg-muted/20 p-4 text-xs space-y-1">
          <p className="font-semibold text-foreground">{BRAND_CONFIG.legalName}</p>
          <p className="text-muted-foreground">Attention: Legal & Compliance</p>
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
