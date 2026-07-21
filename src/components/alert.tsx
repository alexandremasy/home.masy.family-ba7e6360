import * as React from "react";
import * as AlertPrimitive from "@radix-ui/react-alert-dialog";

import { Card, type CardPadding, type CardTone } from "@/components/card";
import { modalActions, modalCard, modalCentered, modalOverlay } from "@/components/modal-surface";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/button";

/* ────────────────────────────────────────────────────────────────────────────
   An alert is the dialog with one thing removed and one thing required.

   Removed: the close button — an alert is answered, not dismissed, so the footer
   carries the only two ways out. Required: the footer, for the same reason.

   The banner that sits in the flow of a page is `Banner`; this is the modal that
   interrupts. The two used to be named the other way round.

   Everything else is the dialog: the same card, the same slots, the same muted
   box with the raised sheet under header + body (`modal-surface`). The body IS
   the message, which is why it doubles as the accessible description.
   ──────────────────────────────────────────────────────────────────────────── */

const Alert = AlertPrimitive.Root;

const AlertTrigger = AlertPrimitive.Trigger;

const AlertPortal = AlertPrimitive.Portal;

const AlertOverlay = React.forwardRef<
  React.ElementRef<typeof AlertPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertPrimitive.Overlay className={cn(modalOverlay, className)} {...props} ref={ref} />
));
AlertOverlay.displayName = AlertPrimitive.Overlay.displayName;

export interface AlertContentProps
  // `title` is widened from the DOM attribute (a string tooltip) to a node — the
  // header slot, as on the card.
  extends Omit<React.ComponentPropsWithoutRef<typeof AlertPrimitive.Content>, "title"> {
  /** The message. Doubles as the accessible description. */
  children?: React.ReactNode;
  /** The question being asked. Doubles as the accessible name, so it is required. */
  title: React.ReactNode;
  /** Rendered inside the 36px tinted circle, left of the title. */
  icon?: React.ReactNode;
  /** The two ways out. Required: an alert is answered, not dismissed. */
  footer: React.ReactNode;
  /** Colours the header ICON, not the dialog. `destructive` for a deletion. */
  tone?: CardTone;
  /** Inner spacing, per slot. */
  padding?: CardPadding;
}

const AlertContent = React.forwardRef<
  React.ElementRef<typeof AlertPrimitive.Content>,
  AlertContentProps
>(
  (
    { className, children, title, icon, footer, tone = "primary", padding = "md", ...props },
    ref,
  ) => (
    <AlertPortal>
      <AlertOverlay />
      <AlertPrimitive.Content ref={ref} className={cn(modalCentered, className)} {...props}>
        <Card
          variant="soft"
          tone={tone}
          padding={padding}
          icon={icon}
          // `asChild` so Radix labels the card's own heading instead of wrapping a
          // second one inside it.
          title={
            <AlertPrimitive.Title asChild>
              <span>{title}</span>
            </AlertPrimitive.Title>
          }
          footer={footer}
          className={modalCard}
        >
          <AlertPrimitive.Description asChild>
            <div className="text-sm text-muted-foreground">{children}</div>
          </AlertPrimitive.Description>
        </Card>
      </AlertPrimitive.Content>
    </AlertPortal>
  ),
);
AlertContent.displayName = AlertPrimitive.Content.displayName;

/** The footer's content: the two answers, right-aligned, stacked on a phone.
    `AlertConfirm` is Radix's Action — named for what it does, so it cannot be
    misread as the singular of `AlertActions`. */
const AlertActions = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(modalActions, className)} {...props} />
);
AlertActions.displayName = "AlertActions";

const AlertConfirm = React.forwardRef<
  React.ElementRef<typeof AlertPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertPrimitive.Action
    ref={ref}
    className={cn(buttonVariants({ variant: "inverted" }), className)}
    {...props}
  />
));
AlertConfirm.displayName = AlertPrimitive.Action.displayName;

const AlertCancel = React.forwardRef<
  React.ElementRef<typeof AlertPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), className)}
    {...props}
  />
));
AlertCancel.displayName = AlertPrimitive.Cancel.displayName;

export {
  Alert,
  AlertPortal,
  AlertOverlay,
  AlertTrigger,
  AlertContent,
  AlertActions,
  AlertConfirm,
  AlertCancel,
};
