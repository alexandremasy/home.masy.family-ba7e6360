import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 1024px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * True at `lg` and up. Used to pick a shell (Dialog vs Drawer), not to style —
 * anything visual belongs in a Tailwind breakpoint.
 *
 * The server snapshot says "desktop". That is safe here because the only
 * consumer picks a shell for a CLOSED overlay: nothing renders either way on
 * first paint, so there is no hydration mismatch to see.
 */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => true,
  );
}
