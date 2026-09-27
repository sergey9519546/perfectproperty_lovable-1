import { Button } from "@/components/ui/button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { captureBoundaryCrash } from "@/lib/error-monitor";
import { use401Interceptor } from "@/hooks/use-401-interceptor";
import { Toaster } from "sonner";
import { BRAND_CONFIG } from "@/lib/brand";
import { FirebaseAuthProvider } from "@/integrations/firebase";
import { Header } from "@/components/Header";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground num">404</h1>
        <p className="mt-4 text-sm text-muted-foreground">This parcel isn't in the genome.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-primary text-primary-foreground font-semibold px-4 py-2 hover:bg-primary/90 transition-colors"
        >
          Return to the map
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    captureBoundaryCrash(error, {
      boundary: "tanstack_root_error_component",
      severity: "fatal",
      handled: false,
    });
  }, [error]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">The engine hit an exception</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md font-semibold"
          >
            Retry
          </Button>
          <a
            href="/"
            className="rounded-md border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
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
  use401Interceptor();

  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseAuthProvider>
        <div className="perfect-property-ui flex min-h-[100dvh] flex-col bg-background text-foreground antialiased">
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <Header />
          <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col overflow-hidden outline-none">
            <Outlet />
          </main>
          <Toaster theme="light" position="bottom-right" />
        </div>
      </FirebaseAuthProvider>
    </QueryClientProvider>
  );
}
