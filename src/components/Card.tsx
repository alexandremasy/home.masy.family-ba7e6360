import { type ReactNode, type HTMLAttributes } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface BaseProps {
  children: ReactNode;
  className?: string;
  span?: 1 | 2 | 3 | 4 | 6;
  rowSpan?: 2;
  tone?: "default" | "primary" | "warm" | "mustard" | "dark";
}

type TileVariant = "solid" | "glass" | "pill";

// The three real Tile surfaces (was ~6 ad-hoc `!`-override flavors across the dashboard).
// `solid` is the default card; `glass` a frosted translucent tile; `pill` a rounded row.
const tileSurface: Record<TileVariant, string> = {
  solid:
    "rounded-2xl border border-border/50 bg-card text-card-foreground p-5 shadow-soft hover:border-border",
  glass:
    "rounded-2xl border border-white bg-card/60 text-card-foreground p-4 shadow-xs backdrop-blur-md dark:border-white/10",
  pill: "flex min-h-[3.5rem] items-center rounded-full border-0 bg-card/70 text-card-foreground px-5 py-2.5 backdrop-blur-md",
};

// Tint (bg + text) for a solid tile. `default` is left to the surface's own bg.
const toneClasses: Record<Exclude<NonNullable<BaseProps["tone"]>, "default">, string> = {
  primary: "bg-primary text-primary-foreground",
  warm: "bg-warm text-warm-foreground",
  mustard: "bg-mustard text-mustard-foreground",
  dark: "bg-foreground text-background",
};

const spanClasses: Record<NonNullable<BaseProps["span"]>, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-2 sm:col-span-3",
  4: "col-span-2 sm:col-span-4",
  6: "col-span-2 sm:col-span-4 lg:col-span-6",
};

export function Tile({
  children,
  className,
  span = 2,
  rowSpan,
  tone = "default",
  variant = "solid",
  to,
  ...rest
}: BaseProps & { variant?: TileVariant; to?: string } & Omit<
    HTMLAttributes<HTMLDivElement>,
    "children"
  >) {
  // cn (tailwind-merge) resolves conflicts, so a tint or a `className` override wins
  // WITHOUT `!important` — that's what killed the per-site override surgery.
  const cls = cn(
    "group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift",
    tileSurface[variant],
    tone !== "default" && toneClasses[tone],
    spanClasses[span],
    rowSpan === 2 && "row-span-2",
    className,
  );

  if (to) {
    return (
      <Link to={to} data-cursor className={cls} {...(rest as object)}>
        {children}
      </Link>
    );
  }
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}

const panelPadding = {
  sm: "p-4",
  md: "p-5 sm:p-7", // what the 25 hand-built panels converged on
  lg: "p-6 sm:p-8",
} as const;

export type PanelVariant = "flat" | "compact" | "soft" | "inset";

// The four real content-box surfaces, clustered from a repo-wide audit of the
// hand-rolled ones (152 card-shaped surfaces, 50 signatures). Surface only —
// padding stays an orthogonal prop, which is what made the flavors multiply.
//   flat    what Panel/Section already render (~31 sites)
//   compact rounded-xl, no shadow — the most common hand-rolled card (~21)
//   soft    rounded-2xl + shadow-soft — the budget/securite views (~13)
//   inset   a secondary-tinted box INSIDE a card, not a card itself (~21)
// No `raised`: shadow-lift turned out to be for overlays/tooltips/sticky bars,
// never a content box.
const panelSurface: Record<PanelVariant, string> = {
  flat: "rounded-lg border border-border/60 bg-card",
  compact: "rounded-xl border border-border/60 bg-card",
  soft: "rounded-2xl border border-border/60 bg-card shadow-soft",
  inset: "rounded-xl border border-border/60 bg-secondary/50",
};

/**
 * The card-shaped box a page section sits in. It was hand-written 31 times with
 * SIX paddings for one role; this names the role and offers three.
 *
 * Section is built on it — don't add a third box.
 */
export function Panel({
  children,
  padding = "md",
  variant = "flat",
  className,
  as: As = "section",
}: {
  children: ReactNode;
  padding?: keyof typeof panelPadding;
  variant?: PanelVariant;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <As className={cn(panelSurface[variant], panelPadding[padding], className)}>{children}</As>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   The anatomy — Card + CardHeader / CardBody / CardFooter.

   An audit of 4 views (énergie, Bernard, dashboard, pièces) found the SAME card
   skeleton written 10 times: 3 competing named components (Section, SectionTitle,
   MetricCard) plus 7 inline copies. They agree on the structure and disagree on
   nothing that matters.

   ONE header, FOUR slots — icon, title, subline, action. The 4th is the one that
   was always missing, so every view smuggled its badge / filter / tabs / toggle
   in some other way.

   ONE grammar (decided 2026-07-20, Alex): icon left in its tinted circle, title
   beside it. No `layout` prop — the "eyebrow + icon right" variant of the tonal
   dashboard tiles is a divergence, not a need, and those tiles migrate onto this.

   Padding lives on the SLOTS, not on Card. That is what lets `divided` draw a
   real full-bleed rule with no negative-margin trick, and lets a body go
   edge-to-edge (the relevé table) while its header stays padded.
   ──────────────────────────────────────────────────────────────────────────── */

/** The card surface. Holds no padding — the slots do. */
export function Card({
  children,
  variant = "soft",
  className,
  as: As = "section",
}: {
  children: ReactNode;
  variant?: PanelVariant;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <As className={cn("flex h-full flex-col overflow-hidden", panelSurface[variant], className)}>
      {children}
    </As>
  );
}

/**
 * The four slots. `icon` renders in the 36px tinted circle every view already
 * hand-rolls; `subline` is a ReactNode because Bernard composes JSX in it;
 * `action` takes anything — a badge, a Select, Tabs, or a real control (the room
 * on/off toggle lives in the page header today only because this slot was absent).
 */
export function CardHeader({
  title,
  icon,
  subline,
  action,
  divided = false,
  className,
}: {
  title: ReactNode;
  icon?: ReactNode;
  subline?: ReactNode;
  action?: ReactNode;
  divided?: boolean;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex items-start justify-between gap-4 px-5 pt-5 pb-4 sm:px-6 sm:pt-6",
        divided && "border-b border-border/60",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {icon && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate font-serif text-base font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {subline && <p className="mt-0.5 text-sm text-muted-foreground">{subline}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

/**
 * The body is a pure slot — the audit found a big number, a gauge, a list, a
 * recharts chart, controls, and nothing at all. There is no variant to add here;
 * parameterising it is what produced the fifty flavors in the first place.
 *
 * `bleed` drops the horizontal padding for edge-to-edge content (tables).
 */
export function CardBody({
  children,
  bleed = false,
  className,
}: {
  children: ReactNode;
  bleed?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex-1",
        bleed ? "last:pb-5 sm:last:pb-6" : "px-5 last:pb-5 sm:px-6 sm:last:pb-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Pinned to the bottom by `mt-auto` — that is the whole point of it belonging to
 * the component. In a grid, footers that each caller positions never line up.
 */
export function CardFooter({
  children,
  divided = false,
  className,
}: {
  children: ReactNode;
  divided?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-auto px-5 pt-4 pb-5 sm:px-6 sm:pb-6",
        divided && "border-t border-border/60",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A Panel with a title row. */
export function Section({
  title,
  children,
  action,
  variant = "flat",
  className,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  variant?: PanelVariant;
  className?: string;
}) {
  return (
    <Panel padding="md" variant={variant} className={cn("anim-slide-up pt-4 sm:pt-5", className)}>
      <header className="mb-4 flex items-end justify-between gap-4">
        <h2 className="font-serif text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {action}
      </header>
      {children}
    </Panel>
  );
}
