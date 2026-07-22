import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Which way the measure moved. The badge only draws it; the caller decides it. */
export type TrendDirection = "up" | "down" | "stable";

export interface TrendBadgeProps {
  /**
   * The direction, already decided. Colour follows consumption's convention — down is
   * good (green), up is warm — so a page where up is good passes its own tone instead.
   */
  trend: TrendDirection;
  /** Signed percentage. Omitted, the badge reads "stable" next to the arrow. */
  pct?: number;
  /** What the percentage is measured against — "vs période préc.". */
  suffix?: string;
  /** Show the arrow alone. For the home tiles, where the figure is already on the tile. */
  hidePct?: boolean;
  /** `sm` for a tile's corner, `md` under a card's headline figure. */
  size?: "sm" | "md";
  /** Extra classes on the wrapper. */
  className?: string;
}

/**
 * A measure's direction, in one line: an arrow, a signed percentage, and what it is
 * measured against.
 *
 * The direction arrives decided — a dead-band around zero is the caller's judgement,
 * not a badge's, and only the caller knows whether three days or three months make a
 * trend. This draws the conclusion.
 */
export function TrendBadge({
  trend,
  pct,
  suffix,
  hidePct = false,
  size = "md",
  className,
}: TrendBadgeProps) {
  const Icon = trend === "down" ? TrendingDown : trend === "up" ? TrendingUp : Minus;
  const sm = size === "sm";
  return (
    <span
      className={cn(
        "inline-flex items-center",
        sm ? "gap-0.5 text-xs" : "gap-1 text-sm",
        trend === "down" && "text-success",
        trend === "up" && "text-mustard",
        trend === "stable" && "text-muted-foreground",
        className,
      )}
    >
      <Icon className={sm ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {!hidePct && (
        <span className="font-semibold tabular-nums">
          {pct === undefined
            ? "stable"
            : new Intl.NumberFormat("fr-BE", {
                maximumFractionDigits: 0,
                signDisplay: "exceptZero",
              }).format(pct) + "%"}
        </span>
      )}
      {suffix && <span className="text-muted-foreground">{suffix}</span>}
    </span>
  );
}
