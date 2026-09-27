import { Sparkles, ArrowRight, Gavel, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { Link } from '@tanstack/react-router';

export interface TailarkCTAProps {
  onExplore: () => void;
}

export function TailarkCTA({ onExplore }: TailarkCTAProps) {
  return (
    <section
      id="tailark-cta-section"
      className="relative overflow-hidden border-b border-border bg-muted/20 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-border bg-card p-8 sm:p-12 md:p-16 text-center shadow-sm overflow-hidden">
          {/* Subtle background glow */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-full max-w-2xl rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Instant Capital Deployment</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
              Ready to underwrite your next deal with institutional precision?
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Join leading private real estate operators, family offices, and foreclosure auction bidders across Cook County and greater Chicagoland.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <RainbowButton
                id="tailark-cta-main-launch"
                onClick={onExplore}
                className="h-12 px-8 text-base shadow-lg"
              >
                <span>Get Unlimited Access</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </RainbowButton>

              <Link to="/sheriff-sales">
                <Button
                  id="tailark-cta-main-sheriff"
                  variant="outline"
                  size="lg"
                  className="h-12 px-7 rounded-xl font-medium border-border hover:bg-muted"
                >
                  <Gavel className="h-4 w-4 mr-2 text-primary" />
                  <span>Inspect Sheriff Sales</span>
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Instant Access</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Sub-Meter Cook County Cadastre</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Chancery Court Docket Feeds</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
