import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold cursor-pointer transition-[color,background-color,border-color,box-shadow,opacity] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // This app's primary action is inverted black, not the teal --primary.
        // It was hand-copied 9 times before this variant existed.
        // Pressing flattens the shadow — the button reads as pushed in.
        inverted:
          "bg-foreground text-background shadow hover:bg-foreground/90 active:bg-foreground/80 active:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/80 active:shadow-none",
        // The default: primary's metrics, bordered, no shadow.
        // --muted and --accent are the same grey in light, so pressing lands on --input
        // (one step darker) to stay visibly distinct from hover.
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-input active:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-input",
        // Reads as text, not as teal: it takes the body color and earns its underline on hover.
        link: "text-foreground underline-offset-4 hover:underline active:opacity-70",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        icon: "h-9 w-9",
        // The round icon button the nav uses everywhere — `icon` stays rounded-md.
        iconRound: "h-9 w-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Render as the single child instead of a `<button>` — a `<Link>`, typically. Icons are
   *  then the caller's business, since there is no room to inject them. */
  asChild?: boolean;
  /** Icon rendered before the label. */
  iconLeft?: React.ReactNode;
  /** Icon rendered after the label. `link` defaults to a right arrow; pass `null` to drop it. */
  iconRight?: React.ReactNode;
  /** Command in flight: dims the content, overlays a spinner, blocks clicks. */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      iconLeft,
      iconRight,
      loading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const classes = cn(
      buttonVariants({ variant, size, className }),
      // Loading is not "unavailable": it keeps full opacity and shows the spinner instead.
      loading && "relative cursor-wait disabled:opacity-100",
    );

    // asChild hands rendering to the caller's single child — no room to inject icons.
    if (asChild) {
      return (
        <Comp className={classes} ref={ref} disabled={disabled} {...props}>
          {children}
        </Comp>
      );
    }

    // A link reads as a forward move, so it carries the arrow unless told otherwise.
    const trailing =
      iconRight !== undefined ? iconRight : variant === "link" && !iconLeft ? <ArrowRight /> : null;

    return (
      <Comp
        className={classes}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        {...props}
      >
        {/* The content keeps its box so the button never resizes mid-command. */}
        <span
          className={cn(
            "inline-flex items-center gap-2",
            loading && "opacity-40 transition-opacity",
          )}
        >
          {iconLeft}
          {children}
          {trailing}
        </span>
        {loading && (
          <span className="pointer-events-none absolute inset-0 grid place-items-center rounded-[inherit]">
            <Loader2 className="animate-spin" />
          </span>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
