import type { ReactNode } from "react";

/**
 * Institutional page header used across all analytical routes.
 * Ensures strict typographic hierarchy, baseline alignment, and unique element ID.
 */
export function PageHeader({
  title,
  sub,
  icon,
  badge,
  actions,
  id,
}: {
  title: string;
  sub: string;
  icon?: ReactNode;
  badge?: string;
  actions?: ReactNode;
  id?: string;
}) {
  const headerId = id || `page-header-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <header
      id={headerId}
      className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-[#E2E8F0] pb-6 sm:flex sm:items-end sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3.5">
        {icon ? <div className="mt-1 shrink-0 text-[#2F5FFF]">{icon}</div> : null}
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-bold leading-tight tracking-tight text-[#0F172A] sm:text-[32px]">
              {title}
            </h1>
            {badge && (
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-blue-700">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-1.5 max-w-[75ch] text-[14px] leading-relaxed text-[#475569]">
            {sub}
          </p>
        </div>
      </div>
      {actions ? <div className="shrink-0 flex items-center gap-2.5">{actions}</div> : null}
    </header>
  );
}
