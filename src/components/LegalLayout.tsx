import { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Footer } from "@/features/perfect-property/components/landing/Footer";
import { BRAND_CONFIG } from "@/lib/brand";
import { ShieldCheck, FileText, RefreshCw, Mail, Building2, HelpCircle } from "lucide-react";

interface LegalLayoutProps {
  id?: string;
  title: string;
  lastUpdated?: string;
  badge?: string;
  description: string;
  children: ReactNode;
}

export function LegalLayout({
  id = "legal-layout-container",
  title,
  lastUpdated = "September 9, 2026",
  badge = "Official Policy",
  description,
  children,
}: LegalLayoutProps) {
  const pathname = useLocation({ select: (l) => l.pathname });

  const tabs = [
    {
      to: "/terms",
      label: "Terms of Service",
      icon: FileText,
      active: pathname === "/terms",
    },
    {
      to: "/privacy",
      label: "Privacy Policy",
      icon: ShieldCheck,
      active: pathname === "/privacy",
    },
    {
      to: "/refunds",
      label: "Refund & Cancellation",
      icon: RefreshCw,
      active: pathname === "/refunds",
    },
  ];

  return (
    <div id={id} className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      {/* Hero Header */}
      <section
        id="legal-hero-banner"
        className="relative border-b border-border bg-card/60 backdrop-blur-xs pt-12 pb-8 sm:pt-16 sm:pb-12"
      >
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              {badge}
            </span>
            <span className="text-xs text-muted-foreground">
              Last updated: {lastUpdated}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs font-medium text-muted-foreground">
              Entity: {BRAND_CONFIG.legalName}
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* Quick Switcher Nav */}
          <div
            id="legal-tabs-navigation"
            className="mt-8 flex flex-wrap items-center gap-2 border-t border-border pt-4"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                    tab.active
                      ? "bg-foreground text-background shadow-xs"
                      : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main id="legal-content-main" className="flex-1 py-12">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left/Main Column: Legal text */}
            <article className="lg:col-span-8 space-y-8 text-foreground/90 text-sm leading-relaxed">
              {children}
            </article>

            {/* Right Column: Entity & Merchant Verification Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              <div
                id="legal-entity-card"
                className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-4"
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>Operating Company</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">
                    {BRAND_CONFIG.legalName}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Operating the {BRAND_CONFIG.name} platform
                  </div>
                </div>
                <div className="border-t border-border pt-3 space-y-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">Website: </span>
                    <a
                      href={`https://${BRAND_CONFIG.domain}`}
                      className="text-primary hover:underline"
                    >
                      {BRAND_CONFIG.domain}
                    </a>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Email: </span>
                    <a
                      href={`mailto:${BRAND_CONFIG.supportEmail}`}
                      className="text-primary hover:underline"
                    >
                      {BRAND_CONFIG.supportEmail}
                    </a>
                  </div>
                </div>
              </div>

              <div
                id="paddle-merchant-card"
                className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Merchant of Record</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our order process is conducted by our online reseller <strong className="text-foreground">Paddle.com</strong>. Paddle is the Merchant of Record for all orders, providing customer service and handling returns, invoicing, and tax compliance globally.
                </p>
                <div className="rounded-lg bg-muted/60 p-3 text-[11px] text-muted-foreground">
                  <strong>Paddle.com Market Ltd.</strong>
                  <br />
                  Judd House, 18-29 Mora Street, London EC1V 8BT, UK
                </div>
              </div>

              <div
                id="support-contact-card"
                className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <HelpCircle className="h-4 w-4 text-amber-600" />
                  <span>Questions or Support?</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Need assistance with your account, billing, cancellation, or data privacy requests?
                </p>
                <a
                  id="legal-sidebar-support-link"
                  href={`mailto:${BRAND_CONFIG.supportEmail}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background shadow-xs hover:bg-slate-800 cursor-pointer"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Contact Support Team</span>
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
