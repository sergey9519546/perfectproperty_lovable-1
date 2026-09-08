import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { Brand } from "../Brand";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, LogIn, MapPin, Flame, Gavel, Radio, Sparkles, CheckCircle2 } from "lucide-react";

export const Header = ({
  scrolled,
  onSignIn,
  onExplore,
}: {
  scrolled: boolean;
  onSignIn: () => void;
  onExplore: () => void;
}) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header
      id="landing-header-bar"
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ease-in-out ${
        scrolled
          ? "bg-card/95 backdrop-blur-md border-b border-border shadow-xs"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 lg:gap-8 min-w-0">
          <Link
            to="/"
            id="landing-header-logo-link"
            aria-label="Perfect Property Home"
            className="flex items-center text-foreground hover:opacity-90 transition-opacity shrink-0 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
          >
            <Brand
              id="landing-header-brand"
              compact={false}
              iconClassName="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
              textClassName="text-[13px] sm:text-[14px] font-bold tracking-[0.14em] text-foreground inline"
            />
          </Link>
          <nav
            id="landing-header-desktop-nav"
            aria-label="Landing Primary Navigation"
            className="hidden md:flex items-center gap-1 text-[13px] font-medium text-muted-foreground"
          >
            <Link
              to="/workspace"
              aria-label="Workspace: Live cadastral parcel map and tools"
              className="px-3 py-1.5 hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Workspace</span>
            </Link>
            <Link
              to="/deals"
              aria-label="Ranked Deals: Monte Carlo risk-adjusted buy rankings"
              className="px-3 py-1.5 hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Flame className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
              <span>Ranked Deals</span>
            </Link>
            <Link
              to="/sheriff-sales"
              aria-label="Sheriff & Government Sales: AI scored auctions"
              className="px-3 py-1.5 text-primary hover:bg-primary/10 font-bold rounded-lg transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Gavel className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sheriff & Gov Sales</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-primary/20 text-primary uppercase font-mono font-bold">
                New
              </span>
            </Link>
            <Link
              to="/shadow"
              aria-label="Off-Market Shadow Inventory"
              className="px-3 py-1.5 hover:text-foreground hover:bg-muted rounded-lg transition-colors hidden lg:flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Radio className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
              <span>Off-Market</span>
            </Link>
            <Link
              to="/prophecy"
              aria-label="Predicted Listings and Market Velocity"
              className="px-3 py-1.5 hover:text-foreground hover:bg-muted rounded-lg transition-colors hidden xl:flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />
              <span>Predictions</span>
            </Link>
            <Link
              to="/accuracy"
              aria-label="Model Accuracy and Historical Backtesting"
              className="px-3 py-1.5 hover:text-foreground hover:bg-muted rounded-lg transition-colors hidden xl:flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              <span>Accuracy</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Button
            id="landing-header-login-btn"
            variant="ghost"
            onClick={onSignIn}
            className="h-9 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted rounded-lg transition-all cursor-pointer"
          >
            Log in
          </Button>
          <Button
            id="landing-header-explore-btn"
            onClick={onExplore}
            className="h-9 px-3.5 sm:px-4.5 text-xs sm:text-sm font-bold primary-button rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-2xs"
          >
            Launch Engine
          </Button>

          {/* Mobile Navigation Drawer */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  id="landing-mobile-trigger"
                  className="h-9 w-9 rounded-lg border-border bg-card text-foreground hover:bg-muted cursor-pointer"
                  aria-label="Open Navigation Menu"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[85vw] max-w-sm bg-card border-l border-border p-6 flex flex-col justify-between"
              >
                <div>
                  <SheetHeader className="text-left pb-4 border-b border-border">
                    <SheetTitle>
                      <Brand
                        id="landing-mobile-brand"
                        compact={false}
                        iconClassName="h-7 w-7 shrink-0"
                        textClassName="text-[13px] font-bold tracking-[0.14em] text-foreground"
                      />
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-6 space-y-1">
                    <Link
                      to="/workspace"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Workspace Map</span>
                    </Link>
                    <Link
                      to="/deals"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <Flame className="h-4 w-4 text-amber-500" />
                      <span>Ranked Deals</span>
                    </Link>
                    <Link
                      to="/sheriff-sales"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-primary bg-primary/10"
                    >
                      <div className="flex items-center gap-2.5">
                        <Gavel className="h-4 w-4" />
                        <span>Sheriff & Gov Sales</span>
                      </div>
                      <span className="rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-mono">
                        New
                      </span>
                    </Link>
                    <Link
                      to="/shadow"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <Radio className="h-4 w-4 text-amber-600" />
                      <span>Off-Market Shadow</span>
                    </Link>
                    <Link
                      to="/prophecy"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      <span>Predicted Listings</span>
                    </Link>
                    <Link
                      to="/accuracy"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Model Accuracy</span>
                    </Link>
                  </div>
                </div>

                <div className="pt-6 border-t border-border space-y-2">
                  <Button
                    onClick={() => {
                      setMobileOpen(false);
                      onSignIn();
                    }}
                    variant="outline"
                    className="w-full text-xs font-semibold h-9"
                  >
                    <LogIn className="h-3.5 w-3.5 mr-1.5" />
                    Sign in to Workspace
                  </Button>
                  <Button
                    onClick={() => {
                      setMobileOpen(false);
                      onExplore();
                    }}
                    className="w-full primary-button text-xs font-bold h-9"
                  >
                    Launch Engine
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

