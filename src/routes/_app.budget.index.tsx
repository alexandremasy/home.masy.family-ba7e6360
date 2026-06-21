import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/budget/")({
  beforeLoad: () => {
    throw redirect({ to: "/budget/mensuel" });
  },
});
