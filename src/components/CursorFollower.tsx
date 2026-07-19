import { useEffect, useRef } from "react";

/**
 * Custom cursor inspired by alexandremasy.com:
 * - The native system cursor is kept (auto → pointer on interactive elements);
 *   a soft circle ring trails it.
 * - On interactive elements (a, button, [data-cursor], [role="button"], inputs):
 *   the ring morphs into a wobbly rounded rectangle snapped to the element's bounds,
 *   distorted by an SVG fractal-noise displacement filter.
 */
export function CursorFollower() {
  const svgRef = useRef<SVGSVGElement>(null);
  const shapeRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const shape = shapeRef.current;
    if (!svg || !shape) return;

    const INTERACTIVE =
      'a, button, [role="button"], [data-cursor], input, select, textarea, summary, label';
    const PAD = 8;
    const IDLE = 22; // diameter of the idle ring

    let active: Element | null = null;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const placeOnTarget = (el: Element) => {
      const r = el.getBoundingClientRect();
      const w = r.width + PAD * 2;
      const h = r.height + PAD * 2;
      svg.style.opacity = "1";
      svg.style.width = `${w}px`;
      svg.style.height = `${h}px`;
      svg.style.transform = `translate3d(${r.left - PAD}px, ${r.top - PAD}px, 0)`;
      shape.setAttribute("width", String(w - 2));
      shape.setAttribute("height", String(h - 2));
      shape.setAttribute("rx", "16");
      shape.setAttribute("ry", "16");
      svg.classList.add("is-warp");
    };

    const placeIdle = () => {
      const w = IDLE;
      const h = IDLE;
      svg.style.opacity = "1";
      svg.style.width = `${w}px`;
      svg.style.height = `${h}px`;
      svg.style.transform = `translate3d(${mouseX - w / 2}px, ${mouseY - h / 2}px, 0)`;
      shape.setAttribute("width", String(w - 2));
      shape.setAttribute("height", String(h - 2));
      shape.setAttribute("rx", String(w / 2));
      shape.setAttribute("ry", String(h / 2));
      svg.classList.remove("is-warp");
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const t = e.target as Element | null;
      const el = t?.closest(INTERACTIVE) ?? null;
      if (el) {
        active = el;
        placeOnTarget(el);
      } else {
        active = null;
        placeIdle();
      }
    };

    const onLeave = () => {
      active = null;
      svg.style.opacity = "0";
    };

    const onScroll = () => {
      if (active) placeOnTarget(active);
      else placeIdle();
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
    <>
      <svg ref={svgRef} className="cursor-follower" aria-hidden style={{ opacity: 0 }}>
        <defs>
          <filter id="cursor-warp" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.014"
              numOctaves="2"
              seed="3"
              result="warp"
            >
              <animate
                attributeName="baseFrequency"
                dur="9s"
                values="0.014;0.024;0.014"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="warp"
              scale="5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
        <rect
          ref={shapeRef}
          className="cursor-follower__rect"
          x="1"
          y="1"
          width="36"
          height="36"
          rx="18"
          ry="18"
        />
      </svg>
    </>
  );
}
