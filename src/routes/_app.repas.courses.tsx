import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import {
  upcomingMeals,
  initialPlan,
  frLongDay,
  addDays,
  iso,
  TODAY,
  type UpcomingMeal,
  type Slot,
} from "@/lib/maison-data";
import {
  Check,
  Plus,
  Minus,
  X,
  ShoppingBasket,
  UtensilsCrossed,
  Sun,
  Moon,
  ChevronUp,
} from "lucide-react";
import { Eyebrow } from "@/components/eyebrow";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/empty";
import { Card } from "@/components/card";
import { DishCard } from "@/components/dish-card";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/drawer";

export const Route = createFileRoute("/_app/repas/courses")({
  component: CoursesPage,
  head: () => ({ meta: [{ title: "Courses — Repas" }] }),
});

// A component is added to the global list when `${mealKey}::${name}` is selected.
const compKey = (mealKey: string, name: string) => `${mealKey}::${name}`;
// Manual input follows the data convention (capitalised) so it merges with the
// meal-derived ingredient of the same name instead of forming a second entry.
const norm = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

type ListItem = { name: string; qty: number };

function CoursesPage() {
  const meals = useMemo(() => upcomingMeals(initialPlan), []);

  // Every component of every upcoming meal starts checked — the list is
  // pre-filled and the user prunes, rather than building from nothing.
  const [selected, setSelected] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (const m of meals) for (const c of m.components) s.add(compKey(m.key, c.name));
    return s;
  });
  // Manual adjustment per ingredient name (can be negative). The list quantity is
  // `meal count + adjustment`, so a hand-added item and a meal-derived one of the
  // same name are ONE entry. A hand-add is just adjustment +1.
  const [adjust, setAdjust] = useState<Record<string, number>>({});
  const [newName, setNewName] = useState("");

  // Meal count per ingredient (a batch of the same dish counts its slots once —
  // upcomingMeals already excludes leftovers). This is the quantity's base.
  const mealCount = useMemo(() => {
    const c = new Map<string, number>();
    for (const m of meals)
      for (const comp of m.components) {
        if (selected.has(compKey(m.key, comp.name))) c.set(comp.name, (c.get(comp.name) ?? 0) + 1);
      }
    return c;
  }, [meals, selected]);

  // One entry per ingredient: cooked (base > 0) or hand-added (adjustment > 0).
  const items: ListItem[] = (() => {
    const names = new Set<string>();
    for (const [n, c] of mealCount) if (c > 0) names.add(n);
    for (const [n, d] of Object.entries(adjust)) if (d > 0) names.add(n);
    const out: ListItem[] = [];
    for (const name of names) {
      const qty = (mealCount.get(name) ?? 0) + (adjust[name] ?? 0);
      if (qty > 0) out.push({ name, qty });
    }
    return out;
  })();

  // The shopping list is always one flat, alphabetical list — no category buckets.
  const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name, "fr"));

  // The full day grid for the left column: every day of the window, both slots.
  // A slot either holds a meal (toggleable) or nothing planned (an empty card).
  const WINDOW_DAYS = 10;
  type SlotCell = { slot: Slot; meal: UpcomingMeal | null };
  const days = (() => {
    const mealByKey = new Map(meals.map((m) => [m.key, m]));
    return Array.from({ length: WINDOW_DAYS }, (_, i) => {
      const di = iso(addDays(TODAY, i));
      const cells: SlotCell[] = (["midi", "soir"] as const).map((slot) => ({
        slot,
        meal: mealByKey.get(`${di}|${slot}`) ?? null,
      }));
      return { date: di, cells };
    });
  })();

  // ---- handlers ----------------------------------------------------------
  const toggleComponent = (mealKey: string, name: string) => {
    const k = compKey(mealKey, name);
    const removing = selected.has(k);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
    // If that was the last meal carrying this ingredient, drop a leftover negative
    // adjustment so a later re-add doesn't resurface a stale quantity.
    if (removing) {
      const stillHas = meals.some((m) => m.key !== mealKey && selected.has(compKey(m.key, name)));
      if (!stillHas && (adjust[name] ?? 0) <= 0)
        setAdjust((a) => {
          const c = { ...a };
          delete c[name];
          return c;
        });
    }
  };

  const setQty = (name: string, next: number) => {
    const base = mealCount.get(name) ?? 0;
    if (next <= 0) {
      // The one rule: 0 unchecks every meal carrying it and drops the adjustment,
      // so it leaves the list entirely.
      if (base > 0)
        setSelected((prev) => {
          const s = new Set(prev);
          for (const m of meals) s.delete(compKey(m.key, name));
          return s;
        });
      setAdjust((a) => {
        const c = { ...a };
        delete c[name];
        return c;
      });
      return;
    }
    // Store the delta from the meal base — positive above it, negative below.
    setAdjust((a) => ({ ...a, [name]: next - base }));
  };

  const addManual = () => {
    const name = norm(newName.trim());
    if (!name) return;
    setAdjust((a) => ({ ...a, [name]: (a[name] ?? 0) + 1 }));
    setNewName("");
  };

  const totalItems = items.length;

  // The shopping list body is shared verbatim between the desktop side panel and
  // the mobile bottom drawer — one source, two shells.
  const listBody = (
    <>
      <div className="mb-3 flex items-center gap-1.5">
        <Input
          placeholder="Ajouter un article…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addManual();
          }}
          className="h-9"
        />
        <Button size="sm" variant="inverted" onClick={addManual} className="h-9 shrink-0 gap-1">
          <Plus className="h-3.5 w-3.5" />
          Ajouter
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 py-8 text-center text-sm text-muted-foreground">
          Liste vide — coche des composants dans les repas.
        </p>
      ) : (
        <ul className="-mx-2">
          {sortedItems.map((it) => (
            <li
              key={it.name}
              className="group flex items-center gap-2 rounded-lg px-2 py-1.5 odd:bg-muted/40"
            >
              <p className="min-w-0 flex-1 truncate text-sm">{it.name}</p>
              <div className="flex shrink-0 items-center gap-0.5 rounded-md border border-border/60 bg-background">
                <button
                  onClick={() => setQty(it.name, it.qty - 1)}
                  aria-label="Diminuer"
                  className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="min-w-[1.75rem] text-center text-xs tabular-nums">{it.qty}</span>
                <button
                  onClick={() => setQty(it.name, it.qty + 1)}
                  aria-label="Augmenter"
                  className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              {/* Touch has no hover: keep the remove button visible on mobile,
                  hover-revealed on desktop. */}
              <button
                onClick={() => setQty(it.name, 0)}
                aria-label="Retirer"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border/60 bg-background text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <div>
      {/* ── Meals and their components — no framed panel, just the list ── */}
      <div className="anim-slide-up">
        <header className="mb-5">
          <h2 className="text-xl tracking-tight text-foreground">Prochains repas</h2>
        </header>
        {/* Basket summary — sits inline in the content, then sticks to the top as you
            scroll the days list (a floating card, not fixed chrome). Tap opens the
            full list in a bottom sheet. */}
        <Drawer>
          <DrawerTrigger asChild>
            <button className="sticky top-3 z-40 mb-5 flex w-full items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/95 px-4 py-3 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-card/80">
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <ShoppingBasket className="h-4 w-4 text-primary" />
                Liste · {totalItems} article{totalItems > 1 ? "s" : ""}
              </span>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85dvh]">
            <DrawerHeader className="text-left">
              <div className="flex items-baseline justify-between gap-3">
                <DrawerTitle className="text-lg">Liste de courses</DrawerTitle>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {totalItems} article{totalItems > 1 ? "s" : ""}
                </span>
              </div>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-8">{listBody}</div>
          </DrawerContent>
        </Drawer>

        <div className="space-y-5">
          {days.map(({ date, cells }) => (
            <div key={date}>
              <Eyebrow size="xs" className="mb-3">
                {frLongDay(new Date(date))}
              </Eyebrow>
              <div className="grid items-stretch gap-3 sm:grid-cols-2">
                {cells.map((cell) => {
                  // The slot marker (sun for midi, moon for soir) is a badge that
                  // straddles the card's top-left border.
                  const Icon = cell.slot === "midi" ? Sun : Moon;
                  const label = cell.slot === "midi" ? "Midi" : "Soir";
                  return (
                    <div key={cell.slot} className="relative">
                      <span
                        aria-label={label}
                        className="absolute -top-2.5 left-3 z-10 grid h-6 w-6 place-items-center rounded-full border border-border/60 bg-card text-muted-foreground shadow-soft"
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      {!cell.meal ? (
                        <Empty className="h-full rounded-xl border border-border/60 p-4 md:p-6">
                          <EmptyHeader>
                            <EmptyMedia variant="icon" className="text-muted-foreground/60">
                              <UtensilsCrossed />
                            </EmptyMedia>
                            <EmptyTitle className="text-base font-normal text-muted-foreground/70">
                              Rien de planifié
                            </EmptyTitle>
                          </EmptyHeader>
                        </Empty>
                      ) : (
                        <Card variant="solid">
                          <DishCard
                            dish={cell.meal.dish}
                            footer={
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {cell.meal.components.map((c) => {
                                  const checked = selected.has(compKey(cell.meal!.key, c.name));
                                  return (
                                    <button
                                      key={c.name}
                                      onClick={() => toggleComponent(cell.meal!.key, c.name)}
                                      aria-pressed={checked}
                                      className={
                                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors " +
                                        (checked
                                          ? "border-primary/30 bg-primary/10 text-primary"
                                          : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground")
                                      }
                                    >
                                      {checked ? (
                                        <Check className="h-3 w-3" />
                                      ) : (
                                        <Plus className="h-3 w-3" />
                                      )}
                                      {c.name}
                                    </button>
                                  );
                                })}
                              </div>
                            }
                          />
                        </Card>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
