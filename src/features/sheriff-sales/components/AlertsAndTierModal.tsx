import { useState } from 'react';
import {
  BellRinging,
  CheckCircle,
  CreditCard,
  ShieldCheck,
  Sparkle,
  TrendUp,
  X,
  Lightning,
} from '@phosphor-icons/react';

export function AlertsAndTierModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'alerts' | 'pricing'>('alerts');
  const [selectedPlan, setSelectedPlan] = useState<'PRO' | 'INSTITUTIONAL'>('PRO');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribedSuccess, setSubscribedSuccess] = useState(false);

  // Watchlist alert state
  const [alertCounty, setAlertCounty] = useState('Bergen County, NJ');
  const [alertMinSpread, setAlertMinSpread] = useState(75000);
  const [alertPeremptoryOnly, setAlertPeremptoryOnly] = useState(true);
  const [alertSaved, setAlertSaved] = useState(false);

  function handleSaveAlert() {
    setAlertSaved(true);
    setTimeout(() => setAlertSaved(false), 3000);
  }

  function handleSubscribe() {
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setSubscribedSuccess(true);
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 space-y-6">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
              <Lightning size={16} />
              <span>SUBSCRIPTION & AUTOMATED RADAR</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Custom Alerts & Commercial Pro Tier
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated deal dispatch for institutional bidders and local flippers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-6 gap-6 text-xs font-bold font-mono">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-3 transition-all border-b-2 ${
              activeTab === 'alerts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Automated Deal Alerts
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`pb-3 transition-all border-b-2 ${
              activeTab === 'pricing'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Pro & Institutional Tiers (Stripe)
          </button>
        </div>

        <div className="p-6 pt-0 space-y-6">
          {/* TAB 1: ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-6 font-sans">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5 font-mono uppercase">
                  <BellRinging size={15} /> Real-Time Trigger Rules
                </span>
                <p className="text-xs text-blue-800">
                  Receive instant Telegram/SMS dispatch the moment a new Chancery Writ is filed or a foreclosure sale
                  becomes peremptory with zero adjournments left.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target County</label>
                  <select
                    value={alertCounty}
                    onChange={(e) => setAlertCounty(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900"
                  >
                    <option value="Bergen County, NJ">Bergen County, NJ</option>
                    <option value="Middlesex County, NJ">Middlesex County, NJ</option>
                    <option value="Essex County, NJ">Essex County, NJ</option>
                    <option value="Philadelphia County, PA">Philadelphia County, PA</option>
                    <option value="Allegheny County, PA">Allegheny County, PA</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Minimum Modeled Equity Spread</label>
                  <select
                    value={alertMinSpread}
                    onChange={(e) => setAlertMinSpread(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900"
                  >
                    <option value={50000}>$50,000+ Net Margin</option>
                    <option value={75000}>$75,000+ Net Margin (Recommended)</option>
                    <option value={100000}>$100,000+ Net Margin (Institutional Tier)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertPeremptoryOnly}
                    onChange={(e) => setAlertPeremptoryOnly(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Peremptory Auctions Only (Exclude sales with debtor adjournments remaining)
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 pl-5">
                  Filters out deals where defendants might request a 30-day statutory postponement on the day of the sale.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                {alertSaved && (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle size={16} /> Alert trigger saved! Running daily 8:00 AM sweep.
                  </span>
                )}
                <button
                  onClick={handleSaveAlert}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
                >
                  <BellRinging size={15} />
                  <span>Activate Watchlist Alert</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & STRIPE */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block font-mono">Community Free List Threshold</span>
                  <span className="text-slate-600 text-[11px]">
                    Current subscriber count: <strong>1,140 investors</strong> (Paid tier activated per build sequence).
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                  PAID GATE LIVE
                </span>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pro Tier */}
                <div
                  onClick={() => setSelectedPlan('PRO')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPlan === 'PRO' ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono font-bold text-blue-600 uppercase">PRO INVESTOR</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">
                        $99 <span className="text-xs font-normal text-slate-500">/ month</span>
                      </h3>
                    </div>
                    {selectedPlan === 'PRO' && <CheckCircle size={22} className="text-blue-600" />}
                  </div>
                  <ul className="mt-4 space-y-2 text-xs text-slate-700">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                      <span>Full 17 NJ counties + PA/OH/TX sheets</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                      <span>The Four Listing Panels & Bid Cards</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                      <span>Assisted Lien Check (Hack 8) priority waterfall</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                      <span>Unlimited “Ask This Listing” AI queries</span>
                    </li>
                  </ul>
                </div>

                {/* Institutional Tier */}
                <div
                  onClick={() => setSelectedPlan('INSTITUTIONAL')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPlan === 'INSTITUTIONAL' ? 'border-indigo-600 bg-indigo-50/50 shadow-md' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono font-bold text-indigo-600 uppercase">INSTITUTIONAL / FUND</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">
                        $499 <span className="text-xs font-normal text-slate-500">/ month</span>
                      </h3>
                    </div>
                    {selectedPlan === 'INSTITUTIONAL' && <CheckCircle size={22} className="text-indigo-600" />}
                  </div>
                  <ul className="mt-4 space-y-2 text-xs text-slate-700">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-indigo-600 shrink-0" />
                      <span>Everything in Pro plus Multi-Seat Access</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-indigo-600 shrink-0" />
                      <span>Direct REST API & Webhook dispatch</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-indigo-600 shrink-0" />
                      <span>Raw County Deed Book JSON feeds</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-indigo-600 shrink-0" />
                      <span>Dedicated Underwriting Account Manager</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Checkout Button */}
              {subscribedSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-center text-xs text-emerald-800 font-bold space-y-1">
                  <div>✓ Stripe Subscription Verified!</div>
                  <div className="text-[11px] font-normal">Welcome to {selectedPlan} Tier. All pro features and real-time feeds are unlocked.</div>
                </div>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <CreditCard size={18} />
                  <span>{isSubscribing ? 'Processing Stripe Checkout…' : `Start 14-Day Trial of ${selectedPlan} Tier`}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
