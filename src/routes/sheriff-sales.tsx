import { createFileRoute, redirect } from "@tanstack/react-router";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { SectionBoundary } from "@/components/SectionBoundary";
import { SheriffSalesView } from "@/features/sheriff-sales/components/SheriffSalesView";
import { getAuthenticatedFirebaseUser } from "@/integrations/firebase";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/sheriff-sales")({
  ssr: false,
  beforeLoad: async () => {
    const firebaseUser = await getAuthenticatedFirebaseUser();
    if (!firebaseUser) {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        throw redirect({ to: "/auth", search: { next: "/sheriff-sales" } });
      }
    }
  },
  head: () => ({
    meta: [
      { title: "Sheriff & Government Sales Intelligence — Perfect Property" },
      {
        name: "description",
        content:
          "Public legal prose, open GIS cadastre, and USDA NAIP imagery scored by an AI workforce with a weekly self-calibrating Outcomes Ledger. Built on open sources verified August 2026.",
      },
    ],
  }),
  component: () => (
    <ProtectedLayout>
      <SectionBoundary label="Sheriff sales intelligence unavailable" minHeight={400}>
        <SheriffSalesView />
      </SectionBoundary>
    </ProtectedLayout>
  ),
});
