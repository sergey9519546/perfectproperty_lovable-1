import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Brand } from "./Brand";
import {
  MapPin,
  Gavel,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  TrendingUp,
  Search,
  Eye,
  CheckCircle2,
} from "lucide-react";

export interface LandingPageProps {
  onExplore: (query?: string, mode?: "Deals" | "Shadow") => void;
  onSignIn: () => void;
}

export function LandingPage({ onExplore, onSignIn }: LandingPageProps) {
  const [searchInput, setSearchInput] = useState("");
  const [activeMode, setActiveMode] = useState<"Deals" | "Shadow">("Deals");

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    onExplore(searchInput.trim() || undefined, activeMode);
  };

  const handleSampleClick = (sample: string) => {
    setSearchInput(sample);
    onExplore(sample, activeMode);
  };

  return (
    <div
      id="perfect-property-landing-root"
      className="min-h-screen bg-pp-page text-pp-text antialiased selection:bg-pp-gold/20 selection:text-pp-gold"
    >
      {/* Top Navigation */}
      <header
        id="landing-institutional-header"
        className="sticky top-0 z-50 border-b border-pp-border/70 bg-pp-page/90 backdrop-blur-md"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              id="landing-logo-anchor"
              className="flex items-center text-pp-text hover:opacity-90 transition-opacity"
            >
              <Brand
                id="landing-brand-logo"
                compact={false}
                iconClassName="h-7 w-7 shrink-0"
                textClassName="text-[13px] font-bold tracking-[0.14em] text-pp-text sm:inline"
              />
            </Link>
            <nav id="landing-primary-nav" className="hidden md:flex items-center gap-1 text-[13px] text-pp-muted">
              <Link
                to="/workspace"
                id="landing-nav-map"
                className="rounded-md px-3 py-1.5 transition-colors hover:bg-pp-surface hover:text-pp-text"
              >
                Live Map
              </Link>
              <Link
                to="/deals"
                id="landing-nav-deals"
                className="rounded-md px-3 py-1.5 transition-colors hover:bg-pp-surface hover:text-pp-text"
              >
                Ranked Deals
              </Link>
              <Link
                to="/sheriff-sales"
                id="landing-nav-sheriff"
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-pp-gold transition-colors hover:bg-pp-surface"
              >
                <span>Sheriff & Gov Sales</span>
                <span className="rounded bg-pp-gold/15 px-1.5 py-0.5 text-[9px] font-mono uppercase text-pp-gold">
                  Live
                </span>
              </Link>
              <Link
                to="/notices"
                id="landing-nav-notices"
                className="rounded-md px-3 py-1.5 transition-colors hover:bg-pp-surface hover:text-pp-text"
              >
                Notice Reader
              </Link>
              <Link
                to="/prophecy"
                id="landing-nav-prophecy"
                className="rounded-md px-3 py-1.5 transition-colors hover:bg-pp-surface hover:text-pp-text"
              >
                Prophecy
              </Link>
              <Link
                to="/accuracy"
                id="landing-nav-accuracy"
                className="rounded-md px-3 py-1.5 transition-colors hover:bg-pp-surface hover:text-pp-text"
              >
                Accuracy
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button
              id="landing-signin-btn"
              type="button"
              onClick={onSignIn}
              className="rounded-md border border-pp-border/80 bg-pp-surface px-4 py-2 text-xs font-semibold text-pp-text transition-colors hover:bg-pp-surface-raised cursor-pointer"
            >
              Sign In
            </Button>
            <Button
              id="landing-launch-btn"
              type="button"
              onClick={() => onExplore()}
              className="rounded-md bg-pp-gold px-4 py-2 text-xs font-semibold text-black transition-all hover:bg-pp-gold-bright cursor-pointer"
            >
              Launch Terminal
            </Button>
          </div>
        </div>
      </header>

      {/* Main Terminal Overview */}
      <main id="landing-main-terminal" className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
        {/* Terminal Header */}
        <section id="landing-hero-section" className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-pp-gold/30 bg-pp-gold/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-pp-gold mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-pp-gold animate-pulse" />
            Continuous Cadastral Underwriting & Acquisition Intelligence
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.15] text-pp-text">
            Underwrite every property with institutional mathematical certainty.
          </h1>

          <p className="mt-5 text-base sm:text-lg leading-relaxed text-pp-muted max-w-2xl mx-auto">
            Real-time distress intelligence across 23 counties in New Jersey and Pennsylvania.
            Algorithmic purchase offers, Monte Carlo risk calibration, and statutory auction tracking.
          </p>

          {/* Quick Search & Command Bar */}
          <div id="landing-command-box" className="mt-8 rounded-xl border border-pp-border/80 bg-pp-surface p-4 sm:p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-pp-border/60 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Button
                  id="mode-deals-tab"
                  type="button"
                  onClick={() => setActiveMode("Deals")}
                  className={`rounded px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    activeMode === "Deals"
                      ? "bg-pp-page text-pp-gold border border-pp-border"
                      : "text-pp-muted hover:text-pp-text"
                  }`}
                >
                  On & Pre-Market Deals
                </Button>
                <Button
                  id="mode-shadow-tab"
                  type="button"
                  onClick={() => setActiveMode("Shadow")}
                  className={`rounded px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    activeMode === "Shadow"
                      ? "bg-pp-page text-pp-gold border border-pp-border"
                      : "text-pp-muted hover:text-pp-text"
                  }`}
                >
                  Shadow Distress Signals
                </Button>
              </div>
              <span className="text-[11px] text-pp-muted hidden sm:inline">
                Press Enter to inspect parcel
              </span>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-pp-muted" />
                <Input
                  id="landing-search-input"
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter address, APN, or municipality (e.g. 184 Clinton Pl, Hackensack, NJ)..."
                  className="w-full rounded-lg border border-pp-border bg-pp-page py-2.5 pl-10 pr-4 text-sm text-pp-text placeholder:text-pp-faint focus:border-pp-gold focus:outline-none focus:ring-1 focus:ring-pp-gold font-sans"
                />
              </div>
              <Button
                id="landing-search-submit"
                type="submit"
                className="flex items-center justify-center gap-2 rounded-lg bg-pp-gold px-5 py-2.5 text-xs font-bold text-black hover:bg-pp-gold-bright transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Inspect Parcel</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Quick Samples */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-pp-muted">
              <span className="text-pp-faint">Verified notices:</span>
              <Button
                type="button"
                onClick={() => handleSampleClick("184 Clinton Pl, Hackensack, NJ")}
                className="hover:text-pp-gold hover:underline cursor-pointer"
              >
                184 Clinton Pl (Bergen)
              </Button>
              <span>•</span>
              <Button
                type="button"
                onClick={() => handleSampleClick("291 S Harrison St, East Orange, NJ")}
                className="hover:text-pp-gold hover:underline cursor-pointer"
              >
                291 S Harrison St (Essex)
              </Button>
              <span>•</span>
              <Button
                type="button"
                onClick={() => handleSampleClick("452 Elm St, Hackensack, NJ")}
                className="hover:text-pp-gold hover:underline cursor-pointer"
              >
                452 Elm St (Chancery)
              </Button>
            </div>
          </div>
        </section>

        {/* Live Metrics Grid */}
        <section id="landing-metrics-strip" className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-pp-border/70 bg-pp-surface p-4">
            <div className="text-[11px] uppercase tracking-wider text-pp-muted">Coverage Area</div>
            <div className="mt-1 text-2xl font-bold text-pp-text">23 Counties</div>
            <div className="mt-0.5 text-xs text-pp-faint">New Jersey & Pennsylvania</div>
          </div>
          <div className="rounded-lg border border-pp-border/70 bg-pp-surface p-4">
            <div className="text-[11px] uppercase tracking-wider text-pp-muted">Continuous Scoring</div>
            <div className="mt-1 text-2xl font-bold text-pp-text">4,800+</div>
            <div className="mt-0.5 text-xs text-pp-faint">Parcels active in feed</div>
          </div>
          <div className="rounded-lg border border-pp-border/70 bg-pp-surface p-4">
            <div className="text-[11px] uppercase tracking-wider text-pp-muted">Sheriff Auctions</div>
            <div className="mt-1 text-2xl font-bold text-pp-gold">20% Statutory</div>
            <div className="mt-0.5 text-xs text-pp-faint">Upset & knockdown modeling</div>
          </div>
          <div className="rounded-lg border border-pp-border/70 bg-pp-surface p-4">
            <div className="text-[11px] uppercase tracking-wider text-pp-muted">Monte Carlo Reliability</div>
            <div className="mt-1 text-2xl font-bold text-profit-strong">94.2%</div>
            <div className="mt-0.5 text-xs text-pp-faint">Verified downside win rate</div>
          </div>
        </section>

        {/* Modular Core Systems */}
        <section id="landing-modules-grid" className="mt-14">
          <div className="mb-6 flex items-end justify-between border-b border-pp-border/60 pb-3">
            <div>
              <h2 className="text-lg font-semibold text-pp-text">Core Analytical Systems</h2>
              <p className="text-xs text-pp-muted mt-0.5">
                Specialized execution tools designed for distressed acquisition desks.
              </p>
            </div>
            <Link to="/workspace" className="text-xs text-pp-gold hover:underline">
              Enter Workspace →
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div
              id="module-card-workspace"
              className="group rounded-xl border border-pp-border/70 bg-pp-surface p-5 hover:border-pp-gold/50 transition-all cursor-pointer"
              onClick={() => onExplore()}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-pp-gold/10 p-2 text-pp-gold">
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-mono text-pp-muted group-hover:text-pp-gold transition-colors">
                  /workspace
                </span>
              </div>
              <h3 className="text-base font-semibold text-pp-text">Live Cartographic Terminal</h3>
              <p className="mt-2 text-xs leading-relaxed text-pp-muted">
                Interactive parcel map with boundary polygons, flood hazard layers, zoning limits, and instant underwriting dossiers.
              </p>
            </div>

            {/* Card 2 */}
            <Link
              id="module-card-deals"
              to="/deals"
              className="group rounded-xl border border-pp-border/70 bg-pp-surface p-5 hover:border-pp-gold/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-mono text-pp-muted group-hover:text-pp-gold transition-colors">
                  /deals
                </span>
              </div>
              <h3 className="text-base font-semibold text-pp-text">Ranked Deals & Monte Carlo</h3>
              <p className="mt-2 text-xs leading-relaxed text-pp-muted">
                Every scored parcel sorted by risk-adjusted return, worst-case tail risk (5th percentile), and renovation plan ROI.
              </p>
            </Link>

            {/* Card 3 */}
            <Link
              id="module-card-sheriff"
              to="/sheriff-sales"
              className="group rounded-xl border border-pp-border/70 bg-pp-surface p-5 hover:border-pp-gold/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-amber-500/10 p-2 text-pp-gold">
                  <Gavel className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-mono text-pp-muted group-hover:text-pp-gold transition-colors">
                  /sheriff-sales
                </span>
              </div>
              <h3 className="text-base font-semibold text-pp-text">Sheriff & Public Auctions</h3>
              <p className="mt-2 text-xs leading-relaxed text-pp-muted">
                Two-county Chancery court intelligence with verified judgment liens, statutory upset calculations, and deposit schedules.
              </p>
            </Link>

            {/* Card 4 */}
            <Link
              id="module-card-notices"
              to="/notices"
              className="group rounded-xl border border-pp-border/70 bg-pp-surface p-5 hover:border-pp-gold/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-mono text-pp-muted group-hover:text-pp-gold transition-colors">
                  /notices
                </span>
              </div>
              <h3 className="text-base font-semibold text-pp-text">Legal Notice AI Reader</h3>
              <p className="mt-2 text-xs leading-relaxed text-pp-muted">
                Extract plaintiff writs, docket numbers, judgment amounts, and red flags directly from raw newspaper or court legal notices.
              </p>
            </Link>

            {/* Card 5 */}
            <Link
              id="module-card-prophecy"
              to="/prophecy"
              className="group rounded-xl border border-pp-border/70 bg-pp-surface p-5 hover:border-pp-gold/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-mono text-pp-muted group-hover:text-pp-gold transition-colors">
                  /prophecy
                </span>
              </div>
              <h3 className="text-base font-semibold text-pp-text">Prophecy Predictive Market</h3>
              <p className="mt-2 text-xs leading-relaxed text-pp-muted">
                Pre-listing signal signatures predicting seller listing 60 to 90 days ahead, allowing direct outreach before open bidding.
              </p>
            </Link>

            {/* Card 6 */}
            <Link
              id="module-card-accuracy"
              to="/accuracy"
              className="group rounded-xl border border-pp-border/70 bg-pp-surface p-5 hover:border-pp-gold/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-slate-500/10 p-2 text-slate-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-mono text-pp-muted group-hover:text-pp-gold transition-colors">
                  /accuracy
                </span>
              </div>
              <h3 className="text-base font-semibold text-pp-text">Outcomes & Calibration Ledger</h3>
              <p className="mt-2 text-xs leading-relaxed text-pp-muted">
                Nightly audit validating algorithmic valuations against closed public deeds and actual auction knockdowns.
              </p>
            </Link>
          </div>
        </section>
      </main>

      {/* Institutional Footer */}
      <footer id="landing-institutional-footer" className="border-t border-pp-border/60 bg-pp-surface/50 py-8">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-6 sm:px-8 text-xs text-pp-muted">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-pp-text">Perfect Property Engine</span>
            <span>•</span>
            <span>Institutional Real Estate Intelligence</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/workspace" className="hover:text-pp-text">
              Terminal
            </Link>
            <Link to="/deals" className="hover:text-pp-text">
              Ranked Deals
            </Link>
            <Link to="/sheriff-sales" className="hover:text-pp-text">
              Sheriff Auctions
            </Link>
            <Link to="/auth" className="hover:text-pp-text">
              Analyst Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
