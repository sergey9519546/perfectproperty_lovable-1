import { ShieldCheck, Database, Landmark, FileText, Map, Activity } from 'lucide-react';

const INTEGRATIONS = [
  {
    name: 'Cook County Sheriff',
    role: 'Auction Dockets & Judgments',
    icon: Landmark,
    status: 'Live Synced',
  },
  {
    name: 'Municipal GIS Cadastre',
    role: 'Sub-Meter Boundary Polygons',
    icon: Map,
    status: 'Direct API',
  },
  {
    name: 'County Recorder of Deeds',
    role: 'Mortgage Liens & Lis Pendens',
    icon: FileText,
    status: 'Continuous',
  },
  {
    name: 'US Census Bureau',
    role: 'Demographics & Median Income',
    icon: Database,
    status: 'ACS 2024',
  },
  {
    name: 'FEMA Flood Portal',
    role: 'Hazard Zone X / AE Models',
    icon: ShieldCheck,
    status: 'Real-Time',
  },
  {
    name: 'USPS CASS Service',
    role: 'Address Verification & Status',
    icon: Activity,
    status: 'Verified',
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
            Direct Public Record Grounding & Title Intelligence
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
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {item.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
