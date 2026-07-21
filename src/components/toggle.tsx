import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  // Same ramp as Button: off walks accent -> input, on is ink (eased off in dark).
  // Bordered, no shadow — the `outline` button's box, and the only one a toggle gets.
  // There used to be a borderless variant too; a toggle that shows no box until you
  // press it does not read as pressable, so the box is now the component.
  "inline-flex items-center justify-center gap-2 rounded-md border border-input bg-transparent text-sm font-semibold cursor-pointer transition-[color,background-color,border-color,box-shadow] hover:bg-accent hover:text-accent-foreground active:bg-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=on]:bg-foreground data-[state=on]:text-background dark:data-[state=on]:bg-foreground/85 hover:data-[state=on]:bg-foreground/90 active:data-[state=on]:bg-foreground/80 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, size, ...props }, ref) => (
  <TogglePrimitive.Root ref={ref} className={cn(toggleVariants({ size, className }))} {...props} />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
