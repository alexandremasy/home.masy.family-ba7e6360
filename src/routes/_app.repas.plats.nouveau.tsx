import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/card";
import { DishForm, EMPTY_DRAFT } from "@/components/dish-form";
import { useDishes } from "@/lib/dishes-store";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_app/repas/plats/nouveau")({
  component: NouveauPlat,
  head: () => ({ meta: [{ title: "Nouveau plat — Repas" }] }),
});

function NouveauPlat() {
  const { create } = useDishes();
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <Link
        to="/repas/plats"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Plats
      </Link>

      <Card
        variant="solid"
        title="Nouveau plat"
        subline="Un plat est une base plus des composants — c'est ce qui alimente les suggestions."
      >
        <DishForm
          initial={EMPTY_DRAFT}
          submitLabel="Créer le plat"
          onCancel={() => navigate({ to: "/repas/plats" })}
          onSubmit={(d) => {
            const created = create(d);
            navigate({ to: "/repas/plats/$dishId", params: { dishId: created.id } });
          }}
        />
      </Card>
    </div>
  );
}
