import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useLocation,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { use401Interceptor } from "@/hooks/use-401-interceptor";
import { Toaster } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CaretDown } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "@/features/perfect-property/components/Brand";
import { BRAND_CONFIG } from "@/lib/brand";
import { FirebaseAuthProvider, useFirebaseAuth } from "@/integrations/firebase";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-pp-page px-4 dark">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-pp-text num">404</h1>
        <p className="mt-4 text-sm text-pp-muted">This parcel isn't in the genome.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md primary-button"
        >
          Return to the map
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-pp-page px-4 dark">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-pp-text">The engine hit an exception</h1>
        <p className="mt-2 text-sm text-pp-muted">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md primary-button"
          >
            Retry
          </button>
          <a
            href="/"
            className="rounded-md border border-pp-border bg-pp-page px-4 py-2 text-sm text-pp-text"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: BRAND_CONFIG.meta.defaultTitle },
      {
        name: "description",
        content: BRAND_CONFIG.meta.description,
      },
      {
        property: "og:title",
        content: BRAND_CONFIG.meta.defaultTitle,
      },
      {
        property: "og:description",
        content: BRAND_CONFIG.meta.description,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: BRAND_CONFIG.meta.defaultTitle,
      },
      {
        name: "twitter:description",
        content: BRAND_CONFIG.meta.description,
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7c1efd67-4f66-425b-9265-04618d4db191/id-preview-e07c3392--3e8bba9e-afd4-4c85-ab23-acf538526a37.lovable.app-1783442750796.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7c1efd67-4f66-425b-9265-04618d4db191/id-preview-e07c3392--3e8bba9e-afd4-4c85-ab23-acf538526a37.lovable.app-1783442750796.png",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useLocation({ select: (location) => location.pathname });
  use401Interceptor();

  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseAuthProvider>
        <div className="perfect-property-ui min-h-[100dvh] bg-[#FAFAFC] text-[#0F172A] antialiased">
          {pathname === "/auth" || pathname === "/" || pathname === "/workspace" ? null : <TopNav />}
          <Outlet />
          <Toaster theme="light" position="bottom-right" />
        </div>
      </FirebaseAuthProvider>
    </QueryClientProvider>
  );
}

function TopNav() {
  const { user: authUser, signOutUser } = useFirebaseAuth();
  // Auth state only exists in the browser; render the signed-out shell during
  // SSR/hydration so server and client markup match.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const user = hydrated ? authUser : null;

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
  const primary: { to: string; label: string; hint: string }[] = [
    { to: "/workspace", label: "Map", hint: "Every scored property on a live map" },
    { to: "/deals", label: "Deals", hint: "Ranked list of the best properties to buy" },
    { to: "/sheriff-sales", label: "Sheriff & Gov Sales", hint: "AI workforce scored auctions & public legal intelligence" },
  ];
  const more: {
    to: string;
    label: string;
    hint: string;
    group: "signals" | "insight" | "operator";
  }[] = [
    {
      to: "/shadow",
      label: "Off-Market",
      hint: "Owners likely to sell, but not yet listed",
      group: "signals",
    },
    {
      to: "/prophecy",
      label: "Predicted",
      hint: "Properties we expect to hit the market soon",
      group: "signals",
    },
    {
      to: "/notices",
      label: "Notice Reader",
      hint: "Parse legal sale notices into key facts & risk analysis",
      group: "signals",
    },
    {
      to: "/accuracy",
      label: "Model Accuracy",
      hint: "How close our predictions have been to reality",
      group: "insight",
    },
    {
      to: "/monitoring",
      label: "Portfolio Health",
      hint: "Overall risk and performance of the book",
      group: "insight",
    },
    {
      to: "/admin",
      label: "Data Sources",
      hint: "Pull in new counties and refresh data",
      group: "operator",
    },
    {
      to: "/admin/health",
      label: "Ingest Health",
      hint: "Failures, source rings, spider jobs",
      group: "operator",
    },
  ];
  return (
    <header id="app-top-header" className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            id="header-brand-link"
            to="/"
            className="flex items-center text-[#0F172A] hover:opacity-90 transition-opacity"
          >
            <Brand
              id="header-nav-brand"
              compact={false}
              iconClassName="h-7 w-7 shrink-0"
              textClassName="hidden text-[13px] font-bold tracking-[0.14em] text-[#0F172A] sm:inline"
            />
          </Link>
          <nav id="header-primary-nav" className="flex items-center gap-1.5 text-[13px]">
            {primary.map((l) => (
              <Link
                key={l.to}
                id={`nav-link-${l.to.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
                to={l.to}
                title={l.hint}
                className="rounded-lg px-3 py-1.5 font-medium text-[#475569] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A] whitespace-nowrap"
                activeProps={{
                  className: "rounded-lg px-3 py-1.5 bg-[#F1F5F9] text-[#0F172A] font-bold border border-[#E2E8F0]",
                }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger
                id="nav-dropdown-more"
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium text-[#475569] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A] data-[state=open]:bg-[#F1F5F9] data-[state=open]:text-[#0F172A] whitespace-nowrap cursor-pointer"
              >
                Intelligence <CaretDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-68 bg-white border border-[#E2E8F0] text-[#0F172A] shadow-xl rounded-xl p-1.5">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-[#2F5FFF] px-2 py-1">
                  Distress Signals
                </DropdownMenuLabel>
                {more
                  .filter((m) => m.group === "signals")
                  .map((m) => (
                    <DropdownMenuItem key={m.to} asChild className="focus:bg-[#F1F5F9] focus:text-[#0F172A] rounded-lg">
                      <Link id={`more-link-${m.to.replace(/\//g, "-")}`} to={m.to} className="flex flex-col items-start px-2 py-1.5">
                        <span className="text-sm font-semibold">{m.label}</span>
                        <span className="text-[11px] text-[#64748B]">{m.hint}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                <DropdownMenuSeparator className="bg-[#E2E8F0] my-1" />
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-[#2F5FFF] px-2 py-1">
                  Institutional Calibration
                </DropdownMenuLabel>
                {more
                  .filter((m) => m.group === "insight")
                  .map((m) => (
                    <DropdownMenuItem key={m.to} asChild className="focus:bg-[#F1F5F9] focus:text-[#0F172A] rounded-lg">
                      <Link id={`more-link-${m.to.replace(/\//g, "-")}`} to={m.to} className="flex flex-col items-start px-2 py-1.5">
                        <span className="text-sm font-semibold">{m.label}</span>
                        <span className="text-[11px] text-[#64748B]">{m.hint}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                <DropdownMenuSeparator className="bg-[#E2E8F0] my-1" />
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-[#2F5FFF] px-2 py-1">
                  Data Pipeline & Operator
                </DropdownMenuLabel>
                {more
                  .filter((m) => m.group === "operator")
                  .map((m) => (
                    <DropdownMenuItem key={m.to} asChild className="focus:bg-[#F1F5F9] focus:text-[#0F172A] rounded-lg">
                      <Link id={`more-link-${m.to.replace(/\//g, "-")}`} to={m.to} className="flex flex-col items-start px-2 py-1.5">
                        <span className="text-sm font-semibold">{m.label}</span>
                        <span className="text-[11px] text-[#64748B]">{m.hint}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div id="header-status-indicator" className="hidden items-center gap-2 text-[12px] text-[#64748B] lg:flex">
            {user && (
              <span id="user-email-badge" className="text-[11px] font-mono text-[#0F172A] bg-[#F1F5F9] px-2.5 py-1 rounded-md border border-[#E2E8F0] truncate max-w-[180px]">
                {user.email}
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed
            </span>
          </div>
          <button
            id="header-auth-action-btn"
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all shadow-2xs whitespace-nowrap cursor-pointer"
          >
            {user ? "Sign out" : "Sign in"}
          </button>
        </div>
      </div>
    </header>
  );
}
