import { useEffect, useRef } from "react";

/**
 * Full-viewport animated purple→blue mesh, Stripe-style: three blurred blobs
 * drift slowly, and the whole thing shifts hue as the page scrolls.
 *
 * Mounted inside the isolated SidebarInset so it paints above the page
 * background but behind the content (see `.living-gradient` in styles.css).
 * The scroll listener writes a 0→1 progress into `--lg-scroll`, which the CSS
 * turns into a hue-rotate. Decorative and off-palette by request.
 */
export function LivingGradient() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.setProperty("--lg-scroll", String(p));
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
  }, []);

  return (
    <div ref={ref} aria-hidden className="living-gradient">
      <span className="living-gradient__blob living-gradient__blob--purple" />
      <span className="living-gradient__blob living-gradient__blob--violet" />
      <span className="living-gradient__blob living-gradient__blob--blue" />
    </div>
  );
}
