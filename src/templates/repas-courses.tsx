import { useState } from "react";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { DataState } from "@/components/data-state";
import { DishCard } from "@/components/dish-card";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/drawer";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/empty";
import { Eyebrow } from "@/components/eyebrow";
import { Input } from "@/components/input";
import { frLongDay, type Dish } from "@/lib/maison-data";
import {
  Check,
  ChevronUp,
  Minus,
  Moon,
  Plus,
  ShoppingBasket,
  Sun,
  UtensilsCrossed,
  X,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   The shopping list, as a page.

   Its props are its OWN shapes, deliberately minimal — not the mock's types and
   not the api's. That is what lets the mockup fill them with something that only
   has to *feel* right, while the cockpit fills them from the real list, without
   either side leaking its model into this file.

   A meal is identified by an opaque `mealKey`: `date|slot` here, a plan row id
   over there. This page never looks inside it, it just hands it back.
   ──────────────────────────────────────────────────────────────────────────── */

export interface CourseComponentView {
  name: string;
}

export interface CourseMealView {
  /** Opaque meal identity, handed back on toggle. */
  key: string;
  dish: Dish;
  components: CourseComponentView[];
}

export interface CourseDayView {
  date: string;
  cells: { slot: "midi" | "soir"; meal: CourseMealView | null }[];
}

export interface CourseLineView {
  /** Opaque line identity, handed back on quantity change. */
  key: string;
  name: string;
  qty: number;
  /** Drives how the quantity reads: a weight adds up, a countable is counted. */
  unit: string;
}

/**
 * "500 g" for a weight, "2×" for something you count. The unit is what decides —
 * one look at the list has to be enough in front of the shelf.
 */
export function formatQty(qty: number, unit: string): string {
  return unit === "pièce" ? `${qty}×` : `${qty} ${unit}`;
}

export interface CoursesTemplateProps {
  /** The window's days, both slots each, meal or nothing planned. */
  days: CourseDayView[];
  /** The list itself, already in the order it should be read. */
  lines: CourseLineView[];
  /** Is this meal's component on the list? Each side owns its own key convention. */
  isIncluded: (mealKey: string, componentName: string) => boolean;
  /** Put this meal's component on the list, or take it off. */
  onToggleComponent: (mealKey: string, componentName: string) => void;
  /** Set a line's quantity. Zero means: off the list. */
  onSetQty: (lineKey: string, qty: number) => void;
  /** Add an item by hand. */
  onAddManual: (name: string) => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export function CoursesTemplate({
  days,
  lines,
  isIncluded,
  onToggleComponent,
  onSetQty,
  onAddManual,
  loading = false,
  error = false,
  onRetry,
}: CoursesTemplateProps) {
  const [newName, setNewName] = useState("");
  const total = lines.length;

  const addManual = () => {
    const name = newName.trim();
    if (!name) return;
    setNewName("");
    onAddManual(name);
  };

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

      {lines.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 py-8 text-center text-sm text-muted-foreground">
          Liste vide — coche des composants dans les repas.
        </p>
      ) : (
        <ul className="-mx-2">
          {lines.map((line) => (
            <li
              key={line.key}
              className="group flex items-center gap-2 rounded-lg px-2 py-1.5 odd:bg-muted/40"
            >
              <p className="min-w-0 flex-1 truncate text-sm">{line.name}</p>
              <div className="flex shrink-0 items-center gap-0.5 rounded-md border border-border/60 bg-background">
                <button
                  onClick={() => onSetQty(line.key, line.qty - 1)}
                  aria-label="Diminuer"
                  className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="min-w-[3rem] text-center text-xs tabular-nums">
                  {formatQty(line.qty, line.unit)}
                </span>
                <button
                  onClick={() => onSetQty(line.key, line.qty + 1)}
                  aria-label="Augmenter"
                  className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              {/* Touch has no hover: keep the remove button visible on mobile,
                  hover-revealed on desktop. */}
              <button
                onClick={() => onSetQty(line.key, 0)}
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
                Liste · {total} article{total > 1 ? "s" : ""}
              </span>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </button>
          </DrawerTrigger>
          <DrawerContent
            className="max-h-[85dvh]"
            title="Liste de courses"
            trailing={
              <span className="text-xs text-muted-foreground">
                {total} article{total > 1 ? "s" : ""}
              </span>
            }
          >
            {listBody}
          </DrawerContent>
        </Drawer>

        {loading || error ? (
          <DataState status={error ? "error" : "loading"} label="les repas" onRetry={onRetry} />
        ) : (
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
                    const meal = cell.meal;
                    return (
                      <div key={cell.slot} className="relative">
                        <span
                          aria-label={label}
                          className="absolute -top-2.5 left-3 z-10 grid h-6 w-6 place-items-center rounded-full border border-border/60 bg-card text-muted-foreground shadow-soft"
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        {!meal ? (
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
                              dish={meal.dish}
                              footer={
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {meal.components.map((c) => {
                                    const checked = isIncluded(meal.key, c.name);
                                    return (
                                      <button
                                        key={c.name}
                                        onClick={() => onToggleComponent(meal.key, c.name)}
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
        )}
      </div>
    </div>
  );
}
