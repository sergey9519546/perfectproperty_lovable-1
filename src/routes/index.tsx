import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LandingPage } from "@/features/perfect-property/components/LandingPage";
import { BRAND_CONFIG } from "@/lib/brand";

export const Route = createFileRoute("/")({
  ssr: false,
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
