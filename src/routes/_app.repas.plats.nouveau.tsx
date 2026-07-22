import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { NouveauPlatTemplate } from "@/templates/repas-plat-nouveau";
import { useDishes } from "@/lib/dishes-store";

export const Route = createFileRoute("/_app/repas/plats/nouveau")({
  component: NouveauPlat,
  head: () => ({ meta: [{ title: "Nouveau plat — Repas" }] }),
});

// The page is the template; this file says where the dish is stored and where the
// user lands afterwards. Here the mock store answers synchronously with the new dish.
function NouveauPlat() {
  const { create } = useDishes();
  const navigate = useNavigate();

  return (
    <NouveauPlatTemplate
      onCancel={() => navigate({ to: "/repas/plats" })}
      onSubmit={(draft) => {
        const created = create(draft);
        navigate({ to: "/repas/plats/$dishId", params: { dishId: created.id } });
      }}
    />
  );
}
