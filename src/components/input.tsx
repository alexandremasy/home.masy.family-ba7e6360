import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  // Bordered surface, no shadow — same box as the `outline` button.
  "flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-base transition-[color,background-color,border-color,box-shadow] file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-foreground placeholder:text-muted-foreground hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 md:text-sm " +
    // Invalid is the field's own persistent state, so it owns border, hover and ring.
    "aria-invalid:border-destructive aria-invalid:hover:border-destructive aria-invalid:focus-visible:ring-destructive",
  {
    variants: {
      size: {
        default: "h-9",
        sm: "h-8 text-sm md:text-xs",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">, VariantProps<typeof inputVariants> {
  /** Icon rendered inside the field, on the left. The padding adjusts for it. */
  iconLeft?: React.ReactNode;
  /** Short trailing text — a unit such as `€` or `kWh`. Not interactive. */
  suffix?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, iconLeft, suffix, ...props }, ref) => {
    const field = (
      <input
        type={type}
        className={cn(inputVariants({ size }), iconLeft && "pl-8", suffix && "pr-10", className)}
        ref={ref}
        {...props}
      />
    );

    // No affix, no wrapper: the caller's width and margin classes keep landing on the input itself.
    if (!iconLeft && !suffix) return field;

    return (
      <div className="relative w-full">
        {iconLeft && (
          <span className="pointer-events-none absolute left-2.5 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground [&_svg]:size-3.5">
            {iconLeft}
          </span>
        )}
        {field}
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };
