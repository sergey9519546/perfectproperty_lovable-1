import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Sparkles,
  Building2,
  Gavel,
  Search,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Clock,
  ChevronRight,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';

export interface TailarkHeroProps {
  onExplore: (query?: string, mode?: 'Deals' | 'Shadow') => void;
}

const SAMPLE_DEAL_QUERIES = [
  'Chicago 3-Flat Multi-Family',
  'Logan Square Fix & Flip',
  'Under $250,000 Deals',
  'High Cash Flow Rentals',
];

const SAMPLE_SHERIFF_QUERIES = [
  'Cook County Foreclosure Auction',
  'Auctions Scheduled This Week',
  'Clean Title Foreclosures',
  'Under $150,000 Starting Bids',
];

export function TailarkHero({ onExplore }: TailarkHeroProps) {
  const [activeMode, setActiveMode] = useState<'Deals' | 'Shadow'>('Deals');
  const [queryInput, setQueryInput] = useState('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    onExplore(queryInput.trim() || undefined, activeMode);
  };

  const handleSampleClick = (sample: string) => {
    setQueryInput(sample);
    onExplore(sample, activeMode);
  };

  return (
    <section
      id="tailark-hero-section"
      className="relative overflow-hidden border-b border-border bg-background pt-24 pb-20 md:pt-32 md:pb-28"
    >
      {/* Subtle architectural grid background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* Subtle warm ambient wash */}
      <div
        className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 h-[340px] w-full max-w-[840px] rounded-full bg-primary/5 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Announcement Kicker: Clean unboxed text per Zero-Pill rule */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground mb-6"
        >
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="font-semibold text-foreground">Live Property Dealflow</span>
          <span aria-hidden="true" className="text-border">·</span>
          <span>Verified County Records, Foreclosure Auctions & Real Sales Comps</span>
        </motion.div>

        {/* Display Headline */}
        <motion.h1
          id="tailark-hero-heading"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
          className="mx-auto max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-bold tracking-tight text-foreground leading-[1.08]"
        >
          Find profitable real estate deals.{' '}
          <span className="text-primary">Know your exact profit before you make an offer.</span>
        </motion.h1>

        {/* Refined Plain-English Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="mx-auto mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed"
        >
          We automatically calculate repair costs, verify official property records, and check for hidden debts or second mortgages so you always know the exact safe price to offer.
        </motion.p>

        {/* Mode Selector Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          className="mt-8 flex justify-center"
        >
          <div
            id="tailark-hero-mode-toggle"
            className="inline-flex items-center rounded-xl border border-border bg-card p-1 shadow-xs"
          >
            <button
              id="tailark-mode-deals-btn"
              type="button"
              onClick={() => setActiveMode('Deals')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeMode === 'Deals'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Ranked High-Profit Deals</span>
            </button>
            <button
              id="tailark-mode-shadow-btn"
              type="button"
              onClick={() => setActiveMode('Shadow')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeMode === 'Shadow'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Gavel className="h-4 w-4" />
              <span>Foreclosure & Courthouse Auctions</span>
            </button>
          </div>
        </motion.div>

        {/* Unified Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="mx-auto mt-6 max-w-2xl"
        >
          <form
            id="tailark-hero-search-form"
            onSubmit={handleSearch}
            className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          >
            <div className="flex pl-3 text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <Input
              id="tailark-hero-search-input"
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={
                activeMode === 'Deals'
                  ? 'Enter address, city, or neighborhood (e.g. 2418 W Augusta Blvd, Chicago)...'
                  : 'Enter auction address or county (e.g. Cook County, IL or Bergen County, NJ)...'
              }
              className="flex-1 border-0 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-none shadow-none h-11"
            />
            <Button
              id="tailark-hero-search-submit"
              type="submit"
              size="default"
              className="h-10 px-4 sm:px-5 font-medium rounded-xl shrink-0"
            >
              <span>Find Deals</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>

          {/* Quick Query Sample Buttons */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium mr-1">Popular searches:</span>
            {(activeMode === 'Deals' ? SAMPLE_DEAL_QUERIES : SAMPLE_SHERIFF_QUERIES).map((sample, idx) => (
              <button
                key={sample}
                id={`tailark-sample-chip-${idx}`}
                type="button"
                onClick={() => handleSampleClick(sample)}
                className="rounded-md border border-border/80 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted hover:text-foreground cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <RainbowButton
            id="tailark-cta-workspace-btn"
            onClick={() => onExplore(queryInput || undefined, activeMode)}
            className="h-11 px-7 shadow-md"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            <span>Explore All Deals Free</span>
          </RainbowButton>

          <Link to="/sheriff-sales" id="tailark-cta-sheriff-sales-link">
            <Button
              variant="outline"
              size="lg"
              className="h-11 px-6 rounded-xl font-medium border-border hover:bg-muted"
            >
              <Gavel className="h-4 w-4 mr-2 text-primary" />
              <span>Browse Foreclosure Auctions</span>
            </Button>
          </Link>
        </motion.div>

        {/* Key Real-World Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
          className="mt-16 border-t border-border/80 pt-10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">$4.8B+</span>
              <span className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Properties Scored</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">18,400+</span>
              <span className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Court & Sheriff Auctions</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">99.4%</span>
              <span className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Verified Clean Title Rate</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Instant</span>
              <span className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Repair & Max Bid Estimates</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
