import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { MobileDrawerPanel } from "@/components/mobile-drawer-panel";
import { Card } from "@/components/card";
import { modalCard } from "@/components/modal-surface";
import { cn } from "@/lib/utils";

const WIDTH = { md: "md:max-w-2xl", lg: "md:max-w-5xl" } as const;

/**
 * The one sheet shell. Below md it's a bottom sheet (frosted MobileDrawerPanel
 * surface, drag-to-dismiss); at md and up a top-anchored panel. Route overlays and
 * in-page modals both render through this, so there is a single look, a single
 * drag handle, and one exit animation everywhere.
 *
 * Same anatomy as the card and the dialog — icon · title · subline · trailing, a body
 * that is a pure slot, and a footer the shell pins itself. Content passed as children
 * should never draw its own header or its own row of actions: that is what made the
 * person modal look hand-built next to every other surface.
 *
 * State (open/closing) is owned by the caller via useSheetClose — this component is
 * presentational so the route can still coordinate its dashboard blur off `closing`.
 * Pass a `title` for modals (renders the header); omit it for routes that bring
 * their own PageHeader inside the children.
 */
export function AppSheet({
  open,
  closing,
  onRequestClose,
  size = "md",
  title,
  subline,
  icon,
  trailing,
  footer,
  children,
}: {
  open: boolean;
  closing: boolean;
  onRequestClose: () => void;
  size?: "md" | "lg";
  /** Modal title — rendered as a PageHeader (with the drag grabber). Omit for routes,
      which bring their own PageHeader / custom header inside the children. */
  title?: string;
  /** Secondary line under the title. */
  subline?: string;
  /** Leading badge icon, left of the title. */
  icon?: ReactNode;
  /** Right end of the header row: a badge, a status — or a real control. */
  trailing?: ReactNode;
  /** The way out. Rendered under a rule, actions right-aligned, stacked on a phone. */
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) onRequestClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          className={cn(
            closing ? "overlay-leaving" : "overlay-enter",
            "fixed inset-0 z-40 overflow-hidden md:block md:overflow-y-auto md:overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
          aria-describedby={undefined}
        >
          {/* Backdrop — clicking it closes. The Content covers the viewport, so Radix's
              own outside-click can't fire; this element is the dismiss target. */}
          <button
            type="button"
            aria-label="Fermer"
            tabIndex={-1}
            onClick={onRequestClose}
            className="overlay-backdrop fixed inset-0 z-0 cursor-default md:bg-foreground/30 md:backdrop-blur-md"
          />

          <div
            className={cn(
              "overlay-panel relative z-10 w-full max-md:absolute max-md:inset-x-0 max-md:bottom-0 md:mx-auto md:mt-24 md:mb-8 md:w-full md:px-6",
              WIDTH[size],
            )}
          >
            {/* Desktop close affordance (mobile dismisses via drag / backdrop). It hangs
                above the panel and scrolls WITH it: anchored to the viewport it would
                slide down into the sticky header the moment the content scrolled. */}
            <button
              type="button"
              aria-label="Fermer"
              onClick={onRequestClose}
              className="absolute -top-12 left-1/2 z-30 hidden h-9 w-9 -translate-x-1/2 place-items-center rounded-full bg-secondary text-foreground/70 shadow-soft transition-colors hover:bg-secondary/80 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring md:grid"
            >
              <X className="h-4 w-4" />
            </button>

            <MobileDrawerPanel onClose={onRequestClose} showHandle={false} bare={!!title}>
              {title ? (
                // A modal IS a dialog: same Card, same `modalCard` surface — the muted
                // box, the raised sheet under header + body, the footer showing the
                // muted through. Anything else here would be a second grammar.
                <Card
                  variant="soft"
                  padding="md"
                  icon={icon}
                  title={
                    <DialogPrimitive.Title asChild>
                      <span>{title}</span>
                    </DialogPrimitive.Title>
                  }
                  subline={
                    subline ? (
                      <DialogPrimitive.Description asChild>
                        <span>{subline}</span>
                      </DialogPrimitive.Description>
                    ) : undefined
                  }
                  trailing={trailing}
                  footer={footer}
                  className={modalCard}
                >
                  {children}
                </Card>
              ) : (
                <>
                  {/* Routes bring their own header; Radix still needs something to announce. */}
                  <DialogPrimitive.Title className="sr-only">Détail</DialogPrimitive.Title>
                  <div className="px-5 pb-8 pt-4 md:px-8 md:py-10">{children}</div>
                </>
              )}
            </MobileDrawerPanel>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
