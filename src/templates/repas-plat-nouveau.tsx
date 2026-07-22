import { Link } from "@tanstack/react-router";
import { Card } from "@/components/card";
import { DishForm, EMPTY_DRAFT, type DishDraft } from "@/components/dish-form";
import { ArrowLeft } from "lucide-react";

/**
 * Create a dish, as a page.
 *
 * It does not create anything itself — it hands the finished draft up. Here that lands
 * in the mock store, in the cockpit it becomes a POST; neither belongs in this file.
 * Where to go afterwards is the caller's business too, for the same reason.
 */
export interface NouveauPlatTemplateProps {
  /** Called with the completed draft. The caller persists it and decides what happens next. */
  onSubmit: (draft: DishDraft) => void;
  /** Called when the form is abandoned. */
  onCancel: () => void;
}

export function NouveauPlatTemplate({ onSubmit, onCancel }: NouveauPlatTemplateProps) {
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
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </Card>
    </div>
  );
}
