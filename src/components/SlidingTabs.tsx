import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string; icon?: LucideIcon };

/**
 * A boxed segmented control (same look as the shadcn Tabs list) whose active
 * indicator slides horizontally between equal-width segments, rather than the
 * default instant swap. Segments are `flex-1`, so the indicator is positioned by
 * index in %, no DOM measuring needed.
 */
export function SlidingTabs({
  value,
  onValueChange,
  options,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  className?: string;
}) {
  const n = options.length;
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  return (
    <div
      className={cn(
        "relative flex w-full rounded-lg bg-muted p-1 text-muted-foreground",
        className,
      )}
    >
      {n > 0 && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-1 left-1 rounded-md bg-background shadow transition-transform duration-300 ease-out"
          style={{
            width: `calc((100% - 0.5rem) / ${n})`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
      )}
      {options.map((o) => {
        const Icon = o.icon;
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onValueChange(o.value)}
            className={cn(
              "relative z-10 flex flex-1 flex-col items-center justify-center gap-1 rounded-md py-2 text-sm font-semibold transition-colors",
              active ? "text-foreground" : "hover:text-foreground",
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
