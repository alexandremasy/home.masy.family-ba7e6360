import { useEffect, useRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { fxVars } from "./fx-vars";

export type AmbientMeshProps = {
  /** The three blob colours, back to front. Off-palette on purpose — this is atmosphere. */
  colors?: [string, string, string];
  /** Blob diameter before the drift scales it (any CSS length). */
  size?: string;
  /** Blur radius: the lower it goes, the more the blobs read as distinct shapes. */
  blur?: string;
  /** Per-blob opacity, 0→1. */
  opacity?: number;
  /** Base cycle duration; the three blobs are offset around it so they never sync. */
  speed?: string;
  /**
   * Rotate the whole mesh's hue as the page scrolls, up to `hueRange`.
   * Off by default — it costs a scroll listener.
   */
  scrollHue?: boolean;
  /** How far the hue travels across a full scroll. */
  hueRange?: string;
  /**
   * Cover the viewport instead of the parent box. Only valid outside a
   * transformed ancestor — a transform traps a fixed layer.
   */
  fixed?: boolean;
  className?: string;
};

/**
 * Blurred blobs drifting slowly behind the page, Stripe-style.
 *
 * The look lives in `.fx-mesh` (styles.css); this component only feeds it
 * variables and, when `scrollHue` is on, writes scroll progress into
 * `--fx-mesh-scroll` for the CSS to turn into a hue-rotate.
 */
export function AmbientMesh({
  colors,
  size,
  blur,
  opacity,
  speed,
  scrollHue = false,
  hueRange,
  fixed = false,
  className,
}: AmbientMeshProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !scrollHue) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.setProperty("--fx-mesh-scroll", String(p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [scrollHue]);

  const style = fxVars({
    "--fx-mesh-a": colors?.[0],
    "--fx-mesh-b": colors?.[1],
    "--fx-mesh-c": colors?.[2],
    "--fx-mesh-size": size,
    "--fx-mesh-blur": blur,
    "--fx-mesh-opacity": opacity,
    "--fx-mesh-speed": speed,
    "--fx-mesh-hue-range": hueRange,
  }) as CSSProperties;

  return (
    <div
      ref={ref}
      aria-hidden
      style={style}
      className={cn("fx-mesh", fixed && "fx-mesh--fixed", className)}
    >
      <span className="fx-mesh__blob" />
      <span className="fx-mesh__blob" />
      <span className="fx-mesh__blob" />
    </div>
  );
}
