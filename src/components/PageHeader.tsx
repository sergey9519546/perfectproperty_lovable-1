import type { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

const ANALYTICAL_TABS = [
  { to: "/deals", label: "Ranked Deals" },
  { to: "/workspace", label: "Live Map" },
  { to: "/sheriff-sales", label: "Sheriff Auctions" },
  { to: "/shadow", label: "Off-Market Leads" },
  { to: "/prophecy", label: "Predicted Listings" },
  { to: "/notices", label: "Notice Reader" },
  { to: "/accuracy", label: "Model Accuracy" },
  { to: "/monitoring", label: "Risk & Health" },
];

const ADMIN_TABS = [
  { to: "/admin", label: "Ingestion Adapters" },
  { to: "/admin/health", label: "Pipeline Health" },
  { to: "/admin/analytics", label: "Product KPIs & Telemetry" },
];

/**
 * Institutional page header used across all analytical and admin routes.
 * Ensures strict typographic hierarchy, baseline alignment, unique element ID,
 * and seamless interconnectivity across all analytical surfaces.
 */
export function PageHeader({
  title,
  sub,
  icon,
  badge,
  actions,
  breadcrumbs,
  showQuickNav = true,
  customTabs,
  navLabel,
  id,
}: {
  title: string;
  sub: string;
  icon?: ReactNode;
  badge?: string;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  showQuickNav?: boolean;
  customTabs?: { to: string; label: string }[];
  navLabel?: string;
  id?: string;
}) {
  const headerId = id || `page-header-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const pathname = useLocation({ select: (location) => location.pathname });

  const isAdminRoute = pathname.startsWith("/admin");
  const activeTabs = customTabs || (isAdminRoute ? ADMIN_TABS : ANALYTICAL_TABS);
  const activeNavLabel = navLabel || (isAdminRoute ? "Admin Console:" : "Pipeline:");

  return (
    <div id={`${headerId}-wrapper`} className="space-y-4">
      {/* Optional Breadcrumb Trail */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          {breadcrumbs.map((bc, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
              {bc.to ? (
                <Link to={bc.to} className="hover:text-foreground transition-colors">
                  {bc.label}
                </Link>
              ) : (
                <span className="font-semibold text-foreground">{bc.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Main Header Row */}
      <header
        id={headerId}
        className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="flex min-w-0 items-start gap-3.5">
          {icon ? <div className="mt-1 shrink-0 text-primary">{icon}</div> : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              {badge && (
                <span className="text-xs font-semibold text-muted-foreground flex items-center">
                  <span aria-hidden="true" className="mx-2 opacity-50">/</span>
                  {badge}
                </span>
              )}
            </div>
            <p className="mt-1.5 max-w-[75ch] text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {sub}
            </p>
          </div>
        </div>
        {actions ? <div className="shrink-0 flex items-center gap-2.5">{actions}</div> : null}
      </header>

      {/* Cross-Page Intelligence Sub-Nav Bar */}
      {showQuickNav && (
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 pr-2 shrink-0">
            {activeNavLabel}
          </span>
          {activeTabs.map((tab) => {
            const isActive =
              tab.to === "/admin"
                ? pathname === "/admin" || pathname === "/admin/"
                : pathname === tab.to || pathname.startsWith(`${tab.to}/`);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors shrink-0",
                  isActive
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
