import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { DishForm, EMPTY_DRAFT } from "@/components/DishForm";
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

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <p className="mb-1 font-serif text-lg">Nouveau plat</p>
        <p className="mb-4 text-sm text-muted-foreground">
          Un plat est une base plus des composants — c'est ce qui alimente les suggestions.
        </p>
        <DishForm
          initial={EMPTY_DRAFT}
          submitLabel="Créer le plat"
          onCancel={() => navigate({ to: "/repas/plats" })}
          onSubmit={(d) => {
            const created = create(d);
            navigate({ to: "/repas/plats/$dishId", params: { dishId: created.id } });
          }}
        />
      </div>
    </div>
  );
}
