import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

/**
 * Sticky page header for overlay pages. Sticks to the top of the viewport
 * as the modal content scrolls beneath it, with a soft fade mask so the
 * content gracefully dissolves under the header (alexandremasy.com style).
 *
 * Use as the first child of a page route inside the overlay.
 */
export function PageHeader({
  title,
  subtitle,
  back = "/",
  backLabel = "Cockpit",
  action,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  backLabel?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-header sticky top-0 z-20 -mx-5 -mt-7 px-5 pt-7 pb-4 sm:-mx-8 sm:-mt-10 sm:px-8 sm:pt-10">
      <div className="page-header__bg pointer-events-none absolute inset-0 bg-background/85 backdrop-blur-xl" />
      <div className="page-header__fade pointer-events-none absolute inset-x-0 top-full h-8 bg-gradient-to-b from-background to-transparent" />
      <div className="relative flex items-end justify-between gap-4">
        <div className="min-w-0">
          <Link to={back} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            ← {backLabel}
          </Link>
          <h1 className="mt-2 truncate font-serif text-3xl tracking-tight sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
