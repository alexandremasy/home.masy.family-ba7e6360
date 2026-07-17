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

const toneClasses: Record<NonNullable<BaseProps["tone"]>, string> = {
  default: "bg-card text-card-foreground",
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
  className = "",
  span = 2,
  rowSpan,
  tone = "default",
  to,
  ...rest
}: BaseProps & { to?: string } & Omit<HTMLAttributes<HTMLDivElement>, "children">) {
  const cls =
    "group relative overflow-hidden rounded-2xl border border-border/50 p-5 shadow-soft transition-all duration-300 hover:shadow-lift hover:-translate-y-0.5 hover:border-border " +
    toneClasses[tone] +
    " " +
    spanClasses[span] +
    (rowSpan === 2 ? " row-span-2" : "") +
    " " +
    className;

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

/**
 * The card-shaped box a page section sits in. It was hand-written 31 times with
 * SIX paddings for one role; this names the role and offers three.
 *
 * Section is built on it — don't add a third box.
 */
export function Panel({
  children, padding = "md", className, as: As = "section",
}: {
  children: ReactNode;
  padding?: keyof typeof panelPadding;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <As className={cn("rounded-lg border border-border/60 bg-card", panelPadding[padding], className)}>
      {children}
    </As>
  );
}

/** A Panel with a title row. */
export function Section({
  title,
  children,
  action,
  className,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Panel padding="md" className={cn("anim-slide-up", className)}>
      <header className="mb-4 flex items-end justify-between gap-4">
        <h2 className="font-serif text-lg tracking-tight text-foreground">{title}</h2>
        {action}
      </header>
      {children}
    </Panel>
  );
}
