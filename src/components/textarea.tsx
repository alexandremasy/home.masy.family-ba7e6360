import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Same box as Input: bordered, no shadow, ring on focus.
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base transition-[color,background-color,border-color,box-shadow] placeholder:text-muted-foreground hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          // Same invalid state as Input: the field keeps it through hover and focus.
          "aria-invalid:border-destructive aria-invalid:hover:border-destructive aria-invalid:focus-visible:ring-destructive",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
