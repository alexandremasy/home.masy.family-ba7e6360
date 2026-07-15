import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DishForm } from "@/components/DishForm";
import { useDishes } from "@/lib/dishes-store";
import { initialPlan, frLongDay, type Role } from "@/lib/maison-data";
import { ArrowLeft, Pencil, Trash2, Package, Repeat, Zap, Flame, Thermometer, CalendarRange } from "lucide-react";

export const Route = createFileRoute("/_app/repas/plats/$dishId")({
  component: DishDetail,
});

const ROLE_ORDER: Role[] = ["protéine", "légume", "féculent", "sauce", "garniture"];

function DishDetail() {
  const { dishId } = Route.useParams();
  const { get, update, remove } = useDishes();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const dish = get(dishId);

  // How many slots this dish holds on the current plan — deleting it would empty them.
  const plannedDates = useMemo(
    () => initialPlan.filter((e) => e.dishId === dishId),
    [dishId],
  );

  if (!dish) {
    return (
      <div className="py-16 text-center">
        <p className="font-serif text-xl">Ce plat n'existe plus.</p>
        <Button asChild variant="outline" className="mt-4 gap-1.5">
          <Link to="/repas/plats"><ArrowLeft className="h-3.5 w-3.5" />Retour aux plats</Link>
        </Button>
      </div>
    );
  }

  const byRole = ROLE_ORDER
    .map((r) => ({ role: r, items: dish.modifiers.filter((m) => m.role === r) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-5">
      <Link
        to="/repas/plats"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />Plats
      </Link>

      {editing ? (
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <p className="mb-4 font-serif text-xl">Modifier {dish.name}</p>
          <DishForm
            initial={dish}
            submitLabel="Enregistrer"
            onCancel={() => setEditing(false)}
            onSubmit={(d) => { update(dish.id, d); setEditing(false); }}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-serif text-3xl tracking-tight">{dish.name}</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {dish.base} · {dish.densite} · {dish.temperature}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" onClick={() => setEditing(true)} className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" />Modifier
              </Button>
              <Button variant="outline" onClick={() => setConfirming(true)} className="gap-1.5 text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />Supprimer
              </Button>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={<Package className="h-4 w-4" />} label="Emport" value={dish.emportable ? "Emportable" : "Sur place"} />
            <Stat icon={<Thermometer className="h-4 w-4" />} label="Réchauffe" value={dish.rechauffable ? "Réchauffable" : "Non"} />
            <Stat
              icon={dish.effort <= 2 ? <Zap className="h-4 w-4" /> : <Flame className="h-4 w-4" />}
              label="Effort" value={`${dish.effort}/5`}
            />
            <Stat icon={<Repeat className="h-4 w-4" />} label="Rendement" value={`${dish.rendement} créneau${dish.rendement > 1 ? "x" : ""}`} />
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Composants</p>
            {byRole.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Aucun composant renseigné.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {byRole.map(({ role, items }) => (
                  <div key={role} className="flex flex-wrap items-baseline gap-2">
                    <span className="w-20 shrink-0 text-xs text-muted-foreground">{role}</span>
                    {items.map((m) => (
                      <Badge key={m.name} variant="secondary" className="font-normal">
                        {m.name}
                        <span className="ml-1.5 opacity-60">{m.qty} {m.unit}</span>
                      </Badge>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border/60 p-5">
            <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <CalendarRange className="h-3 w-3" />Au plan
            </p>
            {plannedDates.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Pas au plan sur la fenêtre courante.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {plannedDates.map((e) => (
                  <li key={e.date + e.slot} className="text-muted-foreground">
                    {frLongDay(new Date(e.date))} · {e.slot === "midi" ? "Midi" : "Soir"}
                    {e.batchOfDate && <span className="ml-1.5 text-warm">(batch)</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {dish.name} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le plat sort du catalogue et des suggestions.
              {plannedDates.length > 0 && ` Il occupe ${plannedDates.length} créneau${plannedDates.length > 1 ? "x" : ""} du plan courant, qui se videront.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { remove(dish.id); navigate({ to: "/repas/plats" }); }}
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

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {icon}{label}
      </p>
      <p className="mt-1 font-serif text-lg">{value}</p>
    </div>
  );
}
