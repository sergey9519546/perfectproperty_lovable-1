import { createFileRoute, redirect } from "@tanstack/react-router";
import { MarketWorkspace } from "@/features/perfect-property/MarketWorkspace";
import { SectionBoundary } from "@/components/SectionBoundary";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { getAuthenticatedFirebaseUser } from "@/integrations/firebase";
import { supabase } from "@/integrations/supabase/client";

function WorkspaceRouteComponent() {
  const search = Route.useSearch();
  return (
    <ProtectedLayout>
      <SectionBoundary label="Workspace unavailable" minHeight={400}>
        <MarketWorkspace initialQuery={search.query} initialParcelId={search.parcelId} />
      </SectionBoundary>
    </ProtectedLayout>
  );
}

export const Route = createFileRoute("/workspace")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    query: typeof s.query === "string" ? s.query : undefined,
    parcelId: typeof s.parcelId === "string" ? s.parcelId : undefined,
  }),
  beforeLoad: async ({ search }) => {
    const firebaseUser = await getAuthenticatedFirebaseUser();
    if (!firebaseUser) {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        const params = new URLSearchParams();
        if (search?.query) params.set("query", search.query);
        if (search?.parcelId) params.set("parcelId", search.parcelId);
        const qs = params.toString();
        const nextUrl = qs ? `/workspace?${qs}` : "/workspace";
        throw redirect({ to: "/auth", search: { next: nextUrl } });
      }
    }
  },
  head: () => ({
    meta: [
      { title: "Live Workspace — Perfect Property" },
      {
        name: "description",
        content: "Map, rank, and inspect live underwritten parcels with source-backed evidence.",
      },
    ],
  }),
  component: WorkspaceRouteComponent,
});