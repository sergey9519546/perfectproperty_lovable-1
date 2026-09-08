import { motion } from 'motion/react'
import {
  MapPin,
  TrendingUp,
  AlertTriangle,
  FileText,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  Crosshair,
  CheckCircle2
} from 'lucide-react'
import { BentoGrid, BentoGridItem, CardSpotlight } from '@/components/ui/aceternity'

export const Features = () => {
  return (
    <section id="features-bento" className="py-28 bg-background border-t border-border">
      <div className="max-w-[1240px] mx-auto px-6">
        {/* Section Header */}
        <div className="grid lg:grid-cols-2 gap-10 items-end mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-blue-200/60 rounded-full text-[12px] font-semibold text-primary tracking-wide uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Institutional Underwriting Architecture
            </div>
            <h2 className="text-[36px] md:text-[46px] font-bold tracking-[-0.03em] leading-[1.08] text-foreground">
              The fastest way to underwrite and tell your deal story.
            </h2>
            <p className="mt-4 text-[17px] md:text-[19px] text-muted-foreground max-w-[560px] leading-[1.5] font-normal">
              Built on sub-meter parcel cadastre, Monte Carlo downside simulations, and continuous deed-verified accuracy.
            </p>
          </div>
          <div className="hidden lg:flex justify-end pb-2">
            <div className="flex items-center gap-3 text-[13px] font-medium text-muted-foreground bg-card border border-slate-200 px-4 py-2 rounded-xl shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>3,142 County Registrars Synced</span>
            </div>
          </div>
        </div>

        {/* BentoGrid with CardSpotlight Integration */}
        <BentoGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Cadastral Boundary & GIS Parcel Engine (col-span-2) */}
          <BentoGridItem
            className="md:col-span-2 p-0 overflow-hidden border border-slate-200/90 bg-card shadow-xs hover:border-blue-300 transition-all duration-300"
            header={
              <CardSpotlight className="p-6 bg-slate-900 text-white rounded-t-xl overflow-hidden relative" color="rgba(59, 130, 246, 0.2)">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-slate-400">
                    <Crosshair className="w-3.5 h-3.5 text-blue-400" />
                    <span>PARCEL CADASTRE // APN: 9402-18-092</span>
                  </div>
                  <span className="text-[11px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded">
                    R-2 MEDIUM DENSITY
                  </span>
                </div>

                {/* SVG Cadastral Lot Drawing */}
                <div className="relative h-44 w-full bg-slate-950/60 rounded-lg border border-slate-800 p-3 flex items-center justify-center overflow-hidden">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

                  {/* Parcel Polygon */}
                  <svg viewBox="0 0 400 150" className="w-full h-full max-h-40 z-10">
                    {/* Lot Outline */}
                    <polygon
                      points="60,30 330,20 355,125 75,135"
                      fill="rgba(59, 130, 246, 0.12)"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      strokeDasharray="0"
                    />
                    {/* Setback line */}
                    <polygon
                      points="90,45 305,38 325,110 100,118"
                      fill="none"
                      stroke="#60A5FA"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.6"
                    />
                    {/* Dimension Labels */}
                    <text x="180" y="22" fill="#94A3B8" fontSize="10" fontFamily="monospace" textAnchor="middle">122.4 FT (N 89°14' E)</text>
                    <text x="355" y="80" fill="#94A3B8" fontSize="10" fontFamily="monospace" textAnchor="start">84.0 FT</text>
                    <text x="210" y="145" fill="#94A3B8" fontSize="10" fontFamily="monospace" textAnchor="middle">124.8 FT (S 88°50' W)</text>
                    <text x="45" y="85" fill="#94A3B8" fontSize="10" fontFamily="monospace" textAnchor="end">83.6 FT</text>

                    {/* Corner Vertices */}
                    <circle cx="60" cy="30" r="3.5" fill="#60A5FA" />
                    <circle cx="330" cy="20" r="3.5" fill="#60A5FA" />
                    <circle cx="355" cy="125" r="3.5" fill="#60A5FA" />
                    <circle cx="75" cy="135" r="3.5" fill="#60A5FA" />

                    {/* Center Area Label */}
                    <text x="200" y="82" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
                      10,248 SQ FT
                    </text>
                    <text x="200" y="98" fill="#93C5FD" fontSize="10" fontFamily="monospace" textAnchor="middle">
                      0.235 ACRES · DEED BK 4102/PG 188
                    </text>
                  </svg>
                </div>
              </CardSpotlight>
            }
            icon={<MapPin className="w-4 h-4" />}
            badge="GIS Engine"
            title="Cadastral Polygon & Parcel Attributes"
            description="Sub-meter boundary coordinates, county GIS layers, deed book & page, and dimensional setback calculations automatically extracted for every US property."
          />

          {/* Card 2: Monte Carlo ARV Skepticism (col-span-1) */}
          <BentoGridItem
            className="p-0 overflow-hidden border border-slate-200/90 bg-card shadow-xs hover:border-blue-300 transition-all duration-300"
            header={
              <CardSpotlight className="p-6 bg-slate-900 text-white rounded-t-xl relative overflow-hidden" color="rgba(16, 185, 129, 0.15)">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-slate-400">MONTE CARLO ARV</span>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
                    P(Loss) &lt; 3.8%
                  </span>
                </div>

                {/* SVG Bell Curve / Probability Distribution */}
                <div className="h-44 w-full bg-slate-950/60 rounded-lg border border-slate-800 p-2 flex flex-col justify-between">
                  <svg viewBox="0 0 240 100" className="w-full h-24">
                    {/* Shaded confidence interval */}
                    <path
                      d="M 40 90 Q 70 85 90 60 Q 120 10 150 60 Q 170 85 200 90 L 200 90 L 40 90 Z"
                      fill="rgba(16, 185, 129, 0.15)"
                    />
                    {/* Bell curve line */}
                    <path
                      d="M 20 90 Q 70 85 90 60 Q 120 10 150 60 Q 170 85 220 90"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                    />
                    {/* Median Line */}
                    <line x1="120" y1="10" x2="120" y2="90" stroke="#34D399" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="120" cy="10" r="3" fill="#34D399" />
                  </svg>
                  <div className="grid grid-cols-3 text-center border-t border-slate-800/80 pt-2 font-mono">
                    <div>
                      <div className="text-[10px] text-slate-400">P10 BEAR</div>
                      <div className="text-[12px] font-bold text-slate-300">$645k</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-400">P50 MEDIAN</div>
                      <div className="text-[13px] font-bold text-white">$715k</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">P90 BULL</div>
                      <div className="text-[12px] font-bold text-slate-300">$782k</div>
                    </div>
                  </div>
                </div>
              </CardSpotlight>
            }
            icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
            badge="Risk Engine"
            title="Monte Carlo ARV Skepticism"
            description="Simulates 10,000 downside volatility scenarios to calculate deterministic offer ceilings and risk-adjusted margins before you commit capital."
          />

          {/* Card 3: Pre-Foreclosure Shadow Distress (col-span-1) */}
          <BentoGridItem
            className="p-0 overflow-hidden border border-slate-200/90 bg-card shadow-xs hover:border-blue-300 transition-all duration-300"
            header={
              <CardSpotlight className="p-6 bg-slate-900 text-white rounded-t-xl relative overflow-hidden" color="rgba(245, 158, 11, 0.15)">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-slate-400">DISTRESS RADAR</span>
                  <span className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    LIVE FEED
                  </span>
                </div>

                {/* Distress Triggers Stream */}
                <div className="h-44 w-full bg-slate-950/60 rounded-lg border border-slate-800 p-2.5 space-y-2 font-mono text-xs overflow-hidden">
                  <div className="p-2 bg-slate-900/90 border border-amber-500/30 rounded flex items-center justify-between">
                    <div>
                      <span className="text-amber-400 font-bold block text-[11px]">LIS PENDENS FILED</span>
                      <span className="text-slate-400 text-[10px]">Travis County · Case #24-819</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold">12m ago</span>
                  </div>

                  <div className="p-2 bg-slate-900/90 border border-slate-800 rounded flex items-center justify-between">
                    <div>
                      <span className="text-rose-400 font-bold block text-[11px]">TAX LIEN AUCTION</span>
                      <span className="text-slate-400 text-[10px]">Delinquent $14,280 · 38D gate</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold">2h ago</span>
                  </div>

                  <div className="p-2 bg-slate-900/90 border border-slate-800 rounded flex items-center justify-between">
                    <div>
                      <span className="text-purple-400 font-bold block text-[11px]">PROBATE INTESTATE</span>
                      <span className="text-slate-400 text-[10px]">Estate of Miller · 100% Equity</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold">5h ago</span>
                  </div>
                </div>
              </CardSpotlight>
            }
            icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
            badge="AI Workforce & Ledger"
            title="Sheriff & Government Sales Intelligence"
            description="Turns public legal prose, open GIS cadastre, and USDA NAIP imagery into deal intelligence. Verified August 2026 statutes with weekly self-calibrating Outcomes Ledger on a $240/mo open-source stack."
          />

          {/* Card 4: Institutional Deal Memo Synthesis (col-span-2) */}
          <BentoGridItem
            className="md:col-span-2 p-0 overflow-hidden border border-slate-200/90 bg-card shadow-xs hover:border-blue-300 transition-all duration-300"
            header={
              <CardSpotlight className="p-6 bg-slate-900 text-white rounded-t-xl relative overflow-hidden" color="rgba(59, 130, 246, 0.15)">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-slate-400">INVESTMENT COMMITTEE MEMO // REAL-TIME MODEL</span>
                  <span className="text-[11px] font-mono text-blue-300 bg-blue-950/60 border border-blue-800/50 px-2 py-0.5 rounded">
                    UNLEVERED IRR: 19.4%
                  </span>
                </div>

                {/* Financial Pro-Forma Matrix */}
                <div className="h-44 w-full bg-slate-950/60 rounded-lg border border-slate-800 p-4 font-mono text-xs flex flex-col justify-between">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-800/80 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Modeled Offer</span>
                      <span className="text-[15px] font-bold text-white">$415,000</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Rehab Scope</span>
                      <span className="text-[15px] font-bold text-amber-300">$58,000</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Target ARV</span>
                      <span className="text-[15px] font-bold text-emerald-400">$565,000</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Risk-Adj Profit</span>
                      <span className="text-[15px] font-bold text-emerald-400">+$54,200</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-[11px] text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Skeptic Cleared: Full title warranty + 3 comps within 0.4 miles</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-semibold">HOLD PERIOD: 110 DAYS</span>
                  </div>
                </div>
              </CardSpotlight>
            }
            icon={<FileText className="w-4 h-4 text-primary" />}
            badge="IC Ready"
            title="Instant Institutional Deal Memos"
            description="Eliminate multi-day analyst turnaround. Generate board-grade investment memos with verified comps, sensitivity matrices, and modeled offer caps in seconds."
          />

          {/* Card 5: Continuous Accuracy & Backtesting Pipeline (col-span-3) */}
          <BentoGridItem
            className="md:col-span-2 lg:col-span-3 p-0 overflow-hidden border border-slate-200/90 bg-card shadow-xs hover:border-blue-300 transition-all duration-300"
            header={
              <CardSpotlight className="p-6 bg-slate-900 text-white rounded-t-xl relative overflow-hidden" color="rgba(99, 102, 241, 0.15)">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>CONTINUOUS VALUATION BACKTESTING // CLOSED DEEDS VS PREDICTED ARV</span>
                  </div>
                  <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-800/50 px-2.5 py-0.5 rounded self-start sm:self-auto">
                    MEDIAN ABSOLUTE ERROR: ±1.8%
                  </span>
                </div>

                {/* Backtesting Track Record Bar */}
                <div className="w-full bg-slate-950/60 rounded-lg border border-slate-800 p-4 font-mono">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="border-r border-slate-800/80 last:border-0 pr-2">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Settled Deeds Scored</div>
                      <div className="text-[18px] md:text-[22px] font-bold text-white mt-0.5">24,180</div>
                    </div>
                    <div className="border-r border-slate-800/80 last:border-0 pr-2">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">ARV Hit Rate (±5%)</div>
                      <div className="text-[18px] md:text-[22px] font-bold text-emerald-400 mt-0.5">97.4%</div>
                    </div>
                    <div className="border-r border-slate-800/80 last:border-0 pr-2">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Downside Protection</div>
                      <div className="text-[18px] md:text-[22px] font-bold text-indigo-400 mt-0.5">99.1%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">County Models Live</div>
                      <div className="text-[18px] md:text-[22px] font-bold text-white mt-0.5">3,142</div>
                    </div>
                  </div>
                </div>
              </CardSpotlight>
            }
            icon={<ShieldCheck className="w-4 h-4 text-indigo-600" />}
            badge="Empirical Proof"
            title="Continuous Accuracy & Deed Reconciliation"
            description="Every predicted ARV is audited against recorded county deed transfers upon close. Machine learning models continuously self-calibrate to protect capital from market drift."
          />
        </BentoGrid>
      </div>
    </section>
  )
}

