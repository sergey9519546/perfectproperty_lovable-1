import { ShieldCheck, Database, Landmark, FileText, Map, Activity } from 'lucide-react';

const INTEGRATIONS = [
  {
    name: 'County Sheriff Auctions',
    role: 'Verified Court Sales & Opening Bids',
    icon: Landmark,
    status: 'Live Synced',
  },
  {
    name: 'Official Property Records',
    role: 'Exact Lot Lines & Zoning Codes',
    icon: Map,
    status: 'Direct County Feed',
  },
  {
    name: 'Recorder of Deeds',
    role: 'Mortgage Liens & Tax Arrears',
    icon: FileText,
    status: 'Continuous Audit',
  },
  {
    name: 'Neighborhood Sales Comps',
    role: 'Recent Arms-Length Sold Prices',
    icon: Database,
    status: 'Daily Updates',
  },
  {
    name: 'FEMA Flood Risk Database',
    role: 'Flood Zone & Elevation Hazard',
    icon: ShieldCheck,
    status: 'Zone Verified',
  },
  {
    name: 'USPS Address Database',
    role: 'Occupancy & Vacancy Verification',
    icon: Activity,
    status: 'CASS Certified',
  },
];

export function TailarkIntegrations() {
  return (
    <section
      id="tailark-integrations-section"
      className="border-b border-border bg-muted/20 py-12"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Directly Grounded in Official Public Records & Deeds
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {INTEGRATIONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                id={`tailark-integration-card-${idx}`}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border/80 bg-card/60 text-center transition-all hover:border-primary/40 hover:bg-card shadow-2xs"
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-semibold text-foreground truncate w-full">
                  {item.name}
                </span>
                <span className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                  {item.role}
                </span>
                <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>{item.status}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
