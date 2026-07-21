import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * shadcn's Alert, re-tokenised to this app's palette and named for what it is: a
 * banner sitting in the flow of a page, not a modal (that is `AlertDialog`).
 *
 * shadcn ships `default` + `destructive`; here the meaningful pair is `default`
 * (a neutral note) and `warn` (the terracotta alert tone — see
 * [[palette-semantics]]). `destructive` stays for genuine errors. The icon sits
 * in a grid gutter so multi-line copy hangs under the text, not under the icon.
 *
 * `role="alert"` stays: the ARIA role is about how it is announced, not what the
 * component is called.
 */
const bannerVariants = cva(
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

function Banner({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof bannerVariants>) {
  return <div role="alert" className={cn(bannerVariants({ variant }), className)} {...props} />;
}

function BannerTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("col-start-2 line-clamp-1 min-h-4 font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function BannerDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("col-start-2 text-muted-foreground [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}

export { Banner, BannerTitle, BannerDescription };
