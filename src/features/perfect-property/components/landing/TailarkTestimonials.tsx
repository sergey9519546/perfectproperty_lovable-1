import { Star, ShieldCheck, CheckCircle2 } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      "We bought 14 foreclosure parcels at the Cook County Sheriff auction last quarter. Tailark's title risk radar saved us from bidding on a property with a $78,000 surviving municipal water lien that everyone else missed.",
    author: 'Marcus Vance',
    role: 'Principal Acquisitions Lead',
    firm: 'Apex Urban Capital',
    stat: '$16.4M Acquired in 2024',
    rating: 5,
  },
  {
    quote:
      "Sub-meter cadastral boundaries and instant zoning classification cut our initial underwriting time from 45 minutes on county GIS portals down to 3 seconds. The speed advantage on off-market deals is unmatched.",
    author: 'Elena Rostova',
    role: 'Managing Director',
    firm: 'Windy City Property Syndicate',
    stat: '420+ Deals Underwritten',
    rating: 5,
  },
  {
    quote:
      "The chancery court docket tracking and upset limit notifications give our family office institutional parity with the biggest distressed funds in Chicago. Absolutely essential tooling.",
    author: 'David Chen',
    role: 'Chief Investment Officer',
    firm: 'Lakeshore Real Estate Partners',
    stat: '100% Title Accuracy',
    rating: 5,
  },
];

export function TailarkTestimonials() {
  return (
    <section
      id="tailark-testimonials-section"
      className="border-b border-border bg-background py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Institutional Conviction</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
            Trusted by active acquisitions teams and auction bidders.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item, idx) => (
            <div
              key={item.author}
              id={`tailark-testimonial-card-${idx}`}
              className="rounded-2xl border border-border bg-card p-6 sm:p-7 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-all"
            >
              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500" />
                  ))}
                </div>

                <p className="text-sm text-foreground/90 leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-border/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      {item.author}
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.role}, {item.firm}
                    </p>
                  </div>
                  <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-mono font-semibold text-primary">
                    {item.stat}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
