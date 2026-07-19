import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DishForm } from "@/components/DishForm";
import { useDishes } from "@/lib/dishes-store";
import { initialPlan } from "@/lib/maison-data";
import { ArrowLeft, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/repas/plats/$dishId")({
  component: DishDetail,
});

/**
 * The dish page IS the form. A read-only view would only restate it — the form
 * already shows every axis and every component, and lets you act on them.
 */
function DishDetail() {
  const { dishId } = Route.useParams();
  const { get, update, remove } = useDishes();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const dish = get(dishId);

  // Deleting a planned dish empties its slots — the confirmation should say so.
  const plannedCount = useMemo(
    () => initialPlan.filter((e) => e.dishId === dishId).length,
    [dishId],
  );

  if (!dish) {
    return (
      <div className="py-16 text-center">
        <p className="font-semibold text-lg">Ce plat n'existe plus.</p>
        <Button asChild variant="outline" className="mt-4 gap-1.5">
          <Link to="/repas/plats">
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour aux plats
          </Link>
        </Button>
      </div>
    );
  }

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
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="font-semibold text-lg">{dish.name}</p>
          <Button
            variant="outline"
            onClick={() => setConfirming(true)}
            className="shrink-0 gap-1.5 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Supprimer
          </Button>
        </div>

        <DishForm
          initial={dish}
          submitLabel="Enregistrer"
          onCancel={() => navigate({ to: "/repas/plats" })}
          onSubmit={(d) => {
            update(dish.id, d);
            navigate({ to: "/repas/plats" });
          }}
        />
      </div>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {dish.name} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le plat sort du catalogue et des suggestions.
              {plannedCount > 0 &&
                ` Il occupe ${plannedCount} créneau${plannedCount > 1 ? "x" : ""} du plan courant, qui se videront.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                remove(dish.id);
                navigate({ to: "/repas/plats" });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
