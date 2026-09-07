import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { LandingPage } from "@/features/perfect-property/components/landing/LandingPage";
import { BRAND_CONFIG } from "@/lib/brand";
import { getAuthenticatedFirebaseUser } from "@/integrations/firebase";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    // Fast-path authenticated sessions straight to the live workspace
    const firebaseUser = await getAuthenticatedFirebaseUser();
    if (firebaseUser) {
      throw redirect({ to: "/workspace" });
    }
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({ to: "/workspace" });
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("pp_demo_session")) {
      throw redirect({ to: "/workspace" });
    }
  },
  head: () => ({
    meta: [
      { title: BRAND_CONFIG.meta.defaultTitle },
      {
        name: "description",
        content: BRAND_CONFIG.meta.description,
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  return (
    <LandingPage
      onExplore={(query, mode) => {
        if (mode === "Shadow") {
          void navigate({ to: "/shadow" });
        } else if (query) {
          void navigate({ to: "/workspace", search: { query } });
        } else {
          void navigate({ to: "/workspace" });
        }
      }}
      onSignIn={() => void navigate({ to: "/auth", search: { next: "/workspace" } })}
    />
  );
}

