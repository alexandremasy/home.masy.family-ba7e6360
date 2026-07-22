import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/button";
import { Alert, AlertActions, AlertCancel, AlertConfirm, AlertContent } from "@/components/alert";
import { Card } from "@/components/card";
import { DataState } from "@/components/data-state";
import { DishForm, type DishDraft } from "@/components/dish-form";
import { type Dish } from "@/lib/maison-data";
import { ArrowLeft, Trash2 } from "lucide-react";

/**
 * One dish, as a page. The page IS the form: a read-only view would only restate it —
 * the form already shows every axis and every component, and lets you act on them.
 *
 * Saving and deleting are handed up. Whether that means a mock store or two mutations
 * is not this file's business; the confirmation dialog's open state is, since nothing
 * outside the page reads it.
 */
export interface PlatDetailTemplateProps {
  /** The dish, once known. `null` means it does not exist (or no longer does). */
  dish: Dish | null;
  /** Still on its way. */
  loading?: boolean;
  /** The fetch failed — different from a dish that is genuinely gone. */
  error?: boolean;
  /** Retry handler, offered on `error`. */
  onRetry?: () => void;
  /** How many slots of the current plan this dish occupies — the confirmation says so. */
  plannedCount?: number;
  /** Called with the edited dish. */
  onSubmit: (draft: DishDraft) => void;
  /** Called once the deletion is confirmed. */
  onDelete: () => void;
  /** Called when the edit is abandoned. */
  onCancel: () => void;
}

export function PlatDetailTemplate({
  dish,
  loading = false,
  error = false,
  onRetry,
  plannedCount = 0,
  onSubmit,
  onDelete,
  onCancel,
}: PlatDetailTemplateProps) {
  const [confirming, setConfirming] = useState(false);

  if (loading || error) {
    return <DataState status={error ? "error" : "loading"} label="le plat" onRetry={onRetry} />;
  }

  // Gone is not failed: the api answered, there is simply no such dish.
  if (!dish) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-semibold">Ce plat n'existe plus.</p>
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

      <Card
        variant="solid"
        title={dish.name}
        trailing={
          <Button
            variant="outline"
            onClick={() => setConfirming(true)}
            className="shrink-0 gap-1.5 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Supprimer
          </Button>
        }
      >
        <DishForm
          initial={dish}
          submitLabel="Enregistrer"
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </Card>

      <Alert open={confirming} onOpenChange={setConfirming}>
        <AlertContent
          tone="destructive"
          title={`Supprimer ${dish.name} ?`}
          footer={
            <AlertActions>
              <AlertCancel>Annuler</AlertCancel>
              <AlertConfirm
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertConfirm>
            </AlertActions>
          }
        >
          Le plat sort du catalogue et des suggestions.
          {plannedCount > 0 &&
            ` Il occupe ${plannedCount} créneau${plannedCount > 1 ? "x" : ""} du plan courant, qui se videront.`}
        </AlertContent>
      </Alert>
    </div>
  );
}
