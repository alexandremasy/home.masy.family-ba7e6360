import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────────
   The bento grid — the only thing that knows how a card is placed.

   A card must not carry `span`: it would have to know the grid it sits in, and
   the same card would then be un-reusable anywhere else. The grid owns the
   placement, the card owns itself.
   ──────────────────────────────────────────────────────────────────────────── */

/** Columns a cell can take. 6 is full width on desktop. */
export type BentoSpan = 1 | 2 | 3 | 4 | 6;

/** Columns: 2 on mobile, 4 from `sm`, 6 from `lg`. Defined in styles.css. */
export function BentoGrid({
  children,
  className,
}: {
  /** The cells. Use `BentoItem` for each one. */
  children: ReactNode;
  /** Extra classes for the grid itself — page padding, animation. */
  className?: string;
}) {
  return <div className={cn("grid-bento", className)}>{children}</div>;
}

const spanClasses: Record<BentoSpan, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-2 sm:col-span-3",
  4: "col-span-2 sm:col-span-4",
  6: "col-span-2 sm:col-span-4 lg:col-span-6",
};

/**
 * One cell of the grid. Wraps whatever it is given — usually a `Card` — and is
 * the piece that carries the placement.
 */
export function BentoItem({
  children,
  span = 2,
  rowSpan,
  className,
}: {
  /** What sits in the cell. A `Card` stretches to fill it. */
  children: ReactNode;
  /** Columns taken. Collapses to the mobile 2-column grid below `sm`. */
  span?: BentoSpan;
  /** Make the cell two rows tall. */
  rowSpan?: 2;
  /** Extra classes for the cell — rarely needed, the span covers placement. */
  className?: string;
}) {
  return (
    <div className={cn(spanClasses[span], rowSpan === 2 && "row-span-2", className)}>
      {children}
    </div>
  );
}
