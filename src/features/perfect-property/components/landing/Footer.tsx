import { Link } from '@tanstack/react-router'
import { Brand, BRAND_CONFIG } from '../Brand'

export const Footer = () => {
  return (
    <footer className="py-20 bg-white border-t border-[#F3F4F6]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" id="landing-footer-logo-link" className="inline-block text-[#0F172A] hover:opacity-90 transition-opacity">
              <Brand id="landing-footer-brand" compact={false} textClassName="text-[#0F172A] tracking-wider font-extrabold text-[16px]" />
            </Link>
            <p className="mt-4 text-[14px] text-[#64748B] max-w-[280px] leading-[1.6]">
              Institutional-grade property underwriting, risk-adjusted deal ranking, and real-time parcel intelligence.
            </p>
          </div>
          
          <div>
            <h4 className="text-[12px] font-bold text-[#0F172A] mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-3 text-[14px] font-medium text-[#64748B]">
              <li><Link to="/workspace" className="hover:text-[#0F172A] transition-colors">Workspace Map</Link></li>
              <li><Link to="/deals" className="hover:text-[#0F172A] transition-colors">Ranked Deals</Link></li>
              <li><Link to="/shadow" className="hover:text-[#0F172A] transition-colors">Off-Market Signals</Link></li>
              <li><Link to="/prophecy" className="hover:text-[#0F172A] transition-colors">Prophecy Engine</Link></li>
              <li><Link to="/accuracy" className="hover:text-[#0F172A] transition-colors">Prediction Accuracy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-bold text-[#0F172A] mb-4 uppercase tracking-wider">Markets</h4>
            <ul className="space-y-3 text-[14px] font-medium text-[#64748B]">
              <li><Link to="/workspace" search={{ query: 'Miami' }} className="hover:text-[#0F172A] transition-colors">Miami & Dade</Link></li>
              <li><Link to="/workspace" search={{ query: 'Orlando' }} className="hover:text-[#0F172A] transition-colors">Orlando & Orange</Link></li>
              <li><Link to="/workspace" search={{ query: 'Tampa' }} className="hover:text-[#0F172A] transition-colors">Tampa & Hillsborough</Link></li>
              <li><Link to="/workspace" search={{ query: 'Jacksonville' }} className="hover:text-[#0F172A] transition-colors">Jacksonville & Duval</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-bold text-[#0F172A] mb-4 uppercase tracking-wider">Verification</h4>
            <ul className="space-y-3 text-[14px] font-medium text-[#64748B]">
              <li><span className="text-[#94A3B8]">County Cadastral Data</span></li>
              <li><span className="text-[#94A3B8]">Spatial Comps Buffer</span></li>
              <li><span className="text-[#94A3B8]">FEMA Flood Overlays</span></li>
              <li><span className="text-[#94A3B8]">Permit & Lien Trajectory</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-bold text-[#0F172A] mb-4 uppercase tracking-wider">Access</h4>
            <ul className="space-y-3 text-[14px] font-medium text-[#64748B]">
              <li><Link to="/auth" className="hover:text-[#0F172A] transition-colors">Analyst Sign In</Link></li>
              <li><Link to="/monitoring" className="hover:text-[#0F172A] transition-colors">Portfolio Monitoring</Link></li>
              <li><Link to="/admin" className="hover:text-[#0F172A] transition-colors">Admin Gateway</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-[#F1F5F9] text-[13px] font-medium text-[#94A3B8]">
          <p>{BRAND_CONFIG.copyright}</p>
          <div className="flex gap-6">
            <span>Florida Cadastral Real Estate Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
