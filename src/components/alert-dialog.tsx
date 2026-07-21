import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { Card, type CardPadding, type CardTone } from "@/components/card";
import { modalActions, modalCard, modalCentered, modalOverlay } from "@/components/modal-surface";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/button";

/* ────────────────────────────────────────────────────────────────────────────
   The alert dialog is the dialog with one thing removed and one thing required.

   Removed: the close button — an alert is answered, not dismissed, so the footer
   carries the only two ways out. Required: the footer, for the same reason.

   Everything else is the dialog: the same card, the same slots, the same muted
   box with the raised sheet under header + body (`modal-surface`). The body IS
   the message, which is why it doubles as the accessible description.
   ──────────────────────────────────────────────────────────────────────────── */

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay className={cn(modalOverlay, className)} {...props} ref={ref} />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

export interface AlertDialogContentProps
  // `title` is widened from the DOM attribute (a string tooltip) to a node — the
  // header slot, as on the card.
  extends Omit<React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>, "title"> {
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

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  AlertDialogContentProps
>(
  (
    { className, children, title, icon, footer, tone = "primary", padding = "md", ...props },
    ref,
  ) => (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content ref={ref} className={cn(modalCentered, className)} {...props}>
        <Card
          variant="soft"
          tone={tone}
          padding={padding}
          icon={icon}
          // `asChild` so Radix labels the card's own heading instead of wrapping a
          // second one inside it.
          title={
            <AlertDialogPrimitive.Title asChild>
              <span>{title}</span>
            </AlertDialogPrimitive.Title>
          }
          footer={footer}
          className={modalCard}
        >
          <AlertDialogPrimitive.Description asChild>
            <div className="text-sm text-muted-foreground">{children}</div>
          </AlertDialogPrimitive.Description>
        </Card>
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  ),
);
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

/** The footer's content: the two answers, right-aligned, stacked on a phone. */
const AlertDialogActions = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(modalActions, className)} {...props} />
);
AlertDialogActions.displayName = "AlertDialogActions";

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants({ variant: "inverted" }), className)}
    {...props}
  />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), className)}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogActions,
  AlertDialogAction,
  AlertDialogCancel,
};
