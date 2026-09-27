import { useState } from 'react';
import {
  Building2,
  MapPin,
  TrendingUp,
  DollarSign,
  Layers,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Gavel
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/rainbow-button';

export interface TailarkInteractiveTerminalProps {
  onExplore: (query?: string, mode?: 'Deals' | 'Shadow') => void;
}

interface DemoProperty {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  mode: 'Deals' | 'Shadow';
  type: string;
  purchasePrice: number;
  arv: number;
  rehabEstimate: number;
  projectedRent: number;
  capRate: number;
  dscr: number;
  score: number;
  zoning: string;
  lotDimensions: string;
  lienStatus: string;
  titleClearance: 'Clean' | 'Warning';
  summary: string;
}

const DEMO_PROPERTIES: DemoProperty[] = [
  {
    id: 'prop-1',
    name: '2418 W Augusta Blvd',
    address: '2418 W Augusta Blvd, Chicago, IL 60622',
    neighborhood: 'Humboldt Park / West Town border',
    mode: 'Deals',
    type: 'Brick 3-Flat Multi-Family',
    purchasePrice: 420000,
    arv: 695000,
    rehabEstimate: 75000,
    projectedRent: 5850,
    capRate: 8.8,
    dscr: 1.52,
    score: 91,
    zoning: 'RT-4 Two-Flat / Multi-Family',
    lotDimensions: "25' × 125' (3,125 sq ft)",
    lienStatus: 'Clear Title / Single Conventional Mortgage',
    titleClearance: 'Clean',
    summary: 'High-spread value add 3-flat with detached 2-car brick garage. Separate gas and electric meters in place.',
  },
  {
    id: 'prop-2',
    name: '4822 S Michigan Ave (Sheriff Sale)',
    address: '4822 S Michigan Ave, Chicago, IL 60615',
    neighborhood: 'Bronzeville Historic Boulevard',
    mode: 'Shadow',
    type: 'Historic Greystone 4-Unit',
    purchasePrice: 285000,
    arv: 580000,
    rehabEstimate: 110000,
    projectedRent: 6200,
    capRate: 9.6,
    dscr: 1.65,
    score: 87,
    zoning: 'RM-5 High Density Multi-Family',
    lotDimensions: "30' × 140' (4,200 sq ft)",
    lienStatus: 'Chancery Docket #2024-CH-03189 (Upset: $285k)',
    titleClearance: 'Clean',
    summary: 'Judicial sale foreclosure. Junior second mortgage extinguished at sale. 10% cashier check deposit required.',
  },
  {
    id: 'prop-3',
    name: '1945 S Blue Island Ave',
    address: '1945 S Blue Island Ave, Chicago, IL 60608',
    neighborhood: 'Pilsen Arts District',
    mode: 'Deals',
    type: 'Mixed-Use Storefront + 2 Apartments',
    purchasePrice: 510000,
    arv: 780000,
    rehabEstimate: 60000,
    projectedRent: 6900,
    capRate: 9.1,
    dscr: 1.48,
    score: 94,
    zoning: 'B3-2 Community Shopping District',
    lotDimensions: "24' × 110' (2,640 sq ft)",
    lienStatus: 'Clear Title / Estate Sale Filing',
    titleClearance: 'Clean',
    summary: 'Turnkey ground floor retail plus two gut-rehabbed loft apartments. High foot traffic commercial corridor.',
  },
];

export function TailarkInteractiveTerminal({ onExplore }: TailarkInteractiveTerminalProps) {
  const [selectedPropId, setSelectedPropId] = useState<string>('prop-1');
  const [activeTab, setActiveTab] = useState<'financials' | 'gis' | 'title'>('financials');

  const property = DEMO_PROPERTIES.find((p) => p.id === selectedPropId) || DEMO_PROPERTIES[0];

  const spread = property.arv - property.purchasePrice - property.rehabEstimate;

  return (
    <section
      id="tailark-interactive-terminal"
      className="border-b border-border bg-muted/20 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interactive Terminal Preview</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
            See how the underwriting engine scores live assets.
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Select a verified property below to inspect cadastral boundaries, financial yields, and public record title audits.
          </p>
        </div>

        {/* Property Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {DEMO_PROPERTIES.map((prop) => {
            const isSelected = prop.id === selectedPropId;
            return (
              <button
                key={prop.id}
                type="button"
                onClick={() => setSelectedPropId(prop.id)}
                className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-card text-foreground shadow-xs ring-1 ring-primary/20'
                    : 'border-border bg-card/60 text-muted-foreground hover:border-border hover:text-foreground'
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {prop.score}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground leading-none">{prop.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{prop.type}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Terminal Card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Terminal Window Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-border bg-muted/40 px-6 py-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              </div>
              <span className="text-xs font-mono font-semibold text-muted-foreground">
                PERFECT_PROPERTY_TERMINAL // {property.address}
              </span>
            </div>

            {/* Terminal Inner Navigation Tabs */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
              <button
                type="button"
                onClick={() => setActiveTab('financials')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  activeTab === 'financials' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Financial Pro-Forma
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('gis')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  activeTab === 'gis' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Cadastral & Zoning
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('title')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  activeTab === 'title' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Title & Court Liens
              </button>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-6 sm:p-8">
            {/* Top Property Brief Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-border">
              <div>
                <span className="text-xs text-muted-foreground">Target Acquisition Price</span>
                <p className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-0.5">
                  ${property.purchasePrice.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">After Repair Value (ARV)</span>
                <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ${property.arv.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Net Equity Spread</span>
                <p className="text-xl sm:text-2xl font-bold font-mono text-primary mt-0.5">
                  +${spread.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Composite Deal Score</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                    {property.score}/100
                  </span>
                  <Badge variant="outline" className="text-xs font-semibold text-emerald-600 border-emerald-500/30 bg-emerald-500/5">
                    Institutional Pass
                  </Badge>
                </div>
              </div>
            </div>

            {/* Tab Specific Content */}
            <div className="pt-6">
              {activeTab === 'financials' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {property.summary}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                      <span className="text-xs text-muted-foreground">Rehab Budget (Tier 2)</span>
                      <p className="text-base font-bold font-mono text-foreground mt-1">
                        ${property.rehabEstimate.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                      <span className="text-xs text-muted-foreground">Monthly In-Place Rent</span>
                      <p className="text-base font-bold font-mono text-foreground mt-1">
                        ${property.projectedRent.toLocaleString()}/mo
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                      <span className="text-xs text-muted-foreground">Stabilized Cap Rate</span>
                      <p className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                        {property.capRate}%
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                      <span className="text-xs text-muted-foreground">Debt Coverage (DSCR)</span>
                      <p className="text-base font-bold font-mono text-foreground mt-1">
                        {property.dscr}x (Bank Qualified)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'gis' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <span className="text-xs text-muted-foreground">Zoning Classification</span>
                      <p className="text-sm font-bold font-mono text-foreground mt-1">{property.zoning}</p>
                      <p className="text-xs text-muted-foreground mt-1">Permits multi-unit residential with standard FAR envelope.</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <span className="text-xs text-muted-foreground">Lot Geometry & Frontage</span>
                      <p className="text-sm font-bold font-mono text-foreground mt-1">{property.lotDimensions}</p>
                      <p className="text-xs text-muted-foreground mt-1">Dedicated paved alley access and detached garage footprint.</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <span className="text-xs text-muted-foreground">Geospatial Environmental</span>
                      <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">FEMA Zone X (Minimal Flood)</p>
                      <p className="text-xs text-muted-foreground mt-1">No special flood hazard insurance mandated by conventional lenders.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'title' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Court & Docket Filing Status</span>
                      <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                        {property.titleClearance === 'Clean' ? 'No Clouded Deeds Detected' : 'Requires Review'}
                      </Badge>
                    </div>
                    <p className="text-sm font-mono font-bold text-foreground mt-2">{property.lienStatus}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cross-referenced against Cook County Recorder of Deeds and Illinois Chancery Court dockets.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Launch Action */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Audited with Cook County Assessor & Sheriff records</span>
              </div>

              <RainbowButton
                id="tailark-terminal-open-btn"
                onClick={() => onExplore(property.address, property.mode)}
                className="font-semibold rounded-xl text-xs h-10 px-5 shadow-sm"
              >
                <span>Open in Full Cartographic Workspace</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </RainbowButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
