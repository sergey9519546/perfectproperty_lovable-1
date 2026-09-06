import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Building2, 
  Radar, 
  TrendingUp, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  FileText, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react'
import { AnimatedTabs, CardSpotlight } from '@/components/ui/aceternity'

export const MarketContext = () => {
  const [activeTab, setActiveTab] = useState('visuals')
  const [demoStep, setDemoStep] = useState(3)
  const [isPlayingDemo, setIsPlayingDemo] = useState(false)

  const handleStartDemo = () => {
    setIsPlayingDemo(true)
    setDemoStep(0)
    const interval = setInterval(() => {
      setDemoStep((prev) => {
        if (prev >= 4) {
          clearInterval(interval)
          setIsPlayingDemo(false)
          return 4
        }
        return prev + 1
      })
    }, 800)
  }

  const tabs = [
    {
      title: 'Visuals',
      value: 'visuals',
      icon: <Layers className="w-4 h-4" />,
      badge: 'Ortho 3D',
      content: (
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8">
            <CardSpotlight className="h-[480px] p-0 relative overflow-hidden bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1600"
                alt="Cadastral Ortho Map View"
                className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              {/* Cadastral Lot Boundary Vectors */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-blue-400/70" viewBox="0 0 800 480" fill="none">
                <polygon points="180,90 420,120 460,340 210,310" strokeWidth="2" strokeDasharray="4 2" fill="rgba(47, 95, 255, 0.12)" />
                <polygon points="430,125 680,150 710,360 470,345" strokeWidth="1.5" strokeDasharray="2 2" fill="rgba(16, 185, 129, 0.08)" />
                <circle cx="320" cy="210" r="6" fill="#3B82F6" className="animate-ping" />
                <circle cx="320" cy="210" r="4" fill="#60A5FA" />
                <line x1="320" y1="210" x2="380" y2="150" stroke="#60A5FA" strokeWidth="1.5" />
                <rect x="380" y="130" width="160" height="34" rx="4" fill="#0F172A" stroke="#334155" />
                <text x="390" y="152" fill="#E2E8F0" fontSize="11" fontFamily="monospace" fontWeight="600">APN: 042-881-19 • 0.84 AC</text>
              </svg>

              {/* Live telemetry overlay */}
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  HIGH-RES PARCEL MESH
                </span>
                <span className="text-xs font-mono text-slate-400">LAT: 30.2672° N • LON: -97.7431° W</span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-md">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">ZONING ENVELOPE</p>
                  <p className="text-sm font-semibold text-white">CS-MU-V-NP (Mixed-Use Commercial Transit)</p>
                </div>
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">BUILDABLE FAR</p>
                  <p className="text-sm font-semibold text-emerald-400">3.25x • 118,500 SF Cap</p>
                </div>
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">CONFIDENCE</p>
                  <p className="text-sm font-semibold text-blue-400">99.1% Lot Delineation</p>
                </div>
              </div>
            </CardSpotlight>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Automated Boundary Delineation</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Computer-vision driven property outline extraction cross-references county tax maps with state DOT lidar surveys to compute buildable footprints.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Setback & Slope Analysis</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Calculates environmental setbacks, easements, utility rights-of-way, and topographical elevation cuts directly in the browser.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Demo',
      value: 'demo',
      icon: <Play className="w-4 h-4" />,
      badge: 'Live Run',
      content: (
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8">
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-white shadow-2xl h-[480px] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-sm text-slate-300">NIGHTLY RUN SIMULATION: TRAVIS COUNTY, TX</span>
                </div>
                <button
                  onClick={handleStartDemo}
                  disabled={isPlayingDemo}
                  className="px-4 py-1.5 text-xs font-mono font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {isPlayingDemo ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  {isPlayingDemo ? 'RUNNING PIPELINE…' : 'RE-RUN PIPELINE'}
                </button>
              </div>

              {/* Progress Steps */}
              <div className="space-y-4 my-auto">
                {[
                  { label: '01. County Tax Roll Ingestion & Deed Chain Audit', duration: '120ms', status: demoStep >= 0 },
                  { label: '02. Court Lien, Lis Pendens & Tax Delinquency Parse', duration: '240ms', status: demoStep >= 1 },
                  { label: '03. Hedonic Comp Valuation & Micro-Submarket ARV Model', duration: '310ms', status: demoStep >= 2 },
                  { label: '04. Rehabilitation Cost & Contractor Multiplier Matrix', duration: '180ms', status: demoStep >= 3 },
                  { label: '05. Net Margin Verdict: Ring 1 Priority Buy Assigned', duration: '95ms', status: demoStep >= 4 },
                ].map((step, idx) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className={`flex items-center justify-between p-3.5 rounded-xl border font-mono text-xs transition-all ${
                      step.status 
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {step.status ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />
                      )}
                      <span>{step.label}</span>
                    </div>
                    <span className="text-[11px] opacity-75">{step.duration}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80 font-mono">
                <span>TOTAL RUN TIME: 945ms</span>
                <span className="text-emerald-400 font-bold">READY TO RECORD UNDERWRITE</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                INSTANT HEURISTICS
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">No Analyst Hand-Offs Required</h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Watch raw tax filings transform into lender-grade investment memos in sub-second execution cycles. Your underwriting engine operates continuous shifts 24/7.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <p className="text-xs font-mono text-slate-500 mb-1">PRODUCED MEMO</p>
              <p className="text-sm font-semibold text-slate-900">42-Page Investment Committee Dossier</p>
              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-blue-600">
                <span>Export PDF, CSV or JSON</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Deals',
      value: 'deals',
      icon: <TrendingUp className="w-4 h-4" />,
      badge: 'Active Spread',
      content: (
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200 shadow-xl h-[480px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">Active Spread Opportunities</h4>
                <p className="text-xs text-slate-500">Sorted by expected gross margin spread vs. market replacement cost</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold font-mono">
                14 HIGH-MARGIN PARCELS
              </span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono tracking-wider text-[10px]">
                    <th className="py-3 px-2">Parcel / Location</th>
                    <th className="py-3 px-2">Type</th>
                    <th className="py-3 px-2">Underwrite ARV</th>
                    <th className="py-3 px-2">Target Ask</th>
                    <th className="py-3 px-2">Expected Spread</th>
                    <th className="py-3 px-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {[
                    { address: '1804 Willow Creek Rd', type: 'Single-Family', arv: '$485,000', ask: '$310,000', spread: '+$112,000', margin: '23.1%', tier: 'Ring 1' },
                    { address: '3902 South Congress Ave', type: 'Duplex Infill', arv: '$740,000', ask: '$515,000', spread: '+$148,000', margin: '20.0%', tier: 'Ring 1' },
                    { address: '711 East 4th St', type: 'Light Industrial', arv: '$1,290,000', ask: '$920,000', spread: '+$245,000', margin: '19.0%', tier: 'Ring 2' },
                    { address: '2418 Oak Crest Ave', type: 'SFR Distress', arv: '$395,000', ask: '$240,000', spread: '+$94,000', margin: '23.8%', tier: 'Ring 1' },
                    { address: '1105 Pleasant Valley', type: 'Multi-Family (4U)', arv: '$1,150,000', ask: '$840,000', spread: '+$190,000', margin: '16.5%', tier: 'Ring 2' },
                  ].map((deal) => (
                    <tr key={deal.address} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-bold text-slate-900">{deal.address}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Austin, TX • Travis County</div>
                      </td>
                      <td className="py-3 px-2 text-slate-600">{deal.type}</td>
                      <td className="py-3 px-2 font-mono font-semibold text-slate-900">{deal.arv}</td>
                      <td className="py-3 px-2 font-mono text-slate-600">{deal.ask}</td>
                      <td className="py-3 px-2">
                        <span className="font-mono font-bold text-emerald-600">{deal.spread}</span>
                        <span className="ml-1 text-[10px] text-slate-400">({deal.margin})</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] uppercase font-mono">
                          {deal.tier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">DEAL DISCOVERY ARSENAL</span>
              <h4 className="text-lg font-bold text-slate-900 mt-2 mb-3">Institutional Arbitrage</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Filter by true debt coverage, gross yield margins, and repair-adjusted spreads across every residential and commercial parcel.
              </p>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-200">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Average Ring 1 Margin:</span>
                <span className="font-bold text-emerald-600 font-mono">22.4%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Days on Market Advantage:</span>
                <span className="font-bold text-blue-600 font-mono">18.5 Days Faster</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Cap Rate Sensitivity:</span>
                <span className="font-bold text-slate-900 font-mono">Stress-tested to +300bps</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Shadow',
      value: 'shadow',
      icon: <Radar className="w-4 h-4" />,
      badge: 'Distress Radar',
      content: (
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-950 border border-slate-800 text-white shadow-xl h-[480px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white">Pre-Market Distress Signals</h4>
                <p className="text-xs text-slate-400 font-mono">County court filings scanned 14 days before public foreclosure auction</p>
              </div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold font-mono">
                RADAR ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-auto">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <AlertTriangle className="w-5 h-5 text-amber-400 mb-2" />
                <p className="text-[11px] font-mono uppercase text-slate-400">Notice of Default</p>
                <p className="text-xl font-bold font-mono text-white mt-1">142 Parcels</p>
                <p className="text-[11px] text-amber-400 mt-2 font-mono">Avg 62 Days to Auction</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <FileText className="w-5 h-5 text-rose-400 mb-2" />
                <p className="text-[11px] font-mono uppercase text-slate-400">Tax Delinquent &gt; 2 Yrs</p>
                <p className="text-xl font-bold font-mono text-white mt-1">318 Parcels</p>
                <p className="text-[11px] text-rose-400 mt-2 font-mono">High Equity / Low Debt</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <Building2 className="w-5 h-5 text-blue-400 mb-2" />
                <p className="text-[11px] font-mono uppercase text-slate-400">Probate &amp; Inherited</p>
                <p className="text-xl font-bold font-mono text-white mt-1">87 Parcels</p>
                <p className="text-[11px] text-blue-400 mt-2 font-mono">Out-of-state Executors</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-between">
              <span>LATEST SIGNAL: 1102 Kinney Ave • $14,200 Tax Lien Recorded (3 hrs ago)</span>
              <span className="text-emerald-400 font-bold">AUTOMATIC OUTREACH READY</span>
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">SHADOW INVENTORY</span>
              <h4 className="text-lg font-bold text-slate-900 mt-2 mb-3">Before The Listing Happens</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                By the time a property appears on the MLS, your competitors are already in a bidding war. Perfect Property reveals shadow inventory weeks before public listing.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-amber-200/60 shadow-sm">
              <p className="text-xs font-mono text-slate-500 mb-1">UNCONTESTED PIPELINE</p>
              <p className="text-sm font-semibold text-slate-900">Direct-to-Seller Underwritten Offers</p>
              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-700">
                <span>View Distress Ledger</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Prophecy',
      value: 'prophecy',
      icon: <Sparkles className="w-4 h-4" />,
      badge: 'Exit Horizon',
      content: (
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200 shadow-xl h-[480px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900">Prophecy: 24-Month Valuation Projection</h4>
                  <p className="text-xs text-slate-500">Hedonic submarket regression factoring interest rates and population inflows</p>
                </div>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold font-mono">
                  CONFIDENCE: 94.6%
                </span>
              </div>

              {/* Graphical Projection Chart */}
              <div className="h-56 w-full relative mt-4">
                <svg className="w-full h-full" viewBox="0 0 600 200" fill="none">
                  <defs>
                    <linearGradient id="prophecyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="40" y1="30" x2="580" y2="30" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="40" y1="80" x2="580" y2="80" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="40" y1="130" x2="580" y2="130" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="40" y1="180" x2="580" y2="180" stroke="#F1F5F9" strokeWidth="1" />
                  {/* Confidence cone */}
                  <polygon points="40,150 160,135 300,110 440,75 580,45 580,95 440,115 300,140 160,155 40,150" fill="url(#prophecyGrad)" />
                  {/* Historical curve */}
                  <path d="M 40 150 Q 100 145, 160 135 T 260 120" stroke="#334155" strokeWidth="2.5" />
                  {/* Forecast dashed line */}
                  <path d="M 260 120 Q 350 95, 440 85 T 580 65" stroke="#8B5CF6" strokeWidth="2.5" strokeDasharray="5 3" />
                  {/* Present Marker */}
                  <circle cx="260" cy="120" r="5" fill="#8B5CF6" />
                  <text x="235" y="105" fill="#64748B" fontSize="10" fontFamily="monospace">TODAY</text>
                  <text x="520" y="55" fill="#8B5CF6" fontSize="11" fontFamily="monospace" fontWeight="bold">+14.2% ARV</text>
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-center font-mono">
              <div>
                <p className="text-[11px] text-slate-400">BEAR SCENARIO</p>
                <p className="text-sm font-bold text-slate-700">+4.8% Exit IRR</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">BASE SCENARIO</p>
                <p className="text-sm font-bold text-purple-600">+14.2% Exit IRR</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">BULL SCENARIO</p>
                <p className="text-sm font-bold text-emerald-600">+22.7% Exit IRR</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-800">FORECASTING PRECISION</span>
              <h4 className="text-lg font-bold text-slate-900 mt-2 mb-3">Model-Backed Exit Pricing</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Stop guessing capitalization rates at exit. Prophecy cross-correlates macro labor shifts, building permit velocity, and census migrations.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-purple-200/80 shadow-sm">
              <p className="text-xs font-mono text-slate-500 mb-1">STRESS TEST BENCHMARK</p>
              <p className="text-sm font-semibold text-slate-900">Passes Federal Reserve DSCR Guardrails</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Accuracy',
      value: 'accuracy',
      icon: <CheckCircle2 className="w-4 h-4" />,
      badge: '98.4%',
      content: (
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200 shadow-xl h-[480px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-base font-bold text-slate-900">Ground-Truth Accuracy Audit</h4>
                  <p className="text-xs text-slate-500">Backtested against 42,800 recorded deeds across California and Florida</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold font-mono">
                  DEED VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] font-mono text-slate-500 uppercase">Directional Accuracy</p>
                  <p className="text-2xl font-bold text-emerald-600 font-mono mt-1">98.4%</p>
                  <p className="text-[10px] text-slate-400 mt-1">Ring 1 selections</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] font-mono text-slate-500 uppercase">Mean Abs. Error</p>
                  <p className="text-2xl font-bold text-slate-900 font-mono mt-1">$4,120</p>
                  <p className="text-[10px] text-slate-400 mt-1">vs. final recorded deed</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] font-mono text-slate-500 uppercase">False Positive Rate</p>
                  <p className="text-2xl font-bold text-blue-600 font-mono mt-1">&lt; 1.2%</p>
                  <p className="text-[10px] text-slate-400 mt-1">Lien exclusions</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] font-mono text-slate-500 uppercase">Coverage</p>
                  <p className="text-2xl font-bold text-slate-900 font-mono mt-1">100%</p>
                  <p className="text-[10px] text-slate-400 mt-1">All county parcels</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="text-xs font-bold text-slate-900 mb-2 font-mono uppercase">Audited By Top 10 Single-Family Rental Funds</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every valuation variance is documented and published nightly to institutional partners, ensuring full reproducibility before capital allocation.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-4 border-t border-slate-100">
              <span>METHODOLOGY: HEDONIC SPATIAL REGRESSION + TITLE CHAIN SCAN</span>
              <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Read Whitepaper</span>
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">EMPIRICAL PROOF</span>
              <h4 className="text-lg font-bold text-white mt-2 mb-3">No Black-Box Hallucinations</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Traditional generic LLMs invent comps that don't exist. Perfect Property roots every single valuation in registered county deeds and recorded title filings.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <p className="text-xs font-mono text-slate-400 mb-1">GROUND TRUTH SOURCE</p>
              <p className="text-sm font-semibold text-white">Direct County Recorder Integration</p>
            </div>
          </div>
        </div>
      )
    },
  ]

  return (
    <section className="py-28 bg-white border-t border-slate-100">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#2F5FFF] block mb-3">
              CONTEXT-AWARE CARTOGRAPHY
            </span>
            <h2 className="text-[38px] md:text-[46px] font-bold tracking-[-0.03em] leading-[1.05] text-[#0F0F0F]">
              AI that knows your parcels. AI that knows your market.
            </h2>
          </div>
          <p className="text-[18px] text-[#4B5563] leading-[1.6] font-medium pt-2">
            Perfect Property isn't a generic chatbot. It starts with your actual parcels and your specific submarket context, so every memo, ARV model, and cadastral visual looks like your best principal analyst's hand-crafted work.
          </p>
        </div>

        {/* Animated Tabs Navigation */}
        <AnimatedTabs
          tabs={tabs}
          defaultValue="visuals"
          onChange={(val) => setActiveTab(val)}
          containerClassName="bg-slate-100/90 border border-slate-200"
          contentClassName="mt-6"
        />
      </div>
    </section>
  )
}
