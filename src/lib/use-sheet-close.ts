import { useCallback, useEffect, useState } from "react";
import { useScrollLock } from "@/lib/use-scroll-lock";

// Matches the .overlay-leaving exit animation length in styles.css.
const EXIT_MS = 260;

/**
 * Drives a sheet close by hand (not Radix Presence): flips a `closing` flag so the
 * `.overlay-leaving` exit animation plays, then fires `onClosed` once it's done.
 * Shared by the route overlay (onClosed = navigate) and in-page modals
 * (onClosed = setOpen(false)) so every sheet opens and exits the same way. Locks
 * background scroll while open.
 */
export function useSheetClose({ open, onClosed }: { open: boolean; onClosed: () => void }) {
  const [closing, setClosing] = useState(false);
  // Reset whenever the sheet (re)opens or fully closes — never leave `closing` stuck.
  useEffect(() => setClosing(false), [open]);
  useScrollLock(open);

  const requestClose = useCallback(() => {
    setClosing(true);
    window.setTimeout(onClosed, EXIT_MS);
  }, [onClosed]);

  return { closing, requestClose };
}
