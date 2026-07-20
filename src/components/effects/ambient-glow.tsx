import { type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { fxVars } from "./fx-vars";

export type AmbientGlowProps = {
  /** Any CSS colour or token reference. Defaults to `var(--primary)`. */
  color?: string;
  /** Percentage of `color` mixed into the core, 0→100. Above ~40 it stops reading as ambient. */
  strength?: number;
  /** Horizontal anchor of the blob, as a percentage of the box. */
  x?: string;
  /** Width of the ellipse relative to the box; the height follows at ~0.89 of it. */
  spread?: string;
  /** One full drift + bloom cycle. */
  speed?: string;
  /** Hue travel at the bloom's peak. */
  shift?: string;
  className?: string;
};

/**
 * A tinted wash anchored to the top edge of its box, drifting sideways and
 * blooming in and out of saturation.
 *
 * It paints its own box, so it is positioned by the caller — typically
 * `absolute inset-x-0 -top-6 -z-10 h-96` above a page's title band. `absolute`,
 * not `fixed`: a `.mode-enter` ancestor keeps a transform, which traps a fixed
 * layer. The look lives in `.fx-glow` (styles.css).
 */
export function AmbientGlow({
  color,
  strength,
  x,
  spread,
  speed,
  shift,
  className,
}: AmbientGlowProps) {
  const style = fxVars({
    "--fx-glow-color": color,
    "--fx-glow-strength": strength,
    "--fx-glow-x": x,
    "--fx-glow-spread": spread,
    "--fx-glow-speed": speed,
    "--fx-glow-shift": shift,
  }) as CSSProperties;

  return <div aria-hidden style={style} className={cn("fx-glow pointer-events-none", className)} />;
}
