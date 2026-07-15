import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/repas/")({
  beforeLoad: () => { throw redirect({ to: "/repas/planification" }); },
});
