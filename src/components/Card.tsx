import { type ReactNode, type HTMLAttributes } from "react";
import { Link } from "@tanstack/react-router";

interface BaseProps {
  children: ReactNode;
  className?: string;
  span?: 1 | 2 | 3 | 4 | 6;
  rowSpan?: 2;
  tone?: "default" | "primary" | "warm" | "accent" | "dark";
}

const toneClasses: Record<NonNullable<BaseProps["tone"]>, string> = {
  default: "bg-card text-card-foreground",
  primary: "bg-primary text-primary-foreground",
  warm: "bg-warm text-warm-foreground",
  accent: "bg-accent text-accent-foreground",
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

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft sm:p-8 anim-slide-up">
      <header className="mb-5 flex items-end justify-between gap-4">
        <h2 className="font-serif text-2xl tracking-tight text-foreground">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}
