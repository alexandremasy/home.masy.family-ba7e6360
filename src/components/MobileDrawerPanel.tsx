import { useRef, useState } from "react";

// Below sm the overlay is a bottom drawer — this wraps its surface and adds the
// grabber + drag-to-dismiss gesture (Stripe-style). Dragging the handle past a
// threshold closes; anything short snaps back. Desktop keeps the static surface
// (the grabber is hidden and no pointer capture ever starts).
const CLOSE_THRESHOLD = 110;

export function MobileDrawerPanel({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragY(Math.max(0, e.clientY - startY.current));
  };
  const end = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragY > CLOSE_THRESHOLD) onClose();
    else setDragY(0);
  };

  return (
    <div
      className="relative flex max-h-[88vh] flex-col overflow-y-auto rounded-t-3xl border border-border/60 bg-background shadow-lift [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-h-none sm:overflow-clip sm:rounded-3xl"
      style={{
        transform: `translateY(${dragY}px)`,
        transition: dragging ? "none" : "transform 0.35s cubic-bezier(0.16, 0.84, 0.24, 1)",
      }}
    >
      {/* Grabber — the drag affordance; drag it down to dismiss. */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerCancel={end}
        className="flex shrink-0 cursor-grab touch-none justify-center pb-2 pt-3 active:cursor-grabbing sm:hidden"
      >
        <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
      </div>
      {children}
    </div>
  );
}
