import { ShieldCheck, Activity } from 'lucide-react';
import { Brand } from "@/features/perfect-property/components/Brand";
import { Link } from '@tanstack/react-router';

export function TailarkFooter() {
  return (
    <footer
      id="tailark-footer"
      className="border-t border-border bg-background py-14 text-sm text-muted-foreground"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-border/80">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Brand id="tailark-footer-brand" compact={false} iconClassName="h-7 w-7 shrink-0 text-primary" textClassName="text-[14px] font-bold tracking-[0.12em] text-foreground inline" />
            <p className="text-xs leading-relaxed max-w-sm">
              Institutional real estate intelligence terminal. Sub-meter GIS parcel boundaries, chancery court docket feeds, and algorithmic financial underwriting for acquisitions teams.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] font-medium text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cook County GIS & Sheriff Dockets Live</span>
            </div>
          </div>

          {/* Navigation Col 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Platform Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/deals" className="hover:text-foreground transition-colors">
                  Top Deals & Portfolio
                </Link>
              </li>
              <li>
                <Link to="/workspace" className="hover:text-foreground transition-colors">
                  Underwrite Map Canvas
                </Link>
              </li>
              <li>
                <Link to="/sheriff-sales" className="hover:text-foreground transition-colors">
                  Foreclosure Auctions
                </Link>
              </li>
              <li>
                <Link to="/notices" className="hover:text-foreground transition-colors">
                  Legal Notice Parser
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Col 2: Account & Pricing */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Plans & Access
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/pricing" className="hover:text-foreground transition-colors">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-foreground transition-colors">
                  Investor Login
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-foreground transition-colors">
                  Money-Back Guarantee
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-foreground transition-colors">
                  Data Pipeline Health
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Col 3: Legal & Regulatory */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Compliance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/notices" className="hover:text-foreground transition-colors">
                  Court Records Disclosures
                </Link>
              </li>
              <li>
                <Link to="/refunds" className="hover:text-foreground transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and disclaimer */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>
            &copy; {new Date().getFullYear()} Profit Property Intelligence Inc. Built with Tailark architecture.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>SOC-2 Type II Certified Data Pipeline</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
