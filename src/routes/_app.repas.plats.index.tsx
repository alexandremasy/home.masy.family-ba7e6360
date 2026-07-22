import { createFileRoute } from "@tanstack/react-router";
import { PlatsTemplate } from "@/templates/repas-plats";
import { useDishes } from "@/lib/dishes-store";

export const Route = createFileRoute("/_app/repas/plats/")({
  component: PlatsPage,
  head: () => ({ meta: [{ title: "Plats — Repas" }] }),
});

// The page is the template; this file only says where the dishes come from.
// Here that is the in-memory mock store; in the cockpit it is the api.
function PlatsPage() {
  const { dishes } = useDishes();
  return <PlatsTemplate dishes={dishes} />;
}
