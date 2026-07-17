import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import { useIsMobile } from "@/lib/use-media";

// Below sm the overlay is a bottom drawer — this wraps its surface and owns the
// drag-to-dismiss gesture (Stripe-style). Dragging past a threshold closes;
// anything short snaps back. It exposes its handlers via context so a route can
// make its whole header a drag zone (not just the small grabber).
//
// The gesture writes the transform straight to the DOM (via a ref), never through
// React state — a setState per pointermove would re-render the whole drawer on
// every frame and make the drag stutter on a phone. Handlers are memoised so the
// context stays stable and consumers don't re-render mid-drag.
const CLOSE_THRESHOLD = 110;
const SNAP = "transform 0.35s cubic-bezier(0.16, 0.84, 0.24, 1)";

type DragHandlers = {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
};

const DrawerDragContext = createContext<{ handlers: DragHandlers | null }>({ handlers: null });

/** Handlers to spread on any element that should drag the drawer down (or null). */
export function useDrawerDrag() {
  return useContext(DrawerDragContext);
}

export function MobileDrawerPanel({
  children,
  onClose,
  showHandle = true,
}: {
  children: React.ReactNode;
  onClose: () => void;
  /** Hide the panel's own grabber when the route provides its own (in a sticky header). */
  showHandle?: boolean;
}) {
  const isMobile = useIsMobile();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const dragY = useRef(0);
  const active = useRef(false);

  const paint = useCallback((y: number, transition: string) => {
    const el = surfaceRef.current;
    if (!el) return;
    el.style.transition = transition;
    el.style.transform = `translateY(${y}px)`;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isMobile) return;
      // A draggable header still holds real controls (the on/off toggle): let taps
      // on them through instead of starting a drag.
      if (
        (e.target as Element).closest(
          "button, a, input, select, textarea, [role='switch'], [data-no-drag]",
        )
      ) {
        return;
      }
      startY.current = e.clientY;
      dragY.current = 0;
      active.current = true;
      paint(0, "none");
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    [isMobile, paint],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!active.current) return;
      const dy = Math.max(0, e.clientY - startY.current);
      dragY.current = dy;
      paint(dy, "none");
    },
    [paint],
  );

  const end = useCallback(() => {
    if (!active.current) return;
    active.current = false;
    if (dragY.current > CLOSE_THRESHOLD) {
      // Hand off to the CSS exit animation (data-state=closed): it slides the
      // panel out from under the finger's offset, so the close is one continuous
      // motion and behaves the same however the sheet is dismissed.
      onClose();
    } else {
      paint(0, SNAP);
    }
  }, [onClose, paint]);

  const handlers = useMemo<DragHandlers | null>(
    () =>
      isMobile ? { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end } : null,
    [isMobile, onPointerDown, onPointerMove, end],
  );

  return (
    <DrawerDragContext.Provider value={{ handlers }}>
      <div
        ref={surfaceRef}
        className="relative flex max-h-[85dvh] flex-col overflow-y-auto overscroll-contain rounded-t-3xl border border-border/60 bg-background shadow-lift [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-h-none sm:overflow-clip sm:rounded-3xl"
      >
        {/* Grabber — the affordance; the header below is draggable too. Hidden when
            the route carries its own handle inside a sticky header. */}
        {showHandle && (
          <div
            {...(handlers ?? {})}
            className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-3 active:cursor-grabbing sm:hidden"
          >
            <div className="h-1.5 w-11 rounded-full bg-muted-foreground/30" />
          </div>
        )}
        {children}
      </div>
    </DrawerDragContext.Provider>
  );
}
