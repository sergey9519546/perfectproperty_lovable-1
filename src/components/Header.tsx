import { Link, useLocation } from "@tanstack/react-router";
import * as React from "react";
import { useFirebaseAuth } from "@/integrations/firebase";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Brand } from "@/features/perfect-property/components/Brand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  MapPin,
  Flame,
  Gavel,
  Radio,
  Sparkles,
  FileText,
  CheckCircle2,
  Activity,
  Database,
  Cpu,
  BarChart3,
  ChevronDown,
  Menu,
  LogIn,
  LogOut,
  User as UserIcon,
  Bookmark,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  id?: string;
  className?: string;
  sticky?: boolean;
  transparent?: boolean;
  showLiveFeed?: boolean;
  showAuth?: boolean;
  onExplore?: () => void;
  onSignIn?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  hint: string;
  badge?: string;
  badgeVariant?: "default" | "warning" | "live";
  icon: React.ComponentType<{ className?: string }>;
}

interface DropdownGroup {
  label: string;
  items: NavItem[];
}

export function Header({
  id = "app-header",
  className,
  sticky = true,
  transparent = false,
  showLiveFeed = true,
  showAuth = true,
  onExplore,
  onSignIn,
}: HeaderProps) {
  const { user, signOutUser } = useFirebaseAuth();
  const pathname = useLocation({ select: (location) => location.pathname });
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSignOut() {
    try {
      await signOutUser();
    } catch {
      // fallback
    }
    try {
      await supabase.auth.signOut();
    } catch {
      // fallback
    }
    window.location.assign("/auth");
  }

  const primaryNav: NavItem[] = [
    {
      to: "/workspace",
      label: "Map",
      hint: "Live cadastral parcel genome & geospatial tools",
      icon: MapPin,
    },
    {
      to: "/deals",
      label: "Ranked Deals",
      hint: "Monte Carlo risk-adjusted buy rankings & spreads",
      icon: Flame,
    },
    {
      to: "/sheriff-sales",
      label: "Sheriff & Gov Sales",
      hint: "AI workforce scored auctions & legal intelligence",
      badge: "AI Scored",
      badgeVariant: "live",
      icon: Gavel,
    },
  ];

  const intelligenceGroups: DropdownGroup[] = [
    {
      label: "Distress & Pre-Market",
      items: [
        {
          to: "/shadow",
          label: "Off-Market Shadow",
          hint: "High-probability sellers before public listing",
          badge: "Shadow",
          badgeVariant: "warning",
          icon: Radio,
        },
        {
          to: "/prophecy",
          label: "Predicted Listings",
          hint: "Anticipated market velocity & predictive parcels",
          icon: Sparkles,
        },
        {
          to: "/notices",
          label: "Notice Reader",
          hint: "Parse legal sale notices & lien extractions",
          icon: FileText,
        },
      ],
    },
    {
      label: "Institutional Modeling & Risk",
      items: [
        {
          to: "/accuracy",
          label: "Model Accuracy",
          hint: "Historical backtesting & error distributions",
          icon: CheckCircle2,
        },
        {
          to: "/monitoring",
          label: "Portfolio Risk & Health",
          hint: "Stress test portfolio against shocks & downturns",
          icon: Activity,
        },
      ],
    },
    {
      label: "Data Pipeline & Operations",
      items: [
        {
          to: "/admin",
          label: "Data Sources",
          hint: "County cadastre coverage & GIS ingest rings",
          icon: Database,
        },
        {
          to: "/admin/health",
          label: "Ingest Pipeline Health",
          hint: "Crawler spiders, worker logs & sync monitors",
          icon: Cpu,
        },
        {
          to: "/admin/analytics",
          label: "Platform Analytics",
          hint: "Underwrite metrics, query load & telemetry",
          icon: BarChart3,
        },
      ],
    },
  ];

  const isIntelligenceActive = intelligenceGroups.some((group) =>
    group.items.some((item) => pathname === item.to || pathname.startsWith(`${item.to}/`)),
  );

  return (
    <header
      id={id}
      className={cn(
        "w-full transition-all duration-200 z-50",
        sticky ? "sticky top-0" : "relative",
        transparent
          ? "bg-transparent border-b border-transparent"
          : "border-b border-border bg-card/95 backdrop-blur-md shadow-xs",
        className,
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand & Desktop Links */}
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 min-w-0">
          <Link
            to="/"
            id={`${id}-brand-link`}
            className="flex items-center gap-2.5 sm:gap-3 text-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md shrink-0 py-1"
            aria-label="Perfect Property Home"
          >
            <Brand
              id={`${id}-brand`}
              compact={false}
              iconClassName="h-7 w-7 sm:h-8 sm:w-8 shrink-0 drop-shadow-xs"
              textClassName="text-[13px] sm:text-[14px] font-bold tracking-[0.14em] text-foreground inline"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            id={`${id}-desktop-nav`}
            className="hidden items-center gap-1 text-[13px] font-medium md:flex"
            aria-label="Primary Navigation"
          >
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={item.hint}
                  aria-label={`${item.label}: ${item.hint}`}
                  aria-current={isActive ? "page" : undefined}
                  className="group relative inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary whitespace-nowrap"
                  activeProps={{
                    className: "rounded-lg px-3 py-1.5 bg-muted text-foreground font-semibold shadow-2xs",
                  }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-0.5 rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Intelligence Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                id={`${id}-intelligence-trigger`}
                aria-label="Intelligence Tools and Advanced Modeling Menu"
                aria-haspopup="menu"
                className={cn(
                  "group inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isIntelligenceActive && "bg-muted text-foreground font-semibold shadow-2xs",
                )}
              >
                <Layers className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" aria-hidden="true" />
                <span>Intelligence</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="w-80 bg-card border border-border text-foreground shadow-xl rounded-xl p-2 animate-in fade-in-80 zoom-in-95"
              >
                {intelligenceGroups.map((group, gIdx) => (
                  <div key={group.label} className={gIdx > 0 ? "mt-2 pt-2 border-t border-border" : ""}>
                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-primary/90 px-2.5 py-1">
                      {group.label}
                    </DropdownMenuLabel>
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`);
                      return (
                        <DropdownMenuItem
                          key={item.to}
                          asChild
                          className={cn(
                            "rounded-lg cursor-pointer transition-colors focus:bg-muted focus:text-foreground my-0.5",
                            isActive && "bg-muted font-medium",
                          )}
                        >
                          <Link to={item.to} className="flex items-start gap-2.5 px-2.5 py-2">
                            <ItemIcon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-foreground">{item.label}</span>
                                {item.badge && (
                                  <span
                                    className={cn(
                                      "rounded-full px-1.5 py-0.2 text-[9px] font-semibold",
                                      item.badgeVariant === "warning"
                                        ? "border border-amber-300 bg-amber-50 text-amber-700"
                                        : "border border-primary/20 bg-primary/10 text-primary",
                                    )}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-muted-foreground line-clamp-1 leading-tight mt-0.5">
                                {item.hint}
                              </span>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        {/* Right Section: Status Feed & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
          {/* Live Data Feed Pill Indicator */}
          {showLiveFeed && (
            <div
              id={`${id}-live-feed`}
              role="status"
              aria-label="System status: Real-time cadastral and public records feed active"
              className="hidden items-center gap-2 text-[12px] text-muted-foreground sm:flex"
              title="Real-time cadastral and public records feed active"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Live Feed
              </span>
            </div>
          )}

          {/* User Auth State (Hydration Safe) */}
          {showAuth && (
            <div id={`${id}-auth-controls`} className="flex items-center gap-2">
              {mounted ? (
                user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      id={`${id}-user-trigger`}
                      aria-label={`User Account Menu for ${user.email || "Analyst"}`}
                      aria-haspopup="menu"
                      className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shadow-2xs"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserIcon className="h-3 w-3" />
                      </div>
                      <span className="max-w-[100px] sm:max-w-[140px] md:max-w-[180px] truncate font-mono text-[11px]">
                        {user.email || "Analyst"}
                      </span>
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-card border border-border text-foreground shadow-lg rounded-xl p-1.5">
                      <DropdownMenuLabel className="px-2 py-1 text-[11px] text-muted-foreground font-normal truncate">
                        Signed in as <br />
                        <span className="font-semibold text-foreground">{user.email}</span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-border my-1" />
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-muted">
                        <Link to="/deals" className="flex items-center gap-2 px-2 py-1.5 text-xs">
                          <Bookmark className="h-3.5 w-3.5 text-amber-500" />
                          <span>Saved Deals Portfolio</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-muted">
                        <Link to="/workspace" className="flex items-center gap-2 px-2 py-1.5 text-xs">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span>Cadastral Workspace</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border my-1" />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="rounded-lg cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2 px-2 py-1.5 text-xs font-medium"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/auth" id={`${id}-signin-link`}>
                      <Button
                        size="sm"
                        onClick={onSignIn}
                        className="h-8.5 px-3 sm:px-3.5 text-xs font-semibold rounded-lg primary-button flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogIn className="h-3.5 w-3.5" />
                        <span>Sign in</span>
                      </Button>
                    </Link>
                    {onExplore && (
                      <Button
                        size="sm"
                        onClick={onExplore}
                        className="hidden sm:inline-flex h-8.5 px-3.5 text-xs font-bold bg-foreground text-card hover:bg-foreground/90 rounded-lg shadow-2xs transition-all cursor-pointer"
                      >
                        Launch Engine
                      </Button>
                    )}
                  </div>
                )
              ) : (
                <div className="h-8.5 w-20 animate-pulse rounded-lg bg-muted" />
              )}
            </div>
          )}

          {/* Mobile Hamburger Navigation Drawer */}
          <div className="md:hidden flex items-center">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  id={`${id}-mobile-trigger`}
                  className="h-9 w-9 rounded-lg border-border bg-card text-foreground hover:bg-muted cursor-pointer"
                  aria-label="Open Navigation Menu"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-sm bg-card border-l border-border p-6 flex flex-col justify-between overflow-y-auto">
                <div>
                  <SheetHeader className="text-left pb-4 border-b border-border">
                    <SheetTitle className="flex items-center gap-2.5">
                      <Brand
                        id={`${id}-mobile-brand`}
                        compact={false}
                        iconClassName="h-7 w-7 shrink-0"
                        textClassName="text-[13px] font-bold tracking-[0.14em] text-foreground"
                      />
                    </SheetTitle>
                  </SheetHeader>

                  {/* Primary Mobile Links */}
                  <div className="mt-6 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                      Primary Workspaces
                    </div>
                    {primaryNav.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`);
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-foreground hover:bg-muted",
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Intelligence Mobile Groups */}
                  <div className="mt-6 space-y-4">
                    {intelligenceGroups.map((group) => (
                      <div key={group.label} className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-1">
                          {group.label}
                        </div>
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`);
                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "flex flex-col rounded-lg px-3 py-2 text-xs transition-colors",
                                isActive
                                  ? "bg-muted text-foreground font-semibold"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-foreground font-medium">
                                  <ItemIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                  <span className="rounded-full border border-amber-300 bg-amber-50 px-1.5 py-0.2 text-[9px] font-semibold text-amber-700">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground mt-0.5 pl-5.5">
                                {item.hint}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile Drawer Footer with Auth */}
                <div className="pt-6 mt-6 border-t border-border">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Feed
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">v2.6.4</span>
                  </div>

                  {mounted && user ? (
                    <div className="space-y-2">
                      <div className="rounded-lg bg-muted p-2.5 text-xs">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Signed in as</div>
                        <div className="font-mono text-foreground font-semibold truncate mt-0.5">{user.email}</div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMobileOpen(false);
                          void handleSignOut();
                        }}
                        className="w-full text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive h-9"
                      >
                        <LogOut className="h-3.5 w-3.5 mr-1.5" />
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Link to="/auth" onClick={() => setMobileOpen(false)} className="w-full block">
                      <Button className="w-full primary-button h-9 text-xs font-semibold">
                        <LogIn className="h-3.5 w-3.5 mr-1.5" />
                        Sign in to Workspace
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export { Header as Navigation };
