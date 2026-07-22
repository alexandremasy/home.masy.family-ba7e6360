export interface TickGaugeProps {
  /** What to read. Clamped between 0 and `max`. */
  value: number;
  /** The ceiling the arc represents — a line's rated speed, a tank's capacity. */
  max: number;
  /** Sizing and overflow for the svg itself. */
  className?: string;
}

/**
 * A dial of ticks — the arc fills up to the value's share of `max`.
 *
 * Many hairline ticks rather than a few fat ones: the density is what makes it
 * read as an instrument. Lit ticks are longer AND thicker, so the level survives
 * a glance in either theme, and greyscale.
 *
 * It reads any share of a ceiling — a line speed, a tank level — and knows nothing
 * about units. The number goes in the middle, by the caller.
 */
export function TickGauge({ value, max, className = "" }: TickGaugeProps) {
  const N = 56,
    cx = 100,
    cy = 88,
    r = 78;
  const pct = Math.min(1, Math.max(0, value / max));
  const ticks = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    const a = Math.PI - t * Math.PI;
    const on = t <= pct;
    const len = on ? 14 : 7;
    return {
      key: i,
      on,
      x1: cx + r * Math.cos(a),
      y1: cy - r * Math.sin(a),
      x2: cx + (r - len) * Math.cos(a),
      y2: cy - (r - len) * Math.sin(a),
    };
  });
  return (
    <svg viewBox="0 0 200 96" className={className} aria-hidden>
      {ticks.map((t) => (
        <line
          key={t.key}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          strokeWidth={t.on ? 1.6 : 1}
          strokeLinecap="round"
          className={t.on ? "stroke-primary" : "stroke-border"}
          opacity={t.on ? 1 : 0.7}
        />
      ))}
    </svg>
  );
}
