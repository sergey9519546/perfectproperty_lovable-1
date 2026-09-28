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
  Gavel,
  Calculator,
  SlidersHorizontal,
  Home
} from 'lucide-react';
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
  baseRehab: number;
  projectedRent: number;
  capRate: number;
  score: number;
  zoning: string;
  zoningPlain: string;
  lotDimensions: string;
  lienSummary: string;
  titleClearance: 'Clean' | 'Notice';
  whyItWorks: string;
}

const DEMO_PROPERTIES: DemoProperty[] = [
  {
    id: 'prop-1',
    name: '2418 W Augusta Blvd',
    address: '2418 W Augusta Blvd, Chicago, IL 60622',
    neighborhood: 'West Town / Humboldt Park',
    mode: 'Deals',
    type: 'Brick 3-Flat Multi-Family',
    purchasePrice: 420000,
    arv: 695000,
    baseRehab: 65000,
    projectedRent: 5850,
    capRate: 8.8,
    score: 92,
    zoning: 'RT-4',
    zoningPlain: 'Two-Flat & Multi-Family Residential (Up to 3 legal apartments)',
    lotDimensions: "25' × 125' (3,125 sq ft standard Chicago lot)",
    lienSummary: 'Clean title. Single original mortgage recorded, no second mortgages or mechanics liens.',
    titleClearance: 'Clean',
    whyItWorks: 'Off-market 3-flat with separate gas and electric meters already installed. Detached 2-car brick garage adds $350/mo extra rental income.',
  },
  {
    id: 'prop-2',
    name: '4822 S Michigan Ave',
    address: '4822 S Michigan Ave, Chicago, IL 60615',
    neighborhood: 'Historic Bronzeville',
    mode: 'Shadow',
    type: 'Greystone 4-Unit Apartment',
    purchasePrice: 285000,
    arv: 580000,
    baseRehab: 95000,
    projectedRent: 6200,
    capRate: 9.6,
    score: 88,
    zoning: 'RM-5',
    zoningPlain: 'High-Density Residential Multi-Family',
    lotDimensions: "30' × 140' (4,200 sq ft oversized parcel)",
    lienSummary: 'Cook County Foreclosure. Junior HELOC second mortgage ($45k) wiped out at sale. Winning bidder pays $1,180 city water bill.',
    titleClearance: 'Clean',
    whyItWorks: 'Courthouse auction sale starting at $285k. Similar renovated 4-units on Michigan Ave sold for $580k+. Solid stone foundation.',
  },
  {
    id: 'prop-3',
    name: '1945 S Blue Island Ave',
    address: '1945 S Blue Island Ave, Chicago, IL 60608',
    neighborhood: 'Pilsen Arts District',
    mode: 'Deals',
    type: 'Storefront + 2 Apartments',
    purchasePrice: 510000,
    arv: 780000,
    baseRehab: 50000,
    projectedRent: 6900,
    capRate: 9.2,
    score: 95,
    zoning: 'B3-2',
    zoningPlain: 'Neighborhood Commercial Shopping + Upper Apartments',
    lotDimensions: "24' × 110' (2,640 sq ft corner parcel)",
    lienSummary: 'Probate estate sale with clear title commitment in place. All property taxes paid to date.',
    titleClearance: 'Clean',
    whyItWorks: 'High foot-traffic street. Ground floor leased to long-term specialty bakery. Upper two loft apartments recently updated.',
  },
];

export function TailarkInteractiveTerminal({ onExplore }: TailarkInteractiveTerminalProps) {
  const [selectedPropId, setSelectedPropId] = useState<string>('prop-1');
  const [rehabScope, setRehabScope] = useState<'light' | 'moderate' | 'heavy'>('moderate');
  const [activeTab, setActiveTab] = useState<'calculator' | 'lot' | 'title'>('calculator');

  const property = DEMO_PROPERTIES.find((p) => p.id === selectedPropId) || DEMO_PROPERTIES[0];

  // Dynamic Rehab multiplier
  const rehabMultiplier = rehabScope === 'light' ? 0.6 : rehabScope === 'moderate' ? 1.0 : 1.5;
  const rehabCost = Math.round(property.baseRehab * rehabMultiplier);
  const closingAndHolding = Math.round(property.arv * 0.08); // 8% commissions, transfer tax, holding
  const netProfit = property.arv - property.purchasePrice - rehabCost - closingAndHolding;
  const safeMaxOffer = property.arv - rehabCost - closingAndHolding - 60000; // Target $60k minimum spread

  return (
    <section
      id="tailark-interactive-terminal"
      className="border-b border-border bg-muted/20 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header: Clean unboxed typography */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            Try It Live · Interactive Deal Inspector
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
            See how the profit math works on real properties.
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Select a verified property below to test repair budgets, check neighborhood comps, and verify clean title.
          </p>
        </div>

        {/* Property Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
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

        {/* Main Deal Inspector Window */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-border bg-muted/40 px-6 py-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Home className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground">
                  {property.address}
                </span>
                <span className="text-xs text-muted-foreground block">
                  {property.neighborhood} · {property.type}
                </span>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
              <button
                type="button"
                onClick={() => setActiveTab('calculator')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'calculator'
                    ? 'bg-foreground text-background shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Profit & Repair Calculator
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lot')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'lot'
                    ? 'bg-foreground text-background shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Lot Size & Zoning
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('title')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'title'
                    ? 'bg-foreground text-background shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Title & Debt Check
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8">
            {/* Top Numbers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-border">
              <div>
                <span className="text-xs text-muted-foreground font-medium">Purchase / Starting Price</span>
                <p className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-0.5 num">
                  ${property.purchasePrice.toLocaleString()}
                </p>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">Estimated entry cost</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">Market Value (Comps)</span>
                <p className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-0.5 num">
                  ${property.arv.toLocaleString()}
                </p>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 block">
                  +${(property.arv - property.purchasePrice).toLocaleString()} gross spread
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">Estimated Net Profit</span>
                <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 num">
                  +${netProfit.toLocaleString()}
                </p>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">After repairs & closing fees</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">Recommended Max Bid</span>
                <p className="text-xl sm:text-2xl font-bold font-mono text-primary mt-0.5 num">
                  ${safeMaxOffer.toLocaleString()}
                </p>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">Highest safe offer price</span>
              </div>
            </div>

            {/* Tab 1: Interactive Profit & Repair Calculator */}
            {activeTab === 'calculator' && (
              <div className="pt-6 space-y-6">
                {/* Interactive Repair Selector */}
                <div className="rounded-xl border border-border bg-muted/30 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Interactive Repair Scope Simulator</h4>
                      <p className="text-xs text-muted-foreground">
                        Change the estimated renovation scope to see how your profit and max bid adjust in real time.
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Estimated Repairs:</span>
                      <p className="text-lg font-bold font-mono text-foreground num">
                        ${rehabCost.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRehabScope('light')}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        rehabScope === 'light'
                          ? 'border-primary bg-card text-foreground shadow-xs ring-1 ring-primary/20'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-foreground">
                        <span>Light Refresh</span>
                        <span className="num font-mono text-primary">${Math.round(property.baseRehab * 0.6).toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Paint, flooring, modern lighting, and minor cosmetic touchups.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRehabScope('moderate')}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        rehabScope === 'moderate'
                          ? 'border-primary bg-card text-foreground shadow-xs ring-1 ring-primary/20'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-foreground">
                        <span>Standard Rental Turn</span>
                        <span className="num font-mono text-primary">${property.baseRehab.toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Kitchen cabinets, stone counters, bath tile, plus mechanical inspection.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRehabScope('heavy')}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        rehabScope === 'heavy'
                          ? 'border-primary bg-card text-foreground shadow-xs ring-1 ring-primary/20'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-foreground">
                        <span>Full Renovation</span>
                        <span className="num font-mono text-primary">${Math.round(property.baseRehab * 1.5).toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        New HVAC, full plumbing & electrical update, full interior remodel.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Additional Cash Flow Numbers */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                    <span className="text-xs text-muted-foreground">Expected Monthly Rent</span>
                    <p className="text-base font-bold font-mono text-foreground mt-1 num">
                      ${property.projectedRent.toLocaleString()}/mo
                    </p>
                    <span className="text-[10px] text-muted-foreground">Based on local neighborhood comps</span>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                    <span className="text-xs text-muted-foreground">Rental Return (Cap Rate)</span>
                    <p className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 num">
                      {property.capRate}%
                    </p>
                    <span className="text-[10px] text-muted-foreground">Net operating cashflow yield</span>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                    <span className="text-xs text-muted-foreground">Closing & Holding Reserve</span>
                    <p className="text-base font-bold font-mono text-foreground mt-1 num">
                      ${closingAndHolding.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-muted-foreground">8% transfer taxes & commissions</span>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                    <span className="text-xs text-muted-foreground">Deal Quality Score</span>
                    <p className="text-base font-bold font-mono text-primary mt-1 num">
                      {property.score} / 100
                    </p>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Top 10% Profit Potential
                    </span>
                  </div>
                </div>

                {/* Plain-English summary of why this deal works */}
                <div className="rounded-xl border border-border/80 bg-card p-4 text-xs text-muted-foreground flex items-start gap-3">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground">Why this deal makes sense: </span>
                    <span>{property.whyItWorks}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Lot Size & Zoning Details */}
            {activeTab === 'lot' && (
              <div className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <span className="text-xs text-muted-foreground font-medium">Permitted Zoning</span>
                    <p className="text-sm font-bold text-foreground mt-1 font-mono">{property.zoning}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {property.zoningPlain}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <span className="text-xs text-muted-foreground font-medium">Lot Dimensions</span>
                    <p className="text-sm font-bold text-foreground mt-1 font-mono">{property.lotDimensions}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Standard rectangular city lot with paved rear alley access and detached garage footprint.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <span className="text-xs text-muted-foreground font-medium">Flood Risk & Insurance</span>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      FEMA Zone X (Low Risk)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Property is outside the 100-year and 500-year flood plains. No expensive flood insurance required.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Title & Debt Check */}
            {activeTab === 'title' && (
              <div className="pt-6 space-y-4">
                <div className="rounded-xl border border-border bg-muted/20 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-sm font-bold text-foreground">Official Title & Recorded Debt Audit</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {property.lienSummary}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-muted-foreground block text-[11px]">County Property Taxes</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                        ✓ Current & Paid
                      </span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-muted-foreground block text-[11px]">Unpaid Contractor Liens</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                        ✓ None Found
                      </span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-muted-foreground block text-[11px]">Ownership Verification</span>
                      <span className="font-bold text-foreground mt-0.5 block">
                        ✓ Official County Deed on Record
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Action Footer */}
            <div className="mt-8 pt-5 border-t border-border flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-muted-foreground">
                Want to search all 500+ Cook County properties or find auctions in your zip code?
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onExplore(property.address, property.mode)}
                  className="text-xs h-9 cursor-pointer"
                >
                  <span>View in Property Map</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onExplore()}
                  className="text-xs h-9 bg-primary text-primary-foreground font-semibold cursor-pointer"
                >
                  <span>Explore Ranked Dealflow</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
