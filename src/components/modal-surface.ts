import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────────
   What every modal surface shares.

   A modal is a card that floats over the page — dialog, alert dialog, drawer all
   render the same `Card` with the same slots. Only three things differ, and none
   of them is the surface: where the box sits, how it enters, and how it is
   dismissed. So the surface lives here once, and drift between the three is a
   file to edit rather than a thing that happens on its own.

   The one deviation from a card in a page: the fill. A card leaves its footer off
   the fill because the page carries it. A modal has no page under it, only the
   overlay — so the box carries `--muted` itself, the sheet (header + body) keeps
   the raised white of a card, and the footer shows the muted through.
   ──────────────────────────────────────────────────────────────────────────── */

/** The card inside any modal. Pair with `variant="soft"`. */
export const modalCard = cn(
  // `min-h-0` is what lets the body — rather than the page — take the overflow
  // once the box hits its max height.
  "min-h-0 bg-muted shadow-lg",
  // Only the body scrolls: the header keeps the title in view and the footer keeps
  // the actions reachable. Scoped to the modal's OWN body, so a card nested in the
  // content is left alone.
  "[&>[data-slot=sheet]>[data-slot=body]]:overflow-y-auto",
);

/** Centred box, capped so the close button hanging above it stays on screen. */
export const modalCentered = cn(
  "fixed left-[50%] top-[50%] z-50 flex max-h-[calc(100dvh-8rem)] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] flex-col duration-200 sm:w-[calc(100%-2rem)]",
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
);

/** The round close button hanging above the box. */
export const modalCloseButton =
  "absolute left-1/2 -top-12 z-30 grid h-9 w-9 -translate-x-1/2 cursor-pointer place-items-center rounded-full bg-secondary text-foreground/70 shadow-soft transition-colors hover:bg-secondary/80 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** The full-width overlay behind any modal. */
export const modalOverlay =
  "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";

/** Actions inside a footer: right-aligned, stacked on a phone. */
export const modalActions = "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end";
