"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { Card, type CardPadding, type CardTone } from "@/components/card";
import {
  modalActions,
  modalCard,
  modalCentered,
  modalCloseButton,
  modalOverlay,
} from "@/components/modal-surface";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────────
   A dialog is a card that floats over the page.

   Same anatomy, same grammar: a header of four slots (icon · title · subline ·
   action), a body that is a pure slot, a footer the component pins itself — and
   the rule under the header, the per-slot padding, the footer sitting inside the
   border but off the fill. All of it comes from `Card` itself rather than being
   restated here, so the modal cannot drift from the surface it borrows.

   The surface itself — the muted box, the raised sheet under header + body, the
   footer showing the muted through — is `modal-surface`, shared with the alert
   dialog and the drawer. What the dialog owns on top of it: the centering, the
   entrance, and the round close button hanging above the box.

   Header slots are props, as on the card — which is also why `DialogHeader` and
   `DialogTitle` are gone. The accessible title and description are wired inside
   from `title` / `subline`, so a dialog can no longer ship without them.
   ──────────────────────────────────────────────────────────────────────────── */

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} className={cn(modalOverlay, className)} {...props} />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export interface DialogContentProps
  // `title` is widened from the DOM attribute (a string tooltip) to a node — the
  // header slot, as on the card.
  extends Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, "title"> {
  /** The body. A pure slot — a form, a list, a chart, controls. Scrolls on its own. */
  children?: React.ReactNode;
  /** Header title. Doubles as the accessible name, so it is required. */
  title: React.ReactNode;
  /** Rendered inside the 36px tinted circle, left of the title. */
  icon?: React.ReactNode;
  /** Secondary line under the title. Wired as the dialog's accessible description. */
  subline?: React.ReactNode;
  /** Right end of the header row: a badge, a filter, tabs — or a real control. */
  action?: React.ReactNode;
  /** Sits inside the border but off the filled sheet. Where the actions go. */
  footer?: React.ReactNode;
  /** Colours the header ICON, not the dialog. */
  tone?: CardTone;
  /** Inner spacing, per slot. */
  padding?: CardPadding;
  /** Drop the body's horizontal padding, for edge-to-edge content such as a table. */
  bleed?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      className,
      children,
      title,
      icon,
      subline,
      action,
      footer,
      tone = "primary",
      padding = "md",
      bleed = false,
      ...props
    },
    ref,
  ) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        // The content element positions and animates; the card inside carries
        // the surface.
        className={cn(modalCentered, className)}
        {...props}
      >
        <Card
          variant="soft"
          tone={tone}
          padding={padding}
          bleed={bleed}
          icon={icon}
          // `asChild` so Radix labels/describes the card's own heading and subline
          // instead of wrapping a second one inside them.
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
          action={action}
          footer={footer}
          className={modalCard}
        >
          {children}
        </Card>

        <DialogPrimitive.Close className={modalCloseButton}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  ),
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

/** The footer's usual content: actions right-aligned, stacked on a phone. */
const DialogActions = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(modalActions, className)} {...props} />
);
DialogActions.displayName = "DialogActions";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogActions,
};
