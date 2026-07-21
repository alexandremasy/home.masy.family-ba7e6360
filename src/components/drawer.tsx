import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { Card, type CardPadding, type CardTone } from "@/components/card";
import { modalActions, modalCard, modalOverlay } from "@/components/modal-surface";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────────
   The drawer is the dialog, entered from the bottom.

   Same card, same slots, same muted box with the raised sheet under header + body
   (`modal-surface`) — a phone gets the same anatomy as a desktop, which is the
   whole point of the two being one component in every view that switches on
   viewport. What the drawer owns: the bottom anchoring, drag-to-dismiss (vaul),
   and the grabber in place of the close button.

   The box only rounds at the top, because the bottom is the edge of the screen.
   ──────────────────────────────────────────────────────────────────────────── */

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay ref={ref} className={cn(modalOverlay, className)} {...props} />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

export interface DrawerContentProps
  // `title` is widened from the DOM attribute (a string tooltip) to a node — the
  // header slot, as on the card.
  extends Omit<React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>, "title"> {
  /** The body. A pure slot. Scrolls on its own. */
  children?: React.ReactNode;
  /** Header title. Doubles as the accessible name, so it is required. */
  title: React.ReactNode;
  /** Rendered inside the 36px tinted circle, left of the title. */
  icon?: React.ReactNode;
  /** Secondary line under the title. Wired as the drawer's accessible description. */
  subline?: React.ReactNode;
  /** Right end of the header row: a count, a badge, a filter — or a real control. */
  action?: React.ReactNode;
  /** Sits off the sheet, on the muted. Where the actions go. */
  footer?: React.ReactNode;
  /** Colours the header ICON, not the drawer. */
  tone?: CardTone;
  /** Inner spacing, per slot. */
  padding?: CardPadding;
  /** Drop the body's horizontal padding, for edge-to-edge content such as a list. */
  bleed?: boolean;
}

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps
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
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto max-h-[92dvh] flex-col",
          className,
        )}
        {...props}
      >
        <Card
          variant="soft"
          tone={tone}
          padding={padding}
          bleed={bleed}
          icon={icon}
          // `asChild` so vaul labels/describes the card's own heading and subline
          // instead of wrapping a second one inside them.
          title={
            <DrawerPrimitive.Title asChild>
              <span>{title}</span>
            </DrawerPrimitive.Title>
          }
          subline={
            subline ? (
              <DrawerPrimitive.Description asChild>
                <span>{subline}</span>
              </DrawerPrimitive.Description>
            ) : undefined
          }
          action={action}
          footer={footer}
          className={cn(
            modalCard,
            // The bottom is the edge of the screen: no corners, no border, and the
            // sheet inside follows.
            "rounded-b-none border-b-0 [&>[data-slot=sheet]]:rounded-b-none",
            // Room for the grabber above the title.
            "[&>[data-slot=sheet]>[data-slot=header]]:pt-6",
          )}
        >
          {children}
        </Card>

        {/* The grabber. Absolute rather than a row of its own, so the header keeps
            the same rhythm as it has in a dialog. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-2.5 mx-auto h-1.5 w-12 rounded-full bg-border"
        />
      </DrawerPrimitive.Content>
    </DrawerPortal>
  ),
);
DrawerContent.displayName = "DrawerContent";

/** The footer's usual content: actions right-aligned, stacked on a phone. */
const DrawerActions = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(modalActions, className)} {...props} />
);
DrawerActions.displayName = "DrawerActions";

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerActions,
};
