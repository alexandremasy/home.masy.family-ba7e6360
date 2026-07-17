import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The small uppercase label above a title, a value or a section.
 *
 * It existed 133 times across 27 files with **seven** different tracking values
 * (0.04 → 0.22em) for one single role. The winning value is now `--tracking-eyebrow`
 * in styles.css, and this component is the only thing that should reach for it.
 *
 * shadcn has no opinion here: this is the app's own vocabulary, so it lives in
 * components/, not in ui/.
 */
export function Eyebrow({
  children, tone = "muted", size = "sm", className, as: As = "p",
}: {
  children: ReactNode;
  /** `muted` reads as a label; `foreground` when the eyebrow carries meaning of its own. */
  tone?: "muted" | "foreground" | "current";
  /** `xs` is for cramped boxes (calendar cells, cards); `sm` is the default. */
  size?: "xs" | "sm";
  className?: string;
  as?: "p" | "span" | "div" | "h2" | "h3";
}) {
  return (
    <As
      className={cn(
        "font-medium uppercase tracking-eyebrow",
        size === "xs" ? "text-2xs" : "text-xs",
        tone === "muted" && "text-muted-foreground",
        tone === "foreground" && "text-foreground",
        className,
      )}
    >
      {children}
    </As>
  );
}
