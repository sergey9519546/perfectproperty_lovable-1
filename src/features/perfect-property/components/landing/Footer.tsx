import { Link } from '@tanstack/react-router'
import { Brand, BRAND_CONFIG } from '../Brand'

export const Footer = () => {
  return (
    <footer className="py-20 bg-card border-t border-accent">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" id="landing-footer-logo-link" className="inline-block text-foreground hover:opacity-90 transition-opacity">
              <Brand id="landing-footer-brand" compact={false} textClassName="text-foreground tracking-wider font-extrabold text-[16px]" />
            </Link>
            <p className="mt-4 text-[14px] text-muted-foreground max-w-[280px] leading-[1.6]">
              Institutional-grade property underwriting, risk-adjusted deal ranking, and real-time parcel intelligence.
            </p>
          </div>
          
          <div>
            <h4 className="text-[12px] font-bold text-foreground mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-3 text-[14px] font-medium text-muted-foreground">
              <li><Link to="/workspace" className="hover:text-foreground transition-colors">Workspace Map</Link></li>
              <li><Link to="/deals" className="hover:text-foreground transition-colors">Ranked Deals</Link></li>
              <li><Link to="/shadow" className="hover:text-foreground transition-colors">Off-Market Signals</Link></li>
              <li><Link to="/prophecy" className="hover:text-foreground transition-colors">Prophecy Engine</Link></li>
              <li><Link to="/accuracy" className="hover:text-foreground transition-colors">Prediction Accuracy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-bold text-foreground mb-4 uppercase tracking-wider">Markets</h4>
            <ul className="space-y-3 text-[14px] font-medium text-muted-foreground">
              <li><Link to="/workspace" search={{ query: 'Cook' }} className="hover:text-foreground transition-colors">Cook County, IL <span className="text-[11px] font-bold text-primary">(Focus)</span></Link></li>
              <li><Link to="/workspace" search={{ query: 'Los Angeles' }} className="hover:text-foreground transition-colors">Los Angeles, CA</Link></li>
              <li><Link to="/workspace" search={{ query: 'New York' }} className="hover:text-foreground transition-colors">New York, NY</Link></li>
              <li><Link to="/workspace" className="hover:text-foreground transition-colors">All Covered Metros</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-bold text-foreground mb-4 uppercase tracking-wider">Legal & Trust</h4>
            <ul className="space-y-3 text-[14px] font-medium text-muted-foreground">
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refunds" className="hover:text-foreground transition-colors">Refund & Cancellation</Link></li>
              <li><a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="hover:text-foreground transition-colors">Contact Merchant</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-bold text-foreground mb-4 uppercase tracking-wider">Access</h4>
            <ul className="space-y-3 text-[14px] font-medium text-muted-foreground">
              <li><Link to="/auth" className="hover:text-foreground transition-colors">Analyst Sign In</Link></li>
              <li><Link to="/monitoring" className="hover:text-foreground transition-colors">Portfolio Monitoring</Link></li>
              <li><Link to="/admin" className="hover:text-foreground transition-colors">Admin Gateway</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-muted text-[13px] font-medium text-muted-foreground">
          <p>{BRAND_CONFIG.copyright}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span>Operated by {BRAND_CONFIG.legalName}</span>
            <span>·</span>
            <span>Reseller & Merchant of Record: Paddle.com</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
