import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { cn } from "@/lib/utils";

// Lucide's check sits low in its 24-box, so at this size it reads off-centre.
// These two glyphs are drawn on a 12-box whose stroke bounds are centred on (6,6).
const strokeProps = {
  viewBox: "0 0 12 12",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.25,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

// Same grammar as Button: the box is the `outline` button (bordered, no shadow) and
// walks the same hover -> active ramp. Selecting never fills the box with a slab of
// ink — in either theme the glyph and the border are what light up.
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "group/checkbox grid place-content-center peer size-[18px] shrink-0 rounded-[5px] border border-input bg-background cursor-pointer transition-[color,background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
      // Empty box: hover fills with --accent, pressing steps down to --input.
      "data-[state=unchecked]:hover:bg-accent data-[state=unchecked]:active:bg-input",
      // Selected: a tinted surface, a firmer border, the glyph in ink.
      "data-[state=checked]:bg-accent data-[state=checked]:text-foreground data-[state=checked]:border-foreground/30",
      "data-[state=indeterminate]:bg-accent data-[state=indeterminate]:text-foreground data-[state=indeterminate]:border-foreground/30",
      "hover:data-[state=checked]:bg-input active:data-[state=checked]:bg-foreground/20",
      "hover:data-[state=indeterminate]:bg-input active:data-[state=indeterminate]:bg-foreground/20",
      // Dark carries the same shape; only the glyph eases off so it doesn't glare.
      "dark:data-[state=checked]:text-foreground/80 dark:data-[state=indeterminate]:text-foreground/80",
      // Same invalid state as Input — a required box left unticked.
      "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="grid place-content-center text-current">
      {/* Which glyph shows is driven by the root's data-state, so it works
          controlled or not. Radix only mounts the indicator when not unchecked. */}
      <svg {...strokeProps} className="size-2.5 hidden group-data-[state=checked]/checkbox:block">
        <path d="M2 6.2 4.8 8.8 10 3.2" />
      </svg>
      <svg
        {...strokeProps}
        className="size-2.5 hidden group-data-[state=indeterminate]/checkbox:block"
      >
        <path d="M2.4 6h7.2" />
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
