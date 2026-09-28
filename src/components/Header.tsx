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
  ChevronDown,
  Menu,
  LogIn,
  LogOut,
  User as UserIcon,
  Bookmark,
  MapPin,
  CreditCard,
  Flame,
  Gavel,
  FileText,
  Radio,
  Sparkles,
  CheckCircle2,
  Activity,
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
  icon?: React.ComponentType<{ className?: string }>;
}

export function Header({
  id = "app-header",
  className,
  sticky = true,
  transparent = false,
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
      to: "/deals",
      label: "Top Deals",
      hint: "Curated high-profit opportunities & your saved portfolio",
      icon: Flame,
    },
    {
      to: "/workspace",
      label: "Underwrite Map",
      hint: "Instant underwriting, 70% rule MAO & financial dossier for any address",
      icon: MapPin,
    },
    {
      to: "/sheriff-sales",
      label: "Foreclosure Auctions",
      hint: "Courthouse auction deals with automated opening bid & equity checks",
      icon: Gavel,
    },
    {
      to: "/notices",
      label: "Notice Parser",
      hint: "Extract legal terms, auction dates & hidden risks from any sale notice",
      icon: FileText,
    },
    {
      to: "/pricing",
      label: "Pricing",
      hint: "Simple plans with full 30-day money-back guarantee",
      icon: CreditCard,
    },
  ];

  return (
    <header
      id={id}
      className={cn(
        "w-full transition-all duration-150 z-50",
        sticky ? "sticky top-0" : "relative",
        transparent
          ? "bg-transparent border-b border-transparent"
          : "border-b border-border bg-card/95 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single Brand Element */}
        <div className="flex items-center">
          <Link
            to="/"
            id={`${id}-brand-link`}
            className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md py-1"
            aria-label="Profit Property Home"
          >
            <Brand
              id={`${id}-brand`}
              compact={false}
              iconClassName="h-7 w-7 shrink-0 text-primary"
              textClassName="text-[14px] font-bold tracking-[0.12em] text-foreground inline"
            />
          </Link>
        </div>

        {/* Zone 2: Clean Text Nav Links */}
        <nav
          id={`${id}-desktop-nav`}
          className="hidden md:flex items-center gap-1 text-[13px] font-medium"
          aria-label="Primary Navigation"
        >
          {primaryNav.map((item) => {
            const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                title={item.hint}
                aria-label={`${item.label}: ${item.hint}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center px-3 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md whitespace-nowrap text-[13px]",
                  isActive && "text-foreground font-semibold bg-muted/60",
                )}
                activeOptions={{ exact: item.to === "/" }}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 Primary Actions (Profile / Sign In) */}
        <div className="flex items-center gap-3 shrink-0">
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
                      <span className="max-w-[120px] sm:max-w-[160px] truncate font-mono text-[11px]">
                        {user.email || "Analyst"}
                      </span>
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-card border border-border text-foreground shadow-lg rounded-xl p-1.5"
                    >
                      <DropdownMenuLabel className="px-2 py-1 text-[11px] text-muted-foreground font-normal truncate">
                        Signed in as <br />
                        <span className="font-semibold text-foreground">{user.email}</span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-border my-1" />
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-muted">
                        <Link to="/deals" className="flex items-center gap-2 px-2 py-1.5 text-xs">
                          <Bookmark className="h-3.5 w-3.5 text-amber-500" />
                          <span>Saved Deals</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-muted">
                        <Link to="/workspace" className="flex items-center gap-2 px-2 py-1.5 text-xs">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span>Cadastral Workspace</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-muted">
                        <Link to="/pricing" className="flex items-center gap-2 px-2 py-1.5 text-xs">
                          <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Subscription Plan</span>
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
                    {pathname !== "/auth" && (
                      <Link to="/auth" id={`${id}-signin-link`}>
                        <Button
                          size="sm"
                          onClick={onSignIn}
                          className="h-8.5 px-3.5 text-xs font-semibold rounded-lg primary-button flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <LogIn className="h-3.5 w-3.5" />
                          <span>Sign in</span>
                        </Button>
                      </Link>
                    )}
                    {onExplore && (
                      <Button
                        size="sm"
                        onClick={onExplore}
                        className="hidden sm:inline-flex h-8.5 px-3.5 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap"
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

          {/* Mobile Navigation Drawer */}
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
              <SheetContent
                side="right"
                className="w-[85vw] max-w-sm bg-card border-l border-border p-6 flex flex-col justify-between overflow-y-auto"
              >
                <div>
                  <SheetHeader className="text-left pb-4 border-b border-border">
                    <SheetTitle className="flex items-center gap-2.5">
                      <Brand
                        id={`${id}-mobile-brand`}
                        compact={false}
                        iconClassName="h-7 w-7 shrink-0 text-primary"
                        textClassName="text-[13px] font-bold tracking-[0.12em] text-foreground"
                      />
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-6 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                      Platform Navigation
                    </div>
                    {primaryNav.map((item) => {
                      const Icon = item.icon || MapPin;
                      const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`);
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-muted text-foreground font-semibold"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border">
                  {mounted && user ? (
                    <div className="space-y-2">
                      <div className="rounded-lg bg-muted p-2.5 text-xs">
                        <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Signed in as
                        </div>
                        <div className="font-mono text-foreground font-medium truncate mt-0.5">
                          {user.email}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMobileOpen(false);
                          void handleSignOut();
                        }}
                        className="w-full text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive h-9 cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5 mr-1.5" />
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Link to="/auth" onClick={() => setMobileOpen(false)} className="w-full block">
                      <Button className="w-full primary-button h-9 text-xs font-semibold cursor-pointer">
                        <LogIn className="h-3.5 w-3.5 mr-1.5" />
                        Sign in
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
