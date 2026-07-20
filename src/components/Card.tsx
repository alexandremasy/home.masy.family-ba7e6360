import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
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

   Padding lives on the slots rather than on the box: that is what lets `divided`
   draw a true full-bleed rule with no negative-margin trick, and lets a body run
   edge-to-edge (the relevé table) while its header stays padded.
   ──────────────────────────────────────────────────────────────────────────── */

export type CardVariant = "solid" | "soft" | "glass" | "pill" | "inset";
export type CardTone = "default" | "primary" | "warm" | "mustard" | "dark";
export type CardPadding = "sm" | "md" | "lg";

/** The five real surfaces, clustered from the audit. Nature, not decoration. */
const surface: Record<CardVariant, string> = {
  solid: "rounded-xl border border-border/60 bg-card text-card-foreground",
  soft: "rounded-2xl border border-border/60 bg-card text-card-foreground shadow-soft",
  glass:
    "rounded-2xl border border-white bg-card/60 text-card-foreground shadow-xs backdrop-blur-md dark:border-white/10",
  pill: "flex min-h-[3.5rem] items-center rounded-full bg-card/70 text-card-foreground backdrop-blur-md",
  inset: "rounded-xl border border-border/60 bg-secondary/50",
};

/** Tint applied over the surface. `default` leaves the surface's own background. */
const toneClasses: Record<Exclude<CardTone, "default">, string> = {
  primary: "bg-primary text-primary-foreground",
  warm: "bg-warm text-warm-foreground",
  mustard: "bg-mustard text-mustard-foreground",
  dark: "bg-foreground text-background",
};

/** Per-slot padding, so a rule can span the full width without negative margins. */
const pad: Record<CardPadding, { x: string; head: string; body: string; foot: string }> = {
  sm: { x: "px-4", head: "pt-4 pb-3", body: "last:pb-4", foot: "pt-3 pb-4" },
  md: {
    x: "px-5 sm:px-6",
    head: "pt-5 pb-4 sm:pt-6",
    body: "last:pb-5 sm:last:pb-6",
    foot: "pt-4 pb-5 sm:pb-6",
  },
  lg: {
    x: "px-6 sm:px-8",
    head: "pt-6 pb-4 sm:pt-8",
    body: "last:pb-6 sm:last:pb-8",
    foot: "pt-4 pb-6 sm:pb-8",
  },
};

const spanClasses: Record<NonNullable<CardProps["span"]>, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-2 sm:col-span-3",
  4: "col-span-2 sm:col-span-4",
  6: "col-span-2 sm:col-span-4 lg:col-span-6",
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
  /** Pinned to the bottom, so footers line up across a grid. Sparkline, meta line, legend. */
  footer?: ReactNode;
  /**
   * The surface. `solid` is the plain content box; `soft` adds the shadow for a
   * card that floats on the page; `glass` is the frosted dashboard tile; `pill` a
   * rounded row; `inset` a tinted box *inside* another card.
   */
  variant?: CardVariant;
  /** Tint for a feature card. `default` keeps the surface's own background. */
  tone?: CardTone;
  /** Inner spacing. `md` is what the 25 hand-built panels converged on. */
  padding?: CardPadding;
  /** Draw a hairline under the header and above the footer. */
  divided?: boolean;
  /** Drop the body's horizontal padding, for edge-to-edge content such as a table. */
  bleed?: boolean;
  /** Column span in the bento grid. Ignored outside a grid. */
  span?: 1 | 2 | 3 | 4 | 6;
  /** Make the card two rows tall in the bento grid. */
  rowSpan?: 2;
  /** Render the whole card as a router Link to this route. */
  to?: string;
  /** Element used when the card is not a link. */
  as?: "section" | "div" | "article";
  /** Escape hatch for a genuine one-off. Merged with `cn`, so it wins without `!important`. */
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
  tone = "default",
  padding = "md",
  divided = false,
  bleed = false,
  span,
  rowSpan,
  to,
  as: As = "section",
  className,
}: CardProps) {
  const p = pad[padding];

  // cn (tailwind-merge) resolves conflicts, so a tone or a className override wins
  // WITHOUT `!important` — that is what killed the per-site override surgery.
  const cls = cn(
    "flex h-full flex-col overflow-hidden",
    surface[variant],
    tone !== "default" && toneClasses[tone],
    span && spanClasses[span],
    rowSpan === 2 && "row-span-2",
    to && "group relative transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift",
    className,
  );

  const inner = (
    <>
      {title && (
        <header
          className={cn(
            "flex items-start justify-between gap-4",
            p.x,
            p.head,
            divided && "border-b border-border/60",
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            {icon && (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                {icon}
              </span>
            )}
            <div className="min-w-0">
              <h2 className="truncate font-serif text-base font-semibold tracking-tight">
                {title}
              </h2>
              {subline && <p className="mt-0.5 text-sm text-muted-foreground">{subline}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}

      {children != null && (
        <div className={cn("flex-1", !bleed && p.x, p.body, !title && p.head)}>{children}</div>
      )}

      {footer && (
        <div className={cn("mt-auto", p.x, p.foot, divided && "border-t border-border/60")}>
          {footer}
        </div>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} data-cursor className={cls}>
        {inner}
      </Link>
    );
  }
  return <As className={cls}>{inner}</As>;
}

/* ── Migration shims — delete once every call site moves to <Card> ────────────
   These keep the ~56 existing usages rendering while the views are migrated one
   by one. They hold no styling of their own: everything routes through Card, so
   there is still exactly one implementation. */

/** @deprecated Use `<Card variant="glass" span={…}>`. Kept only until the dashboard migrates. */
export function Tile({
  variant = "solid",
  ...rest
}: Omit<CardProps, "variant"> & { variant?: "solid" | "glass" | "pill" }) {
  return <Card {...rest} variant={variant === "solid" ? "soft" : variant} as="div" />;
}

/** @deprecated Use `<Card>`. Kept only until the content views migrate. */
export function Panel({
  variant = "flat",
  ...rest
}: Omit<CardProps, "variant"> & { variant?: "flat" | "compact" | "soft" | "inset" }) {
  return (
    <Card
      {...rest}
      variant={variant === "flat" || variant === "compact" ? "solid" : variant}
      as="section"
    />
  );
}

/** @deprecated Use `<Card title=… action=…>`. Kept only until the room/saisie views migrate. */
export function Section({ title, ...rest }: CardProps & { title: ReactNode }) {
  return <Card {...rest} title={title} variant="solid" />;
}
