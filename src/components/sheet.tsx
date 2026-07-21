"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { Card, type CardPadding, type CardTone } from "@/components/card";
import { modalActions, modalCard, modalOverlay } from "@/components/modal-surface";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────────
   The sheet is the dialog entering from an edge.

   Two layers, on purpose:

   `SheetPanel` is the bare slide-over — portal, overlay, the panel that enters
   from `side`, the round close button hanging outside it. It carries no anatomy,
   which is what a navigation panel (the mobile sidebar) actually wants.

   `SheetContent` is that panel with the modal surface inside it: the same card,
   the same slots, the same muted box with the raised sheet under header + body
   (`modal-surface`) as the dialog and the drawer. This is the default — reach for
   `SheetPanel` only when the content genuinely is not a header/body/footer.

   Corners are flat here: the panel spans a full edge of the screen, so there is
   no outer corner for the box to round against.
   ──────────────────────────────────────────────────────────────────────────── */

type SheetSide = "top" | "right" | "bottom" | "left";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(modalOverlay, "bg-black/50", className)}
      {...props}
    />
  );
}

export interface SheetPanelProps extends React.ComponentProps<typeof SheetPrimitive.Content> {
  /** The edge it enters from. */
  side?: SheetSide;
  /**
   * Accessible name, rendered for screen readers only. For a panel whose content
   * brings its own visible heading — otherwise use `SheetContent`, which takes a
   * real `title` slot.
   */
  srTitle?: string;
  /** Accessible description, screen-reader only. Same reasoning as `srTitle`. */
  srDescription?: string;
}

/** The bare slide-over: no anatomy, no surface. Use `SheetContent` unless the
    content really is free-form (a navigation panel, a canvas). */
function SheetPanel({
  className,
  children,
  side = "right",
  srTitle,
  srDescription,
  ...props
}: SheetPanelProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto max-h-[92dvh]",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto max-h-[92dvh]",
          className,
        )}
        {...props}
      >
        {srTitle && <SheetPrimitive.Title className="sr-only">{srTitle}</SheetPrimitive.Title>}
        {srDescription && (
          <SheetPrimitive.Description className="sr-only">
            {srDescription}
          </SheetPrimitive.Description>
        )}
        {children}
        {/* Outside the panel, on the side that faces the content. */}
        <SheetPrimitive.Close
          className={cn(
            "bg-secondary text-foreground/70 shadow-soft focus-visible:ring-ring absolute z-30 grid h-9 w-9 cursor-pointer place-items-center rounded-full transition-colors hover:bg-secondary/80 hover:text-foreground focus:outline-none focus-visible:ring-2",
            side === "right" && "top-4 -left-12",
            side === "left" && "top-4 -right-12",
            side === "top" && "-bottom-12 left-1/2 -translate-x-1/2",
            side === "bottom" && "-top-12 left-1/2 -translate-x-1/2",
          )}
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

export interface SheetContentProps
  // `title` is widened from the DOM attribute (a string tooltip) to a node — the
  // header slot, as on the card.
  extends Omit<SheetPanelProps, "srTitle" | "srDescription" | "title"> {
  /** The body. A pure slot. Scrolls on its own. */
  children?: React.ReactNode;
  /** Header title. Doubles as the accessible name, so it is required. */
  title: React.ReactNode;
  /** Rendered inside the 36px tinted circle, left of the title. */
  icon?: React.ReactNode;
  /** Secondary line under the title. Wired as the sheet's accessible description. */
  subline?: React.ReactNode;
  /** Right end of the header row: a badge, a filter, a count — or a real control. */
  action?: React.ReactNode;
  /** Sits off the sheet, on the muted. Where the actions go. */
  footer?: React.ReactNode;
  /** Colours the header ICON, not the panel. */
  tone?: CardTone;
  /** Inner spacing, per slot. */
  padding?: CardPadding;
  /** Drop the body's horizontal padding, for edge-to-edge content such as a list. */
  bleed?: boolean;
}

function SheetContent({
  className,
  children,
  side = "right",
  title,
  icon,
  subline,
  action,
  footer,
  tone = "primary",
  padding = "md",
  bleed = false,
  ...props
}: SheetContentProps) {
  return (
    <SheetPanel side={side} className={className} {...props}>
      <Card
        variant="soft"
        tone={tone}
        padding={padding}
        bleed={bleed}
        icon={icon}
        // `asChild` so Radix labels/describes the card's own heading and subline
        // instead of wrapping a second one inside them.
        title={
          <SheetPrimitive.Title asChild>
            <span>{title}</span>
          </SheetPrimitive.Title>
        }
        subline={
          subline ? (
            <SheetPrimitive.Description asChild>
              <span>{subline}</span>
            </SheetPrimitive.Description>
          ) : undefined
        }
        action={action}
        footer={footer}
        className={cn(
          modalCard,
          // A full edge of the screen has no outer corner to round against, and
          // the border is the screen edge itself.
          "rounded-none border-0 [&>[data-slot=sheet]]:rounded-none",
        )}
      >
        {children}
      </Card>
    </SheetPanel>
  );
}

/** The footer's usual content: actions right-aligned, stacked on a phone. */
function SheetActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn(modalActions, className)} {...props} />;
}

export { Sheet, SheetTrigger, SheetClose, SheetPanel, SheetContent, SheetActions };
