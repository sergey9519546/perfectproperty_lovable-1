import { motion } from 'motion/react'
import { ArrowRight, Sparkles, Building2, EyeOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { GridPattern } from '@/components/ui/aceternity/grid-pattern'
import { HoverBorderGradient } from '@/components/ui/aceternity/hover-border-gradient'

export const Hero = ({ onExplore }: { onExplore: (query?: string, mode?: 'Deals' | 'Shadow') => void }) => {
  const [activeMode, setActiveMode] = useState<'Deals' | 'Shadow'>('Deals')
  const [urlInput, setUrlInput] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onExplore(urlInput.trim() || undefined, activeMode)
  }

  const handleSampleClick = (sample: string) => {
    setUrlInput(sample)
    onExplore(sample, activeMode)
  }

  return (
    <section className="relative pt-32 pb-16 overflow-hidden flex flex-col items-center">
      {/* Cadastral Coordinate Grid Pattern (Aceternity UI) */}
      <GridPattern
        width={40}
        height={40}
        x={-1}
        y={-1}
        strokeDasharray="4 2"
        squares={[
          [4, 3],
          [2, 7],
          [8, 5],
          [12, 4],
          [16, 8],
          [20, 3],
        ]}
        className="opacity-75 [mask-image:radial-gradient(ellipse_75%_55%_at_50%_40%,#000_65%,transparent_100%)]"
      />

      {/* Signature Wash - 60% height background div containing bottom-aligned radial gradient blue blob */}
      <div 
        id="hero-radial-blob"
        className="absolute bottom-0 left-0 right-0 h-[60%] z-[-1] pointer-events-none overflow-hidden"
      >
        <div 
          className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[140%] max-w-[1400px] h-[130%] blur-[100px] opacity-75 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 100%, #60A5FA 0%, #93C5FD 30%, #DBEAFE 55%, rgba(255,255,255,0) 80%)'
          }}
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10 flex flex-col items-center">
        {/* Subtle pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-800 text-xs font-bold tracking-wider uppercase mb-6 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Perfect Property Intelligence Engine</span>
        </motion.div>

        <motion.h1 
          id="hero-headline"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[46px] sm:text-[56px] md:text-[72px] font-bold leading-[1.05] tracking-[-0.04em] text-[#0F172A] max-w-[880px] mb-6"
        >
          Every parcel underwritten. Every signal verified.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[17px] sm:text-[20px] md:text-[22px] text-[#475569] max-w-[720px] mb-10 leading-[1.45] font-medium"
        >
          Institutional-grade property deal scoring, spatial parcel boundaries, and real-time ground truth across Florida real estate markets.
        </motion.p>

        {/* 'Deals | Shadow' Physics-Based Animated Spring Toggle (Aceternity UI Tabs pattern) */}
        <motion.div 
          id="deals-shadow-toggle-pill"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex p-1.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-full mb-8 shadow-inner relative"
        >
          <button
            id="toggle-mode-deals"
            type="button"
            onClick={() => setActiveMode('Deals')}
            className={`relative z-10 flex items-center gap-2 px-7 py-2.5 text-[14px] font-semibold rounded-full transition-colors duration-200 cursor-pointer ${
              activeMode === 'Deals' ? 'text-[#0F172A]' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {activeMode === 'Deals' && (
              <motion.div
                layoutId="hero-active-pill"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                className="absolute inset-0 bg-white rounded-full shadow-[0_2px_8px_rgba(15,23,42,0.08)] z-[-1]"
              />
            )}
            <Building2 className={`w-4 h-4 ${activeMode === 'Deals' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Deals</span>
          </button>
          <button
            id="toggle-mode-shadow"
            type="button"
            onClick={() => setActiveMode('Shadow')}
            className={`relative z-10 flex items-center gap-2 px-7 py-2.5 text-[14px] font-semibold rounded-full transition-colors duration-200 cursor-pointer ${
              activeMode === 'Shadow' ? 'text-[#0F172A]' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {activeMode === 'Shadow' && (
              <motion.div
                layoutId="hero-active-pill"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                className="absolute inset-0 bg-white rounded-full shadow-[0_2px_8px_rgba(15,23,42,0.08)] z-[-1]"
              />
            )}
            <EyeOff className={`w-4 h-4 ${activeMode === 'Shadow' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Shadow</span>
          </button>
        </motion.div>

        {/* URL Input Field with Blue Circular Submit Button Inside */}
        <motion.form 
          id="hero-url-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[560px] group mb-6"
        >
          <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/15 transition-all opacity-70 group-hover:opacity-100" />
          <div className="relative flex items-center bg-white rounded-full border border-slate-200 shadow-[0_4px_24px_rgba(15,23,42,0.08)] p-2 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
            <input 
              id="hero-url-input"
              type="text" 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={activeMode === 'Deals' ? 'Paste Redfin/Zillow URL or County Assessor APN...' : 'Enter auction docket, tax lien, or notice ID...'}
              className="flex-1 h-12 pl-6 pr-3 bg-transparent border-none focus:outline-none focus:ring-0 text-[15px] sm:text-[16px] text-slate-900 placeholder:text-slate-400"
            />
            <button 
              id="hero-submit-btn"
              type="submit"
              title="Analyze Parcel"
              className="h-11 w-11 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md shadow-blue-600/30 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </motion.form>

        {/* Quick Sample Links & Moving Border CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 mb-8"
        >
          <span className="font-medium text-slate-400">Quick sample:</span>
          <button 
            type="button"
            onClick={() => handleSampleClick('https://assessor.lacounty.gov/parcel/5542-012-004')}
            className="text-blue-600 hover:text-blue-800 underline decoration-blue-200 underline-offset-2 hover:decoration-blue-500 transition-all cursor-pointer"
          >
            LA County APN 5542-012-004
          </button>
          <span className="text-slate-300">•</span>
          <button 
            type="button"
            onClick={() => handleSampleClick('https://redfin.com/CA/Los-Angeles/742-Evergreen-Terrace/home/1283910')}
            className="text-blue-600 hover:text-blue-800 underline decoration-blue-200 underline-offset-2 hover:decoration-blue-500 transition-all cursor-pointer"
          >
            Redfin Listing
          </button>
          <span className="text-slate-300">•</span>
          <HoverBorderGradient
            onClick={() => onExplore()}
            containerClassName="shadow-xs hover:shadow-md"
            className="text-xs py-1.5 px-3.5 text-blue-600 font-semibold flex items-center gap-1.5"
          >
            <span>Launch Interactive Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </HoverBorderGradient>
        </motion.div>

        {/* Brand Logos */}
        <div className="mt-12 sm:mt-16 w-full opacity-60 overflow-hidden">
          <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-8">
            Ingestion across enterprise data feeds
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 sm:gap-x-16 gap-y-6 grayscale pointer-events-none opacity-80">
            <div className="text-[18px] sm:text-[20px] font-extrabold tracking-tighter text-slate-700">SERVICELINK</div>
            <div className="text-[18px] sm:text-[20px] font-extrabold tracking-tighter text-slate-700">ZYTE</div>
            <div className="text-[18px] sm:text-[20px] font-extrabold tracking-tighter text-slate-700">SCRAPY</div>
            <div className="text-[18px] sm:text-[20px] font-extrabold tracking-tighter text-slate-700">REALIE</div>
            <div className="text-[18px] sm:text-[20px] font-extrabold tracking-tighter text-slate-700">ATTOM</div>
            <div className="text-[18px] sm:text-[20px] font-extrabold tracking-tighter text-slate-700">CADASTRAL</div>
          </div>
        </div>
      </div>
    </section>
  )
}
