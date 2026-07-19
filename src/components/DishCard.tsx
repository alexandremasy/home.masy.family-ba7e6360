import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { effortLevel, fmtMinutes, type Dish } from "@/lib/maison-data";

/**
 * The pill that sits right of the dish name. `primary` for something to act on
 * ("à écouler"), `muted` for a plain annotation ("batch", "déjà au plan").
 * Never `warm` — that is the alert tone.
 */
export function StatusPill({
  tone = "muted",
  icon,
  children,
  title,
}: {
  tone?: "primary" | "muted";
  icon?: ReactNode;
  /** Omit in a calendar cell — the icon alone, so the name keeps its width. */
  children?: ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      aria-label={title}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full py-0.5 text-2xs leading-tight",
        children ? "px-2" : "px-1",
        tone === "primary"
          ? "bg-primary font-semibold text-primary-foreground"
          : "border border-border text-muted-foreground",
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/**
 * The dish's own properties, every one of them a standard tag.
 * Only what's true gets a tag — an absent "Emportable" says "not portable"
 * quietly enough, and an empty row of "Non" tags reads as noise.
 */
function attributesOf(dish: Dish): string[] {
  const e = effortLevel(dish.effort);
  return [
    dish.densite === "complet" ? "Complet" : "Léger",
    dish.temperature === "chaud" ? "Chaud" : "Froid",
    ...(dish.emportable ? ["Emportable"] : []),
    `${e.label} · ${fmtMinutes(e.minutes)}`,
    // "Couvre N repas" — a property of the dish. Distinct from the status pill
    // "Au plan · N×", which is a fact about the current plan. The two used to
    // both read as a bare number and were impossible to tell apart.
    ...(dish.rendement > 1 ? [`Couvre ${dish.rendement} repas`] : []),
  ];
}

/**
 * The one way a dish is displayed — calendar slot, slot picker, catalogue.
 *
 * Renders the BODY only: each caller owns its shell, because they genuinely
 * differ (a draggable div, a click-to-pick button, a Link).
 *
 * Structure, always in this order:
 *   1. name (bold) + a status pill on the right
 *   2. attributes — every one a standard tag
 *   3. footer — caller's extras
 *
 * The composition (base + components) is deliberately NOT here: it belongs to
 * the dish detail page. A card is for picking, not for reading a recipe.
 *
 * `variant="compact"` keeps that structure and stops after step 1: a calendar
 * cell has room for the name and nothing else.
 */
export function DishCard({
  dish,
  variant = "full",
  status,
  actions,
  footer,
  leading,
}: {
  dish: Dish;
  variant?: "full" | "compact";
  /** Pill aligned right of the name: "à écouler", "au plan", "batch"… */
  status?: ReactNode;
  /** Appended to the attribute row, right-aligned. */
  actions?: ReactNode;
  footer?: ReactNode;
  /** Small icon before the name — e.g. the slot's midi/soir marker. */
  leading?: ReactNode;
}) {
  const compact = variant === "compact";

  return (
    <>
      <div className={cn("flex items-start", compact ? "gap-1.5" : "gap-2")}>
        {leading && <span className="mt-px shrink-0">{leading}</span>}
        <p
          className={cn(
            "min-w-0 flex-1 font-semibold leading-tight",
            compact ? "line-clamp-2 text-sm" : "text-base",
          )}
        >
          {dish.name}
        </p>
        {status}
      </div>

      {!compact && (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {attributesOf(dish).map((a) => (
            <Badge key={a} variant="secondary" className="text-2xs font-normal">
              {a}
            </Badge>
          ))}
          {actions}
        </div>
      )}

      {footer}
    </>
  );
}
