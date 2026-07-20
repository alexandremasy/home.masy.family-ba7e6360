import { type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { fxVars } from "./fx-vars";

export type MediaSweepProps = {
  /**
   * The colour the pane is washed with. `null` gives the neutral card wash —
   * still breathing, just untinted (a media surface with nothing playing).
   */
  tint?: string | null;
  /** One full left→right→left pass. */
  speed?: string;
  /** How far the gradient overflows the box; the bigger it is, the softer the drift. */
  size?: string;
  className?: string;
  children?: ReactNode;
};

/**
 * A tinted pane whose gradient drifts slowly under its content — the surface
 * feels alive while nothing on it moves.
 *
 * The motion lives in `.fx-sweep` (styles.css); this component composes the
 * gradient the sweep moves, so callers pass a colour rather than restating a
 * three-stop `linear-gradient` at every call site.
 */
export function MediaSweep({ tint = null, speed, size, className, children }: MediaSweepProps) {
  const style = {
    ...fxVars({ "--fx-sweep-speed": speed, "--fx-sweep-size": size }),
    backgroundImage: tint
      ? `linear-gradient(120deg, color-mix(in oklab, ${tint} 32%, var(--card)), var(--card) 55%, color-mix(in oklab, ${tint} 16%, var(--card)))`
      : "linear-gradient(135deg, color-mix(in oklab, var(--card) 92%, transparent), var(--card))",
  } as CSSProperties;

  return (
    <div style={style} className={cn("fx-sweep", className)}>
      {children}
    </div>
  );
}
