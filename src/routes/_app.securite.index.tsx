import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/securite/")({
  beforeLoad: () => {
    throw redirect({ to: "/securite/etat" });
  },
});
