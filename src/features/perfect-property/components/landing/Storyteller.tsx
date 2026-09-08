import { Button } from "@/components/ui/button";
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Play, X, CheckCircle, ArrowRight, Zap, Clock, ShieldCheck, Sparkles, Building2 } from 'lucide-react'
import { CardSpotlight, HoverBorderGradient } from '@/components/ui/aceternity'

export const Storyteller = () => {
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [activeWorkflow, setActiveWorkflow] = useState<'traditional' | 'automated'>('automated')

  return (
    <section className="py-28 bg-card">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-primary block mb-3">
            THE UNDERWRITING BOTTLENECK
          </span>
          <h2 className="text-[38px] md:text-[50px] font-bold tracking-[-0.04em] leading-[1.05] text-background mb-6 max-w-[800px] mx-auto">
            You're the deal hunter. Perfect Property makes every opportunity clear.
          </h2>
          <p className="text-[19px] text-muted-foreground max-w-[760px] mx-auto leading-[1.6] font-medium">
            In a fast-moving market, deal velocity and analytical rigor matter most. Perfect Property automates underwriting in seconds.
          </p>
        </div>

        {/* Showcase Container with Browser Chrome */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#EBFCE5] rounded-[32px] border border-[#D5EED0] shadow-[0_32px_64px_-12px_rgba(15,23,42,0.08)] overflow-hidden min-h-[620px] relative flex flex-col group"
        >
          {/* Browser Top Bar */}
          <div className="h-12 bg-card/95 backdrop-blur px-6 flex items-center justify-between border-b border-slate-200/60 z-20">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-xs" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-xs" />
              <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-xs" />
            </div>
            <div className="flex items-center gap-2 bg-accent/90 px-4 py-1 rounded-md border border-slate-200/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-muted-foreground tracking-wide uppercase">
                perfectproperty.com/workspace/florida
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
              NIGHTLY INGESTION LIVE
            </div>
          </div>

          <div className="flex-1 p-6 md:p-12 relative flex items-center justify-center overflow-hidden">
            {/* Subtle radial backdrop accent */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#FFFFFF_0%,_transparent_75%)] opacity-50 pointer-events-none" />

            {/* Floating parcel card 1 — DEAL (Top Left) */}
            <motion.div 
              animate={{ y: [0, -14, 0], rotate: [0, -0.8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 left-4 md:left-14 w-72 md:w-80 z-10 hidden sm:block"
            >
              <CardSpotlight className="bg-card/95 backdrop-blur-md p-5 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12)] border border-slate-200">
                <div className="w-full h-32 bg-accent rounded-xl mb-3 overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800" 
                    alt="Austin Property" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-card/90 backdrop-blur rounded text-[10px] font-mono font-bold text-primary border border-blue-100 shadow-xs">
                    RING 1 DEAL
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur rounded text-[9px] font-mono text-slate-200">
                    APN: 021-994-01
                  </div>
                </div>

                <div className="font-bold text-[15px] text-foreground mb-2">123 Main St, Austin TX</div>
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Underwrite ARV:</span>
                    <span className="font-bold text-foreground">$342,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Projected Profit:</span>
                    <span className="font-bold text-emerald-600">+$52,800 (23.4%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Confidence:</span>
                    <span className="font-bold text-primary">97.8% (28 comps)</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">Underwritten in 6s</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    APPROVED
                  </span>
                </div>
              </CardSpotlight>
            </motion.div>

            {/* Floating parcel card 2 — SHADOW (Bottom Right) */}
            <motion.div 
              animate={{ y: [0, 14, 0], rotate: [0, 0.8, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-10 right-4 md:right-14 w-72 md:w-80 z-10 hidden sm:block"
            >
              <CardSpotlight className="bg-card/95 backdrop-blur-md p-5 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12)] border border-slate-200">
                <div className="w-full h-32 bg-accent rounded-xl mb-3 overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800" 
                    alt="Denver Property" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-amber-500 text-white rounded text-[10px] font-mono font-bold shadow-xs">
                    SHADOW DISTRESS
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur rounded text-[9px] font-mono text-slate-200">
                    TAX LIEN LIS PENDENS
                  </div>
                </div>

                <div className="font-bold text-[15px] text-foreground mb-2">456 Oak Ave, Denver CO</div>
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Off-Market Prob:</span>
                    <span className="font-bold text-amber-600">82.4% Notice</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Tax Arrears:</span>
                    <span className="font-bold text-foreground">$18,450 (2 yrs)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Equity Spread:</span>
                    <span className="font-bold text-emerald-600">+$124,000</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">Pre-Listing Alert</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                    OUTREACH READY
                  </span>
                </div>
              </CardSpotlight>
            </motion.div>

            {/* Central Content */}
            <div className="text-center z-20 max-w-[480px] px-4 py-8">
              <motion.button 
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowDemoModal(true)}
                className="w-18 h-18 bg-card rounded-2xl flex items-center justify-center shadow-xl mb-6 mx-auto cursor-pointer border border-slate-200/80 transition-transform group/btn"
                aria-label="Open Interactive Demo"
              >
                <Play size={28} fill="#efaa2d" className="text-primary ml-1 transition-transform group-hover/btn:scale-110" />
              </motion.button>
              
              <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-background">
                See the engine in action
              </h3>
              <p className="text-muted-foreground mb-8 leading-relaxed text-[17px] font-medium">
                Compare traditional 4-hour manual spreadsheet underwriting against our 8-second automated cadastral pipeline.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => setShowDemoModal(true)}
                  className="h-12 px-8 bg-background text-white rounded-xl font-bold text-sm hover:bg-black shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Play size={16} fill="white" />
                  Launch Interactive Demo
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Speed Comparison Metric Bar */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-muted border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs font-mono font-bold uppercase text-muted-foreground">Underwrite Velocity</span>
            </div>
            <p className="text-2xl font-bold text-foreground font-mono">8 Seconds / Parcel</p>
            <p className="text-xs text-muted-foreground mt-1">vs. 4.5 hours manual analyst spreadsheet time</p>
          </div>

          <div className="p-6 rounded-2xl bg-muted border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-xs font-mono font-bold uppercase text-muted-foreground">Nightly Scanning</span>
            </div>
            <p className="text-2xl font-bold text-primary font-mono">100% Full County</p>
            <p className="text-xs text-muted-foreground mt-1">Every parcel re-scored nightly on tax &amp; lien rolls</p>
          </div>

          <div className="p-6 rounded-2xl bg-muted border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-mono font-bold uppercase text-muted-foreground">IC Dossier Output</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600 font-mono">Lender-Ready Memos</p>
            <p className="text-xs text-muted-foreground mt-1">Complete with comp regressions &amp; repair schedules</p>
          </div>
        </div>
      </div>

      {/* Interactive Demo Simulation Modal */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-3xl border border-slate-200 max-w-2xl w-full p-8 shadow-2xl relative overflow-hidden"
            >
              <Button 
                onClick={() => setShowDemoModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-muted-foreground rounded-full hover:bg-accent transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={20} />
              </Button>

              <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold mb-3">
                <Sparkles className="w-4 h-4" />
                PIPELINE EXECUTION BENCHMARK
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Speed &amp; Depth Benchmark
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                See how automated cadastral underwriting changes institutional acquisition throughput.
              </p>

              {/* Workflow Toggle */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-accent rounded-xl mb-6 font-semibold text-xs">
                <Button
                  onClick={() => setActiveWorkflow('traditional')}
                  className={`py-2.5 px-4 rounded-lg transition-all cursor-pointer ${
                    activeWorkflow === 'traditional'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Manual Analyst Flow (4.5 hrs)
                </Button>
                <Button
                  onClick={() => setActiveWorkflow('automated')}
                  className={`py-2.5 px-4 rounded-lg transition-all cursor-pointer ${
                    activeWorkflow === 'automated'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Perfect Property Nightly Engine (8 sec)
                </Button>
              </div>

              {activeWorkflow === 'traditional' ? (
                <div className="space-y-3 font-sans text-xs text-muted-foreground">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-muted">
                    <p className="font-bold text-foreground mb-1">Step 1: Download County Tax PDF (45 mins)</p>
                    <p>Analyst navigates county clerk portal, enters APN, manually extracts deed history and tax rate.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-muted">
                    <p className="font-bold text-foreground mb-1">Step 2: Zillow / Redfin Comps Search (90 mins)</p>
                    <p>Subjective comp selection prone to cherry-picking without hedonic spatial adjustments.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-muted">
                    <p className="font-bold text-foreground mb-1">Step 3: Excel Model Data Entry (90 mins)</p>
                    <p>Formula errors, outdated interest rate assumptions, missing title lien cross-checks.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-muted">
                    <p className="font-bold text-foreground mb-1">Step 4: Investment Memo Formatting (45 mins)</p>
                    <p>Copy-pasting screenshots into slide decks. Only 2 deals underwritten per analyst day.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900">
                    <div className="flex justify-between font-bold mb-1">
                      <span>✓ Ingest APN &amp; Deeds</span>
                      <span>0.14s</span>
                    </div>
                    <p className="font-sans text-xs text-emerald-800">
                      Automated ingestion of county tax rolls, transfer stamps, and deed chains directly into vector store.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900">
                    <div className="flex justify-between font-bold mb-1">
                      <span>✓ Hedonic Comp Regression</span>
                      <span>0.28s</span>
                    </div>
                    <p className="font-sans text-xs text-emerald-800">
                      Evaluates 40+ micro-market comps adjusted for square footage, lot slope, school rating, and condition.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900">
                    <div className="flex justify-between font-bold mb-1">
                      <span>✓ Title &amp; Distress Lien Audit</span>
                      <span>0.19s</span>
                    </div>
                    <p className="font-sans text-xs text-emerald-800">
                      Scans county court records for notice of default, lis pendens, mechanic's liens, and municipal fines.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900">
                    <div className="flex justify-between font-bold mb-1">
                      <span>✓ Full IC Memo Compilation</span>
                      <span>0.09s</span>
                    </div>
                    <p className="font-sans text-xs text-emerald-800">
                      Generates complete investment committee dossier with return distributions and confidence bands.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => setShowDemoModal(false)}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold font-mono hover:bg-black transition-colors cursor-pointer"
                >
                  CLOSE BENCHMARK
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
