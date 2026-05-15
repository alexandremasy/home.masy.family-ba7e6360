import { useEffect, useRef } from "react";

/**
 * Stripe-like / alexandremasy.com-inspired cursor: a wobbly rounded rect
 * (SVG with a fractal-noise displacement filter) that snaps onto any
 * element marked with `data-cursor` and morphs to its bounds.
 */
export function CursorFollower() {
  const svgRef = useRef<SVGSVGElement>(null);
  const rectRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const rect = rectRef.current;
    if (!svg || !rect) return;

    let active: Element | null = null;
    const PAD = 8;

    const place = (el: Element) => {
      const r = el.getBoundingClientRect();
      const w = r.width + PAD * 2;
      const h = r.height + PAD * 2;
      svg.style.opacity = "1";
      svg.style.width = `${w}px`;
      svg.style.height = `${h}px`;
      svg.style.transform = `translate3d(${r.left - PAD}px, ${r.top - PAD}px, 0)`;
      rect.setAttribute("width", String(w - 2));
      rect.setAttribute("height", String(h - 2));
    };

    const onMove = (e: MouseEvent) => {
      const t = e.target as Element | null;
      const el = t?.closest("[data-cursor]") ?? null;
      if (!el) {
        if (active) {
          active = null;
          svg.style.opacity = "0";
        }
        return;
      }
      if (el !== active) active = el;
      place(el);
    };

    const onLeave = () => {
      active = null;
      svg.style.opacity = "0";
    };

    const onScroll = () => {
      if (active) place(active);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <svg ref={svgRef} className="cursor-follower" aria-hidden style={{ opacity: 0 }}>
      <defs>
        <filter id="cursor-warp" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="3" result="warp">
            <animate attributeName="baseFrequency" dur="9s" values="0.012;0.022;0.012" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <rect ref={rectRef} className="cursor-follower__rect" x="1" y="1" width="100" height="100" rx="16" />
    </svg>
  );
}
