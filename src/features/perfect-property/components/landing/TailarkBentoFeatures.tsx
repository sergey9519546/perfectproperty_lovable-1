import { motion } from 'motion/react';
import {
  MapPin,
  Layers,
  Gavel,
  Calculator,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileSearch,
  ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

export function TailarkBentoFeatures() {
  return (
    <section
      id="tailark-bento-features"
      className="border-b border-border bg-background py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header: Clear, welcoming, and thoughtful */}
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            Built for Smart Property Buyers
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
            Everything you need to buy with total confidence.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Replace messy county clerk searches, manual spreadsheets, and auction flyer guesswork with transparent, verified numbers that make complete sense.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Property Boundaries & Lot Dimensions (2 cols wide on desktop) */}
          <div
            id="tailark-bento-card-gis"
            className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Interactive Boundaries & Lot Dimensions</h3>
                    <p className="text-xs text-muted-foreground">Exact lot sizes, yard frontage & residential zoning</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  Parcel APN: 14-06-218-012
                </span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                See exact lot dimensions, street frontage, yard setbacks, alley access, and residential zoning without visiting the county records office or ordering expensive surveys.
              </p>
            </div>

            {/* Interactive Lot Dimensions Visual Display */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-foreground">ZONING: 3-UNIT RESIDENTIAL</span>
                </div>
                <span className="text-muted-foreground font-medium">LOT SIZE: 3,125 SQ FT (25&apos; × 125&apos;)</span>
              </div>

              {/* Lot Drawing SVG */}
              <div className="relative h-44 w-full rounded-lg border border-border bg-card/80 flex items-center justify-center overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 160" fill="none">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="cadastre-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/15" />
                    </pattern>
                  </defs>
                  <rect width="500" height="160" fill="url(#cadastre-grid)" />

                  {/* Adjacent Lots */}
                  <rect x="40" y="25" width="110" height="110" fill="currentColor" className="text-muted/40" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="95" y="85" textAnchor="middle" className="text-[10px] fill-muted-foreground font-medium">Neighboring Lot</text>

                  <rect x="350" y="25" width="110" height="110" fill="currentColor" className="text-muted/40" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="405" y="85" textAnchor="middle" className="text-[10px] fill-muted-foreground font-medium">Neighboring Lot</text>

                  {/* Target Parcel Highlight */}
                  <rect x="170" y="20" width="160" height="120" fill="currentColor" className="text-primary/10 stroke-primary" stroke="currentColor" strokeWidth="2" />
                  
                  {/* Boundary Dimension Callouts */}
                  <text x="250" y="15" textAnchor="middle" className="text-[11px] font-bold fill-primary font-mono">25.0 FT STREET FRONTAGE</text>
                  <text x="338" y="85" textAnchor="start" className="text-[11px] font-bold fill-primary font-mono">125.0 FT DEPTH</text>
                  
                  {/* Footprint Inside Target */}
                  <rect x="195" y="45" width="110" height="70" fill="currentColor" className="text-primary/20" stroke="currentColor" strokeWidth="1" />
                  <text x="250" y="82" textAnchor="middle" className="text-[11px] font-bold fill-foreground">MAIN BUILDING</text>
                  <text x="250" y="98" textAnchor="middle" className="text-[10px] fill-muted-foreground">2,850 sq ft • 3 Apartments</text>
                </svg>

                {/* Spatial unboxed tags */}
                <div className="absolute bottom-2 left-2 flex items-center gap-2 text-[11px] text-muted-foreground bg-card/90 px-2 py-1 rounded border border-border">
                  <span>Permitted: Multi-Family</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Low Flood Risk (No Flood Insurance Required)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Foreclosure & Courthouse Auctions (1 col) */}
          <div
            id="tailark-bento-card-sheriff"
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-all"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Gavel className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Foreclosure & Sheriff Auctions</h3>
                  <p className="text-xs text-muted-foreground">Upcoming courthouse sales & opening bids</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Track court foreclosure dates, starting upset bids, bank judgments, and the exact cashier check deposit required to bid at the courthouse.
              </p>
            </div>

            {/* Live Auction Card */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border/80">
                <span className="font-semibold text-foreground">Cook County Court Auction</span>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  Auction in 4 Days
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground text-[11px]">Bank Judgment:</span>
                  <p className="font-mono font-bold text-foreground num">$312,450</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">Starting Bid:</span>
                  <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 num">$195,000</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">Required 10% Deposit:</span>
                  <p className="font-mono font-bold text-foreground num">$19,500</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">Foreclosing Lender:</span>
                  <p className="font-medium text-foreground truncate">JPMorgan Chase</p>
                </div>
              </div>

              <Link to="/sheriff-sales" className="block pt-1">
                <Button variant="outline" size="sm" className="w-full text-xs h-8 cursor-pointer">
                  <span>Browse Foreclosure Calendar</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 3: Instant Profit & Maximum Offer Calculator (1 col) */}
          <div
            id="tailark-bento-card-underwrite"
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-all"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Smart Max Bid Calculator</h3>
                  <p className="text-xs text-muted-foreground">Never overpay or make a blind offer</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Our formula factors in recent neighborhood sales comps, estimated repairs, and closing costs so you know the exact maximum price to offer to guarantee your profit.
              </p>
            </div>

            {/* Financial Numbers Breakdown */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Market Resale Value (Comps):</span>
                <span className="font-mono font-bold text-foreground num">$540,000</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Estimated Repairs:</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 num">-$75,000</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Your Safe Maximum Bid:</span>
                <span className="font-mono font-bold text-primary num">$303,000</span>
              </div>
              <div className="border-t border-border/80 pt-2 flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">Estimated Net Profit:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 num">+$162,000</span>
              </div>
            </div>
          </div>

          {/* Card 4: Hidden Debt & Lien Priority Scanner (2 cols wide on desktop) */}
          <div
            id="tailark-bento-card-liens"
            className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Hidden Debt & Back-Taxes Checker</h3>
                    <p className="text-xs text-muted-foreground">Second mortgages, city water bills & past-due liens</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Title Status: Clean & Safe to Bid
                </span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Avoid nasty auction surprises. We automatically verify whether second mortgages get wiped out by the foreclosure, and flag any unpaid water bills or back taxes you would need to settle.
              </p>
            </div>

            {/* Lien Priority Table */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground">
                    <th className="pb-2 font-medium">Lien or Debt Type</th>
                    <th className="pb-2 font-medium">Amount on Record</th>
                    <th className="pb-2 font-medium">Recorded Date</th>
                    <th className="pb-2 font-medium">What Happens at Auction?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="py-2.5 font-medium text-foreground">1st Mortgage (Foreclosing Bank)</td>
                    <td className="py-2.5 font-mono text-foreground num">$285,000</td>
                    <td className="py-2.5 text-muted-foreground">04/12/2018</td>
                    <td className="py-2.5 text-foreground font-medium">
                      Wiped clean at auction
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-foreground">2nd Mortgage (HELOC)</td>
                    <td className="py-2.5 font-mono text-foreground num">$45,000</td>
                    <td className="py-2.5 text-muted-foreground">09/18/2021</td>
                    <td className="py-2.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      Wiped out completely (You do NOT owe this)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-foreground">City Water Department Bill</td>
                    <td className="py-2.5 font-mono text-rose-600 dark:text-rose-400 num">$1,180</td>
                    <td className="py-2.5 text-muted-foreground">Current</td>
                    <td className="py-2.5 text-amber-600 dark:text-amber-400 font-medium">
                      Survives (Buyer settles upon deed transfer)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
