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
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Institutional Underwriting Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
            Engineered for institutional speed. Grounded in legal public records.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Replace fragmented county recorder searches, manual spreadsheets, and auction flyer guesswork with a unified cartographic intelligence system.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Sub-Meter Cadastral & GIS Parcel Engine (2 cols wide on desktop) */}
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
                    <h3 className="text-lg font-bold text-foreground">Sub-Meter Parcel Cadastre</h3>
                    <p className="text-xs text-muted-foreground">Spatial boundary polygons & zoning overlays</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary bg-primary/5">
                  APN: 14-06-218-012
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Direct integration with county parcel shapes reveals exact lot dimensions, setbacks, alley access, easements, and municipal zoning envelopes before committing capital.
              </p>
            </div>

            {/* Interactive Cadastral SVG Display */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-mono font-medium text-foreground">ZONING: R-4 RESIDENTIAL</span>
                </div>
                <span className="text-muted-foreground font-mono">LOT SIZE: 3,125 SQ FT (25&apos; × 125&apos;)</span>
              </div>

              {/* Cadastral Lot Drawing SVG */}
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
                  <text x="95" y="85" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">LOT 11 (ADJ)</text>

                  <rect x="350" y="25" width="110" height="110" fill="currentColor" className="text-muted/40" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="405" y="85" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">LOT 13 (ADJ)</text>

                  {/* Target Parcel Highlight */}
                  <rect x="170" y="20" width="160" height="120" fill="currentColor" className="text-primary/10 stroke-primary" stroke="currentColor" strokeWidth="2" />
                  
                  {/* Boundary Dimension Callouts */}
                  <text x="250" y="15" textAnchor="middle" className="text-[11px] font-bold fill-primary font-mono">25.0 FT WIDTH (STREET FRONTAGE)</text>
                  <text x="338" y="85" textAnchor="start" className="text-[11px] font-bold fill-primary font-mono">125.0 FT DEPTH</text>
                  
                  {/* Footprint Inside Target */}
                  <rect x="195" y="45" width="110" height="70" fill="currentColor" className="text-primary/20" stroke="currentColor" strokeWidth="1" />
                  <text x="250" y="82" textAnchor="middle" className="text-[11px] font-bold fill-foreground font-mono">3-FLAT FOOTPRINT</text>
                  <text x="250" y="98" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">2,850 GSF • 3 UNITS</text>
                </svg>

                {/* Spatial pill tags */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                  <span className="rounded bg-background/90 px-2 py-0.5 text-[10px] font-mono font-semibold border border-border text-foreground">
                    FAR: 1.20
                  </span>
                  <span className="rounded bg-background/90 px-2 py-0.5 text-[10px] font-mono font-semibold border border-border text-emerald-600 dark:text-emerald-400">
                    FEMA: ZONE X (NO FLOOD)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Sheriff & Foreclosure Auction Radar (1 col) */}
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
                  <h3 className="text-lg font-bold text-foreground">Sheriff Auction Radar</h3>
                  <p className="text-xs text-muted-foreground">Chancery court docket intelligence</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Monitor judicial foreclosure filings, scheduled sale dates, upset limits, plaintiff judgments, and required deposit amounts before court steps.
              </p>
            </div>

            {/* Live Docket Simulation Card */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border/80">
                <span className="font-mono font-bold text-foreground">DOCKET: 2024-CH-04812</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Sale in 4 Days
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground text-[11px]">Judgment Amount:</span>
                  <p className="font-mono font-bold text-foreground">$312,450</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">Upset Limit:</span>
                  <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">$195,000</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">Required 10% Deposit:</span>
                  <p className="font-mono font-bold text-foreground">$19,500</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">Plaintiff Lender:</span>
                  <p className="font-medium text-foreground truncate">JPMorgan Chase</p>
                </div>
              </div>

              <Link to="/sheriff-sales" className="block pt-1">
                <Button variant="outline" size="sm" className="w-full text-xs h-8">
                  <span>View Live Auction Radar</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 3: Algorithmic Underwriting & Cap Rate Engine (1 col) */}
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
                  <h3 className="text-lg font-bold text-foreground">Algorithmic Underwriting</h3>
                  <p className="text-xs text-muted-foreground">DSCR, Cap Rate & MAO pro-formas</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Automated rent comps, rehab budget tiering, and financing debt stress tests deliver an institutional score and max allowable offer in under 2 seconds.
              </p>
            </div>

            {/* Financial Metrics Strip */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Projected ARV:</span>
                <span className="font-mono font-bold text-foreground">$540,000</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Estimated Rehab (Heavy):</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">-$75,000</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Max Allowable Offer (MAO):</span>
                <span className="font-mono font-bold text-primary">$303,000</span>
              </div>
              <div className="border-t border-border/80 pt-2 flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">Pro-Forma Cap Rate:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">8.9% (DSCR 1.45x)</span>
              </div>
            </div>
          </div>

          {/* Card 4: Title & Lien Priority Risk Scanner (2 cols wide on desktop) */}
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
                    <h3 className="text-lg font-bold text-foreground">Clouded Title & Lien Priority Radar</h3>
                    <p className="text-xs text-muted-foreground">Surviving municipal liens & redemption audits</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5">
                  Overall Title Risk: Clean
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Avoid costly auction traps. Instantly identify senior liens that survive a foreclosure sale, unreleased mechanics liens, water department debt, and statutory redemption rights.
              </p>
            </div>

            {/* Lien Priority Table Preview */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground">
                    <th className="pb-2 font-medium">Lien / Claim Type</th>
                    <th className="pb-2 font-medium">Recorded Amount</th>
                    <th className="pb-2 font-medium">Recorded Date</th>
                    <th className="pb-2 font-medium">Auction Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="py-2.5 font-medium text-foreground">1st Deed of Trust (Foreclosing)</td>
                    <td className="py-2.5 font-mono text-foreground">$285,000</td>
                    <td className="py-2.5 text-muted-foreground">04/12/2018</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 font-medium text-muted-foreground text-[11px]">
                        Foreclosing Senior
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-foreground">2nd HELOC Junior Lien</td>
                    <td className="py-2.5 font-mono text-foreground">$45,000</td>
                    <td className="py-2.5 text-muted-foreground">09/18/2021</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 font-semibold text-[11px]">
                        Extinguished upon Sale
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-foreground">City Water Department Debt</td>
                    <td className="py-2.5 font-mono text-rose-600 dark:text-rose-400">$1,180</td>
                    <td className="py-2.5 text-muted-foreground">Current</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 font-semibold text-[11px]">
                        Survives (Buyer Pays)
                      </span>
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
