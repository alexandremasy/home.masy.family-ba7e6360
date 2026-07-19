import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * shadcn's Alert, re-tokenised to this app's palette. shadcn ships `default` +
 * `destructive`; here the meaningful pair is `default` (a neutral note) and
 * `warn` (the terracotta alert tone — see [[palette-semantics]]). `destructive`
 * stays for genuine errors. The icon sits in a grid gutter so multi-line copy
 * hangs under the text, not under the icon.
 */
const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[1.25rem_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        warn: "border-warm/30 bg-warm/10 text-foreground [&>svg]:text-warm",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("col-start-2 line-clamp-1 min-h-4 font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("col-start-2 text-muted-foreground [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
