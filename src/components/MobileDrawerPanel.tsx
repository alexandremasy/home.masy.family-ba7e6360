import { createContext, useContext, useRef, useState } from "react";
import { useIsMobile } from "@/lib/use-media";

// Below sm the overlay is a bottom drawer — this wraps its surface and owns the
// drag-to-dismiss gesture (Stripe-style). Dragging past a threshold closes;
// anything short snaps back. It exposes its handlers via context so a route can
// make its whole header a drag zone (not just the small grabber). Desktop keeps
// the static centred panel: on desktop `handlers` is null and nothing drags.
const CLOSE_THRESHOLD = 110;

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
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const active = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
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
    active.current = true;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!active.current) return;
    setDragY(Math.max(0, e.clientY - startY.current));
  };
  const end = () => {
    if (!active.current) return;
    active.current = false;
    setDragging(false);
    if (dragY > CLOSE_THRESHOLD) onClose();
    else setDragY(0);
  };

  const handlers: DragHandlers | null = isMobile
    ? { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end }
    : null;

  return (
    <DrawerDragContext.Provider value={{ handlers }}>
      <div
        className="relative flex max-h-[88vh] flex-col overflow-y-auto rounded-t-3xl border border-border/60 bg-background shadow-lift [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-h-none sm:overflow-clip sm:rounded-3xl"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragging ? "none" : "transform 0.35s cubic-bezier(0.16, 0.84, 0.24, 1)",
        }}
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
