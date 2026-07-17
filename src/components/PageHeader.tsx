import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useDrawerDrag } from "@/components/MobileDrawerPanel";

/**
 * Sticky page header. Sticks to the top of the viewport as the content scrolls
 * beneath it, with a soft fade mask so the content gracefully dissolves under
 * the header (alexandremasy.com style).
 *
 * The header bleeds edge-to-edge via negative margins, so `variant` MUST match
 * the shell's horizontal padding or the page overflows sideways:
 *   - "overlay" — inside the overlay panel (`px-5 pt-4 pb-8 md:px-8 md:py-10`)
 *   - "page"    — inside the full-bleed shell (`px-4 py-6 sm:px-6 sm:py-10`)
 */
export function PageHeader({
  title,
  subtitle,
  icon,
  back = "/",
  backLabel = "Cockpit",
  action,
  variant = "overlay",
  size = "lg",
}: {
  title: string;
  subtitle?: string;
  /** Optional leading badge icon, left of the title (matches the room header). */
  icon?: ReactNode;
  /** Back link target, or null to drop the "← Cockpit" affordance entirely. */
  back?: string | null;
  backLabel?: string;
  action?: ReactNode;
  variant?: "overlay" | "page";
  /** "lg" — the big page title; "sm" — the compact room-header title. */
  size?: "lg" | "sm";
}) {
  const bleed =
    variant === "page"
      // Sticks BELOW the TopNav. At top-0 it would stick behind it (z-20 vs z-30)
      // and the fade would cut in the wrong place — or vanish entirely on mobile,
      // where the nav is 109px tall.
      ? "top-[var(--nav-h)] -mx-4 -mt-6 px-4 pt-6 sm:-mx-6 sm:-mt-10 sm:px-6 sm:pt-10"
      // The overlay covers the TopNav, so there it really is the top.
      : "top-0 -mx-5 -mt-7 px-5 pt-7 md:-mx-8 md:-mt-10 md:px-8 md:pt-10";

  const titleCls =
    size === "sm"
      ? "truncate font-serif text-xl font-semibold tracking-tight sm:text-2xl"
      : "truncate font-serif text-3xl tracking-tight sm:text-4xl";

  // Inside a bottom sheet the whole header is the drag-to-dismiss zone (the grabber
  // is just the affordance). Outside one — a full-bleed page — `handlers` is null,
  // so no grabber and no drag. This is what gives every sheet the same handle.
  const drag = useDrawerDrag();

  return (
    <div
      {...(drag.handlers ?? {})}
      className={
        "page-header sticky z-20 pb-4 " +
        bleed +
        (drag.handlers ? " cursor-grab touch-none select-none active:cursor-grabbing" : "")
      }
    >
      <div className="page-header__bg pointer-events-none absolute inset-0 bg-background/85 backdrop-blur-xl" />
      <div className="page-header__fade pointer-events-none absolute inset-x-0 top-full h-8 bg-gradient-to-b from-background to-transparent" />
      {drag.handlers && (
        <div className="relative mx-auto mb-2 h-1.5 w-11 rounded-full bg-muted-foreground/30 md:hidden" />
      )}
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2.5">
          {icon && (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            {back && (
              <Link to={back} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                ← {backLabel}
              </Link>
            )}
            <h1 className={(back ? "mt-2 " : "") + titleCls}>{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
