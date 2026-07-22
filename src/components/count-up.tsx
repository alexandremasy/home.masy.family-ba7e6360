import { useEffect, useRef, useState } from "react";

interface Props {
  /** The value counted up to, once the element scrolls into view. */
  to: number;
  /** Length of the ease, in ms. */
  duration?: number;
  /** Decimal places kept while counting and at rest. */
  decimals?: number;
  /** Applied to the `<span>` that holds the number. */
  className?: string;
  /** Rendered before the number — a currency sign, for instance. */
  prefix?: string;
  /** Rendered after the number — a unit such as `kWh` or `%`. */
  suffix?: string;
  /** Thousands grouping (fr-BE). Off by default, so a year stays `2026`. */
  group?: boolean;
}

/** Subtle animated counter that eases towards `to` once visible. */
export function CountUp({
  to,
  duration = 900,
  decimals = 0,
  className,
  prefix,
  suffix,
  group,
}: Props) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);
  // What is on screen right now. A second count starts from there rather than
  // from zero, so a figure that changes eases across instead of collapsing.
  const shown = useRef(0);

  // Re-arm on a NEW TARGET only — not on any render, or scrolling in and out of
  // view would replay the count. `started` used to latch true for the component's
  // whole life, so a figure that changed (a switch from the month to the rolling
  // year, a filter) kept displaying the first number it was ever given while
  // everything around it updated. The four headline KPIs were quietly stale.
  const target = useRef(to);
  if (target.current !== to) {
    target.current = to;
    started.current = false;
  }

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = () => {
      if (started.current) return;
      started.current = true;
      const t0 = performance.now();
      const from = shown.current;
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - p, 3);
        shown.current = from + (to - from) * eased;
        setValue(shown.current);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && start()),
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  const formatted = group
    ? value.toLocaleString("fr-BE", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : value.toFixed(decimals);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
