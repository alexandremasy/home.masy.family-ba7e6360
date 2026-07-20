import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────────
   The icon. Every icon in the app is a lucide-react glyph, and until now every
   site sized it by hand: 124 × h-4, 75 × h-3.5, 53 × h-3, 11 × h-2.5, 9 × h-6,
   9 × h-5, and 7 × h-4.5 — a size that is not even on the system's scale.

   Same story as Eyebrow, which collapsed seven tracking values into one. This
   bounds the scale to five steps and owns them.

   The glyph is passed as a COMPONENT, not a name: `<Icon as={Zap} />` keeps
   lucide tree-shakeable, where a `name="zap"` registry would pull the whole set
   into the bundle and need a mapping table to maintain.
   ──────────────────────────────────────────────────────────────────────────── */

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Matches the type scale: 12 · 14 · 16 · 20 · 24. */
const sizeClasses: Record<IconSize, string> = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  xl: "h-6 w-6",
};

export function Icon({
  as: Glyph,
  size = "md",
  className,
}: {
  /** The lucide glyph itself — `import { Zap } from "lucide-react"`. */
  as: LucideIcon;
  /** `md` (16) is the default and covers most of the app. `xs` is for cramped rows. */
  size?: IconSize;
  /** Colour and spacing. The size is owned by `size` — don't pass `h-*`/`w-*` here. */
  className?: string;
}) {
  return <Glyph className={cn(sizeClasses[size], className)} aria-hidden="true" />;
}
