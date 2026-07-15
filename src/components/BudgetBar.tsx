import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

/**
 * The budget track: how much of a budget is spent, optionally what is still
 * only projected, and what spills past 100%.
 *
 * It was hand-built three times as bare <div>s — invisible to assistive tech,
 * no role, no value. Built on Radix Progress so the number is announced; the
 * extra segments (projection, overflow) live inside the same track because they
 * are the same measurement, not separate bars.
 *
 * Overflow is the ONE place warm belongs here: going over budget is the alert.
 */
export function BudgetBar({
  value, projected, overflow, className,
}: {
  /** Spent, as a % of budget. Clamped to 100 — the spill goes to `overflow`. */
  value: number;
  /** Committed but not yet spent, as a % — drawn behind `value`. */
  projected?: number;
  /** How far past 100% we went, as a % of the track. */
  overflow?: number;
  className?: string;
}) {
  const spent = Math.min(100, Math.max(0, value));
  const over = (overflow ?? 0) > 0;

  return (
    <ProgressPrimitive.Root
      value={spent}
      className={cn("relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary", className)}
    >
      {projected != null && (
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 rounded-full bg-mustard/40 transition-[width] duration-700"
          style={{ width: `${Math.min(100, projected)}%` }}
        />
      )}
      <ProgressPrimitive.Indicator
        className={cn(
          "absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out",
          over ? "bg-warm" : "bg-primary",
        )}
        style={{ width: `${spent}%` }}
      />
      {over && (
        <div
          aria-hidden
          className="absolute inset-y-0 left-full rounded-r-full bg-warm/40 transition-[width] duration-700"
          style={{ width: `${overflow}%` }}
        />
      )}
    </ProgressPrimitive.Root>
  );
}
