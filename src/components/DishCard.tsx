import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cap, cn } from "@/lib/utils";
import type { Dish } from "@/lib/maison-data";

/**
 * A facet — deliberately shaped like the filter bar's chips, so the card shows
 * the very axes you filter on.
 */
export function Facet({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">
      {children}
    </span>
  );
}

/**
 * The pill that sits right of the dish name. `primary` for something to act on
 * ("à écouler"), `muted` for a plain annotation ("batch", "déjà au plan").
 * Never `warm` — that is the alert tone.
 */
export function StatusPill({
  tone = "muted", icon, children, title,
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
        "inline-flex shrink-0 items-center gap-1 rounded-full py-0.5 text-[10px] leading-tight",
        children ? "px-2" : "px-1",
        tone === "primary"
          ? "bg-primary font-medium text-primary-foreground"
          : "border border-border text-muted-foreground",
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/**
 * The one way a dish is displayed — calendar slot, slot picker, catalogue.
 *
 * Renders the BODY only: each caller owns its shell, because they genuinely
 * differ (a draggable div, a click-to-pick button, a Link).
 *
 * Structure, always in this order:
 *   1. name  (+ a status pill on the right)
 *   2. composition — base then components
 *   3. facets — densité, température (+ actions)
 *   4. footer — caller's extras
 *
 * `variant="compact"` keeps that structure and stops after step 1: a calendar
 * cell has room for the name and nothing else.
 */
export function DishCard({
  dish, variant = "full", status, actions, footer,
}: {
  dish: Dish;
  variant?: "full" | "compact";
  /** Pill aligned right of the name: "à écouler", "déjà au plan", "batch"… */
  status?: ReactNode;
  /** Appended to the facet row, right-aligned. */
  actions?: ReactNode;
  footer?: ReactNode;
}) {
  const compact = variant === "compact";

  return (
    <>
      <div className={cn("flex items-start justify-between", compact ? "gap-1" : "gap-2")}>
        <p
          className={cn(
            "min-w-0 flex-1 font-serif leading-tight",
            compact ? "line-clamp-2 text-sm" : "text-base",
          )}
        >
          {dish.name}
        </p>
        {status}
      </div>

      {!compact && (
        <>
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-[10px] font-normal">{cap(dish.base)}</Badge>
            {dish.modifiers.map((m) => (
              <Badge key={m.name} variant="secondary" className="text-[10px] font-normal">{cap(m.name)}</Badge>
            ))}
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-1">
            <Facet>{cap(dish.densite)}</Facet>
            <Facet>{cap(dish.temperature)}</Facet>
            {actions}
          </div>
        </>
      )}

      {footer}
    </>
  );
}
