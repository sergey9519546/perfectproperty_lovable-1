import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { HeroHeader } from '@/components/hero-section-2-header';
import {
  Sparkles,
  ArrowRight,
  Gavel,
  ShieldCheck,
  Building2,
  TrendingUp,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export interface HeroSection2Props {
  onExplore?: (query?: string, mode?: 'Deals' | 'Shadow') => void;
}

export default function HeroSection({ onExplore }: HeroSection2Props) {
  const handleLaunch = () => {
    if (onExplore) {
      onExplore();
    }
  };

  return (
    <div id="tailark-hero-section-2-root" className="min-h-screen bg-background">
      <HeroHeader />
      <main className="overflow-hidden">
        <section className="before:bg-muted/30 border-b border-border relative overflow-hidden before:absolute before:inset-1 before:h-[calc(100%-8rem)] before:rounded-2xl sm:before:inset-2 md:before:rounded-[2.5rem] lg:before:h-[calc(100%-14rem)]">
          <div className="py-24 md:py-36">
            <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
              <div>
                {/* Announcement pill */}
                <Link
                  to="/sheriff-sales"
                  className="hover:bg-foreground/5 mx-auto inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card/80 py-1 pl-1.5 pr-3.5 text-xs font-semibold text-foreground transition-all duration-150 shadow-2xs"
                >
                  <div
                    aria-hidden="true"
                    className="border-background bg-gradient-to-b from-primary to-foreground relative flex size-5 items-center justify-center rounded-full border shadow-2xs"
                  >
                    <Sparkles className="size-3 text-white" />
                  </div>
                  <span className="font-medium text-foreground">
                    Introducing Cook County Sheriff Auction Radar 2.0
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground ml-0.5" />
                </Link>

                {/* Headline */}
                <h1 className="mx-auto mt-8 max-w-4xl text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.12]">
                  Underwrite 10x Faster with{' '}
                  <span className="text-primary font-bold">Perfect Property</span>
                </h1>

                {/* Subtitle */}
                <p className="text-muted-foreground mx-auto my-6 max-w-2xl text-balance text-lg sm:text-xl leading-relaxed">
                  Sub-meter Cook County cadastre, chancery court docket feeds, and algorithmic financial underwriting for institutional acquisitions teams.
                </p>

                {/* CTA Buttons with RainbowButton */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                  <RainbowButton
                    onClick={handleLaunch}
                    className="h-12 px-8 text-sm font-semibold shadow-lg cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span>Get Unlimited Access</span>
                  </RainbowButton>

                  <Link to="/sheriff-sales">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 px-6 rounded-xl font-medium border-border hover:bg-muted"
                    >
                      <Gavel className="h-4 w-4 mr-2 text-primary" />
                      <span>Explore Sheriff Sales</span>
                    </Button>
                  </Link>
                </div>

                {/* Verified Metrics Strip */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>$4.8B+ Underwritten Deals</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>18,400+ Cook County Parcels</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Real-time Chancery Dockets</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Interface Stage Visual */}
            <div className="relative mt-12 md:mt-16">
              <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
                <div className="bg-card rounded-2xl relative mx-auto overflow-hidden border border-border shadow-2xl ring-1 ring-border/50">
                  {/* Mock browser chrome */}
                  <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-destructive/60" />
                      <span className="h-3 w-3 rounded-full bg-amber-400/60" />
                      <span className="h-3 w-3 rounded-full bg-emerald-500/60" />
                    </div>
                    <div className="flex items-center gap-2 rounded-md border border-border/80 bg-background px-3 py-1 text-[11px] font-mono text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>app.perfectproperty.com/workspace?apn=17-15-300-012</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                      <span>LIVE FEED</span>
                    </div>
                  </div>

                  {/* App Screen Content Preview */}
                  <div className="p-6 md:p-8 bg-card grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-primary">
                            Cook County Civil Auction Docket
                          </span>
                          <h3 className="text-xl font-bold text-foreground">
                            1428 S Michigan Ave, Chicago, IL
                          </h3>
                        </div>
                        <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-mono font-bold text-emerald-600">
                          32% Under Market ARV
                        </span>
                      </div>

                      {/* Map & Lot Overlay Visual */}
                      <div className="relative h-64 rounded-xl border border-border bg-muted/40 overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
                        <div className="relative z-10 text-center p-4">
                          <Building2 className="h-10 w-10 text-primary mx-auto mb-2 opacity-80" />
                          <p className="text-sm font-semibold text-foreground">
                            Sub-Meter GIS Lot Geometry
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Parcel PIN: 17-15-300-012-0000 · 8,400 SF Lot
                          </p>
                          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-mono font-medium text-foreground shadow-2xs">
                            <MapPin className="h-3 w-3 text-primary" />
                            <span>Zoning: DX-12 Downtown Mixed-Use</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pro-forma Card Sidebar */}
                    <div className="rounded-xl border border-border bg-muted/20 p-5 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="border-b border-border pb-3">
                          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                            Sheriff Upset Price
                          </span>
                          <div className="text-2xl font-black text-foreground mt-0.5">
                            $385,000
                          </div>
                        </div>

                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Estimated ARV</span>
                            <span className="font-mono font-bold text-foreground">$565,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Required 10% Cashier</span>
                            <span className="font-mono font-bold text-foreground">$38,500</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Modeled Cap Rate</span>
                            <span className="font-mono font-bold text-emerald-600">8.4% Net</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Lien Cloud Risk</span>
                            <span className="font-mono font-bold text-emerald-600">Low (Senior 1st)</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-border">
                        <Button
                          onClick={handleLaunch}
                          className="w-full h-10 rounded-xl font-semibold text-xs"
                        >
                          <span>Underwrite This Parcel</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export { HeroSection as HeroSection2 };
