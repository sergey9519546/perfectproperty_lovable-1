import { motion } from 'motion/react'
import { Link } from '@tanstack/react-router'
import { Brand } from '../Brand'

export const Header = ({ scrolled, onSignIn, onExplore }: { scrolled: boolean; onSignIn: () => void; onExplore: () => void }) => {
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-500 ease-in-out ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1280px] mx-auto h-full px-6 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" id="landing-header-logo-link" className="flex items-center text-[#0F172A] hover:opacity-90 transition-opacity">
            <Brand id="landing-header-brand" compact={false} textClassName="text-[#0F172A] tracking-wider font-extrabold text-[17px]" />
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-[13px] font-semibold text-[#475569]">
            <Link 
              to="/workspace" 
              className="px-3 py-1.5 hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors"
            >
              Workspace Map
            </Link>
            <Link 
              to="/deals" 
              className="px-3 py-1.5 hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors"
            >
              Ranked Deals
            </Link>
            <Link 
              to="/sheriff-sales" 
              className="px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Sheriff & Gov Sales</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-100 text-blue-800 uppercase font-mono">New</span>
            </Link>
            <Link 
              to="/shadow" 
              className="px-3 py-1.5 hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors"
            >
              Off-Market
            </Link>
            <Link 
              to="/prophecy" 
              className="px-3 py-1.5 hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors"
            >
              Predictions
            </Link>
            <Link 
              to="/accuracy" 
              className="px-3 py-1.5 hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors"
            >
              Accuracy
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onSignIn}
            className="px-4 py-2 text-[14px] font-semibold text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-all cursor-pointer"
          >
            Log in
          </button>
          <button 
            onClick={onExplore}
            className="h-10 px-5 text-[14px] font-bold bg-[#2F5FFF] text-white rounded-xl hover:bg-[#2555FF] shadow-[0_4px_12px_rgba(47,95,255,0.25)] hover:shadow-[0_4px_16px_rgba(47,95,255,0.35)] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            Launch Engine
          </button>
        </div>
      </div>
    </header>
  )
}
