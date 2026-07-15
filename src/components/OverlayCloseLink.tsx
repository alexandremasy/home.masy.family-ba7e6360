import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The pill that closes an overlay, floating above it.
 *
 * Not a <Button>: closing an overlay is a navigation, not an action — the target
 * route IS the "closed" state. It was duplicated character for character between
 * the room overlay and the réserve one, the second even admitting it in a
 * comment.
 */
export function OverlayCloseLink({ to, className }: { to: string; className?: string }) {
  return (
    <Link
      to={to}
      aria-label="Fermer"
      className={cn(
        "fixed left-1/2 top-4 z-30 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full",
        "bg-secondary text-foreground/70 shadow-soft transition-colors",
        "hover:bg-secondary/80 hover:text-foreground",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:top-6",
        className,
      )}
    >
      <X className="h-4 w-4" />
    </Link>
  );
}
