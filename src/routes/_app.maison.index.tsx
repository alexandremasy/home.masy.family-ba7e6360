import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/maison/")({
  beforeLoad: () => { throw redirect({ to: "/maison/repas" }); },
});
