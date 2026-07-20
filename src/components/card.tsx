import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────────
   ONE card. Not three, not four.

   An audit of four views (énergie, Bernard, dashboard, pièces) found the same
   skeleton written ten times — three competing named components (`Section`,
   `SectionTitle`, `MetricCard`) plus seven inline copies, across 152 card-shaped
   surfaces and 50 distinct signatures. They agreed on the structure and diverged
   on the surface, which is a consequence rather than the problem.

   The anatomy: a header of four slots (icon · title · subline · action), a body
   that is a pure slot, and a footer the component pins itself. The `action` slot
   is the one that never existed, which is why every view smuggled its badge,
   filter, tabs or toggle in some other way.

   One grammar (decided 2026-07-20): icon left in its tinted circle, title beside
   it. There is no `layout` prop — the dashboard's tonal "eyebrow + icon right"
   tiles migrate onto this one.

   Padding lives on the slots rather than on the box: that is what lets the rule
   under the header run full-bleed with no negative-margin trick, and lets a body
   run edge-to-edge (the relevé table) while its header stays padded.
   ──────────────────────────────────────────────────────────────────────────── */

export type CardVariant = "solid" | "soft" | "glass" | "inset" | "inverted";
export type CardTone = "primary" | "success" | "warm" | "mustard" | "destructive";
export type CardPadding = "sm" | "md";
export type CardRadius = "xl" | "full";

/**
 * The surfaces. A surface is a nature, not a colour — which is why Bernard's dark
 * card is `inverted` here rather than a `tone`. And not a shape either: the corner
 * radius is its own prop, because the same surface rounds differently depending on
 * where it sits (the bento pills are `inset` cards with a full radius).
 *
 * These carry the border but NOT the fill: the fill belongs to the sheet below, so
 * a footer can sit inside the border without it.
 */
const surface: Record<CardVariant, string> = {
  solid: "border-2 border-border/60 text-card-foreground",
  soft: "border-2 border-border/60 text-card-foreground",
  glass: "border-2 border-white text-card-foreground dark:border-white/10",
  inset: "border-2 border-border/60 bg-secondary/50",
  inverted: "bg-foreground text-background",
};

/** Two corners, and no others: the box, and the bento pill. */
const radiusClass: Record<CardRadius, string> = {
  xl: "rounded-xl",
  full: "rounded-full",
};

/**
 * Per-slot padding — one vertical rhythm, the same above and below every slot, so
 * the card opens and closes on the same inset whichever slot happens to be last.
 * Only the horizontal inset breathes with the viewport.
 */
const pad: Record<CardPadding, { x: string; y: string }> = {
  sm: { x: "px-4", y: "py-3" },
  md: { x: "px-4", y: "py-4" },
};

/**
 * The filled sheet that carries header + body. The footer sits OUTSIDE it, inside
 * the card's border but off the fill — so the fill ends with the body.
 *
 * The elevation belongs here too, not on the card: what lifts off the page is the
 * filled area, and a shadow drawn around the footer would outline a shape that has
 * no fill. Cards whose colour *is* the card (inset, inverted) have no sheet.
 */
const sheet: Partial<Record<CardVariant, string>> = {
  solid: "bg-card",
  soft: "bg-card shadow-soft",
  glass: "bg-card/60 shadow-xs backdrop-blur-md",
};

/**
 * The icon circle. `tone` colours the ICON, never the card — the counts come from
 * the audit: primary 13, success 10, warm 9, mustard 2.
 */
const toneCircle: Record<CardTone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warm: "bg-warm/15 text-warm",
  mustard: "bg-mustard/20 text-mustard",
  destructive: "bg-destructive/10 text-destructive",
};

/**
 * On a coloured or translucent surface the tinted circle has nothing to sit on,
 * so the surface dictates the circle and `tone` steps aside.
 */
const surfaceCircle: Partial<Record<CardVariant, string>> = {
  glass: "bg-white text-primary",
  inverted: "bg-background/15 text-background",
};

export interface CardProps {
  /** The body. A pure slot — a number, a gauge, a list, a chart, controls, or nothing. */
  children?: ReactNode;
  /** Header title. Omit it and no header renders at all. */
  title?: ReactNode;
  /** Rendered inside the 36px tinted circle, left of the title. Needs `title`. */
  icon?: ReactNode;
  /** Secondary line under the title. A node, not a string — Bernard composes JSX here. */
  subline?: ReactNode;
  /** Right end of the header row: a badge, a filter, tabs, a legend — or a real control. */
  action?: ReactNode;
  /**
   * Sits inside the card's border but off the filled sheet, so the fill ends with
   * the body. Pinned to the bottom, so footers line up across a grid.
   */
  footer?: ReactNode;
  /**
   * The surface. `solid` is the plain content box; `soft` adds the shadow for a
   * card that floats on the page; `glass` is the frosted dashboard tile; `inset` a
   * tinted box *inside* another card; `inverted` the dark feature card (Bernard).
   */
  variant?: CardVariant;
  /** Corner radius. `full` turns an `inset` card into a bento pill. */
  radius?: CardRadius;
  /**
   * Colours the ICON, not the card. Ignored on `glass` and `inverted`, where the
   * surface dictates the circle.
   */
  tone?: CardTone;
  /** Inner spacing. `md` is what the 25 hand-built panels converged on. */
  padding?: CardPadding;
  /** Drop the body's horizontal padding, for edge-to-edge content such as a table. */
  bleed?: boolean;
  /** Render the whole card as a router Link to this route. */
  to?: string;
  /** Element used when the card is not a link. */
  as?: "section" | "div" | "article";
  /**
   * Escape hatch for a genuine one-off. Merged with `cn`, so it wins without
   * `!important`. Not for placement: a card knows nothing about the grid it sits
   * in — use `BentoItem` for that.
   */
  className?: string;
}

/**
 * The card. Header slots are props (`icon`, `title`, `subline`, `action`), the
 * body is `children`, the footer is `footer` — one component, one props table.
 */
export function Card({
  children,
  title,
  icon,
  subline,
  action,
  footer,
  variant = "soft",
  radius = "xl",
  tone = "primary",
  padding = "md",
  bleed = false,
  to,
  as: As = "section",
  className,
}: CardProps) {
  const p = pad[padding];

  // cn (tailwind-merge) resolves conflicts, so a tone or a className override wins
  // WITHOUT `!important` — that is what killed the per-site override surgery.
  const cls = cn(
    "flex h-full flex-col",
    surface[variant],
    radiusClass[radius],
    // A link card announces itself: it lifts on hover, settles back on press, and
    // takes a visible focus ring for the keyboard.
    to && [
      "group relative transition-all duration-300",
      "hover:-translate-y-0.5 hover:shadow-lift",
      "active:translate-y-0 active:shadow-soft active:duration-75",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
    ],
    className,
  );

  const inner = (
    <>
      {title && (
        <header
          data-slot="header"
          className={cn(
            "flex items-start justify-between gap-4",
            p.x,
            p.y,
            // The rule is anatomy, not an option: a header sitting above a body is
            // always separated from it.
            children != null && "border-b border-border/60",
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            {icon && (
              <span
                data-slot="icon"
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                  surfaceCircle[variant] ?? toneCircle[tone],
                )}
              >
                {icon}
              </span>
            )}
            <div className="min-w-0">
              <h2 data-slot="title" className="truncate text-base font-semibold tracking-tight">
                {title}
              </h2>
              {subline && (
                <p data-slot="subline" className="mt-0.5 text-xs text-muted-foreground">
                  {subline}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {action && <div data-slot="action">{action}</div>}
            {/* A link card carries the caret, same as PersonCard. */}
            {to && (
              <ChevronRight
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              />
            )}
          </div>
        </header>
      )}

      {/*
        A card fills whatever the parent gives it, so the body absorbs the slack —
        and it is a flex COLUMN, which is what lets content inside push itself to
        the bottom with `mt-auto`. Dropping that is what left the dashboard tiles
        top-heavy with a void underneath.
      */}
      {children != null && (
        <div data-slot="body" className={cn("flex flex-1 flex-col text-sm", !bleed && p.x, p.y)}>
          {children}
        </div>
      )}
    </>
  );

  // The sheet carries the fill, the elevation and the clip; the footer sits under
  // it, inside the border but off the fill. The clip lives here rather than on the
  // card so it cannot cut the sheet's own shadow off.
  const body = (
    <>
      <div
        data-slot="sheet"
        className={cn("flex flex-1 flex-col overflow-hidden", radiusClass[radius], sheet[variant])}
      >
        {inner}
      </div>

      {footer && (
        <div data-slot="footer" className={cn(p.x, p.y)}>
          {footer}
        </div>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} data-cursor className={cls}>
        {body}
      </Link>
    );
  }
  return <As className={cls}>{body}</As>;
}
