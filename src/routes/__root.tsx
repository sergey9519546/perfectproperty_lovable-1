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
import { useEffect, type ReactNode } from "react";

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
    <html lang="en" className="dark">
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
        <div className="dark min-h-[100dvh] bg-pp-page text-pp-text">
          {pathname === "/auth" || pathname === "/" || pathname === "/workspace" ? null : <TopNav />}
          <Outlet />
          <Toaster theme="dark" position="bottom-right" />
        </div>
      </FirebaseAuthProvider>
    </QueryClientProvider>
  );
}

function TopNav() {
  const { user, signOutUser } = useFirebaseAuth();

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
    <header className="sticky top-0 z-40 border-b border-pp-border bg-pp-page/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-3 sm:gap-6 sm:px-6">
        <Link to="/" className="perfect-property-ui flex items-center text-pp-text hover:opacity-90 transition-opacity">
          <Brand
            id="header-nav-brand"
            compact={false}
            iconClassName="h-7 w-7 shrink-0"
            textClassName="hidden text-[12px] font-bold tracking-[0.14em] text-pp-text xl:inline"
          />
        </Link>
        <nav className="flex items-center gap-1 text-[14px]">
          {primary.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              title={l.hint}
              className="rounded-md px-3 py-1.5 text-pp-muted transition-colors hover:bg-pp-surface hover:text-pp-text"
              activeProps={{
                className: "rounded-md px-3 py-1.5 bg-pp-surface text-pp-text font-medium",
              }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-pp-muted transition-colors hover:bg-pp-surface hover:text-pp-text data-[state=open]:bg-pp-surface data-[state=open]:text-pp-text">
              More <CaretDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className="text-[11px] font-normal uppercase tracking-wider text-pp-muted">
                Signals
              </DropdownMenuLabel>
              {more
                .filter((m) => m.group === "signals")
                .map((m) => (
                  <DropdownMenuItem key={m.to} asChild>
                    <Link to={m.to} className="flex flex-col items-start">
                      <span className="text-sm">{m.label}</span>
                      <span className="text-[11px] text-pp-muted">{m.hint}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px] font-normal uppercase tracking-wider text-pp-muted">
                Insight
              </DropdownMenuLabel>
              {more
                .filter((m) => m.group === "insight")
                .map((m) => (
                  <DropdownMenuItem key={m.to} asChild>
                    <Link to={m.to} className="flex flex-col items-start">
                      <span className="text-sm">{m.label}</span>
                      <span className="text-[11px] text-pp-muted">{m.hint}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px] font-normal uppercase tracking-wider text-pp-muted">
                Operator
              </DropdownMenuLabel>
              {more
                .filter((m) => m.group === "operator")
                .map((m) => (
                  <DropdownMenuItem key={m.to} asChild>
                    <Link to={m.to} className="flex flex-col items-start">
                      <span className="text-sm">{m.label}</span>
                      <span className="text-[11px] text-pp-muted">{m.hint}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        <div className="ml-auto hidden items-center gap-3 text-[12px] text-pp-muted md:flex">
          {user && (
            <span className="text-[11px] text-pp-text/80 bg-pp-page px-2 py-0.5 rounded border border-pp-border">
              {user.email}
            </span>
          )}
          <span className="h-1.5 w-1.5 rounded-full bg-profit-strong" />
          <span>Updated nightly</span>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="ml-auto rounded-md border border-pp-border px-2 py-1 text-[12px] text-pp-muted hover:bg-pp-surface hover:text-pp-text md:ml-0"
        >
          {user ? "Sign out" : "Sign in"}
        </button>
      </div>
    </header>
  );
}
