import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/prophecy")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/deals" });
  },
  component: () => null,
});
