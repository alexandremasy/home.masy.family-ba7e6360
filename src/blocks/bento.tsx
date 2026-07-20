import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────────
   The bento grid — the only thing that knows how a card is placed.

   A card must not carry `span`: it would have to know the grid it sits in, and
   the same card would then be un-reusable anywhere else. The grid owns the
   placement, the card owns itself.

   The grid is written here rather than as a `.grid-bento` utility in styles.css,
   because it is used beyond the dashboard now: a global class with hard-coded row
   heights only ever fit one page. Columns and gaps are the same everywhere; the
   fixed row height is opt-in.
   ──────────────────────────────────────────────────────────────────────────── */

/** Columns a cell can take. 6 is full width on desktop. */
export type BentoSpan = 1 | 2 | 3 | 4 | 6;
/** Rows a cell can take. */
export type BentoRowSpan = 1 | 2 | 3;

export function BentoGrid({
  children,
  rows = "auto",
  className,
}: {
  /** The cells. Use `BentoItem` for each one. */
  children: ReactNode;
  /**
   * `auto` — every row is as tall as its content, which is what a page wants.
   * `fixed` — the dashboard mosaic: 11rem rows from `sm`, 12rem from `lg`, so
   * tiles line up in a regular grid regardless of what they hold.
   */
  rows?: "auto" | "fixed";
  /** Extra classes for the grid itself — page padding, entrance animation. */
  className?: string;
}) {
  return (
    <div
      className={cn(
        // 2 columns on mobile, 4 from sm, 6 from lg. `row dense` lets a small cell
        // backfill a hole a wider neighbour left behind.
        "grid grid-cols-2 gap-3 [grid-auto-flow:row_dense] sm:grid-cols-4 sm:gap-4 lg:grid-cols-6 lg:gap-5",
        rows === "fixed" && "sm:auto-rows-[11rem] lg:auto-rows-[12rem]",
        className,
      )}
    >
      {children}
    </div>
  );
}

const spanClasses: Record<BentoSpan, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-2 sm:col-span-3",
  4: "col-span-2 sm:col-span-4",
  6: "col-span-2 sm:col-span-4 lg:col-span-6",
};

const rowSpanClasses: Record<BentoRowSpan, string> = {
  1: "",
  2: "row-span-2",
  3: "row-span-3",
};

/**
 * One cell of the grid. Wraps whatever it is given — usually a `Card` — and is
 * the piece that carries the placement.
 */
export function BentoItem({
  children,
  span = 2,
  rowSpan = 1,
  className,
}: {
  /** What sits in the cell. A `Card` stretches to fill it. */
  children: ReactNode;
  /** Columns taken. Collapses to the mobile 2-column grid below `sm`. */
  span?: BentoSpan;
  /** Rows taken. Only meaningful when the grid runs on `rows="fixed"`. */
  rowSpan?: BentoRowSpan;
  /** Extra classes for the cell — rarely needed, the span covers placement. */
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", spanClasses[span], rowSpanClasses[rowSpan], className)}>
      {children}
    </div>
  );
}
