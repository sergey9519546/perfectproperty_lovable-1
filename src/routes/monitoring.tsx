import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/monitoring")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/deals" });
  },
  component: () => null,
});
