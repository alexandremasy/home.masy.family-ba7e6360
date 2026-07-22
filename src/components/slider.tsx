import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

export interface SliderProps
  // Radix offers a vertical track, an inverted scale and an RTL direction. None is used
  // here — and `stops` lays its labels out horizontally, so a vertical slider would break
  // it. Dropping them keeps the documented surface to what this system actually supports.
  extends Omit<
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    "orientation" | "inverted" | "dir"
  > {
  /** Text under the left end of the track — what the low end means, not the number. */
  minLabel?: React.ReactNode;
  /** Text under the right end of the track. */
  maxLabel?: React.ReactNode;
  /**
   * Evenly spaced graduations drawn on the track, both ends included.
   * A count, not the step: `step={1}` over 0–100 would draw 101 unreadable marks.
   */
  ticks?: number;
  /**
   * Named positions, in order — the slider stops reading as a number and starts reading
   * as a scale: "pudique · nuancé · complice" rather than 0 · 50 · 100.
   *
   * It supersedes `ticks` (the count is the number of stops) and the two bound labels,
   * and it is what lets a preset be a *position* instead of a separate control: give the
   * scale its steps here, and a named preset is the combination of steps it selects.
   *
   * The caller still owns the numbers: set `max={stops.length - 1}` and `step={1}` so a
   * value indexes straight into this list.
   */
  stops?: string[];
  /** Bubble above the thumb: on pointer/keyboard interaction, or permanently. */
  showValue?: "interaction" | "always";
  /** Formats the bubble, e.g. `(v) => \`${v} %\``. Defaults to the raw number. */
  formatValue?: (value: number) => string;
}

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, minLabel, maxLabel, ticks, stops, showValue, formatValue, ...props }, ref) => {
    const min = props.min ?? 0;
    // Named stops ARE the graduations, so they set the count.
    const marks = stops?.length ?? ticks;

    // Radix needs one Thumb per value — a single hardcoded Thumb silently drops
    // the second handle of a range.
    const values = props.value ?? props.defaultValue ?? [min];
    const hasBounds = !stops && (minLabel !== undefined || maxLabel !== undefined);

    return (
      <div className="w-full">
        <SliderPrimitive.Root
          ref={ref}
          className={cn(
            "group/slider relative flex w-full touch-none select-none items-center",
            className,
          )}
          {...props}
        >
          {/* Ink, not teal — the filled part reads like the inverted button. In dark, --input
              is already a 24% white veil and the fill a near-white bar: both are eased off so
              the row doesn't glare, while the filled/empty gap stays readable. */}
          <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-input dark:bg-foreground/12">
            <SliderPrimitive.Range className="absolute h-full bg-foreground dark:bg-foreground/65" />
          </SliderPrimitive.Track>

          {/* Graduations sit above the track and never intercept the pointer. */}
          {marks && marks > 1 && (
            <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
              {Array.from({ length: marks }, (_, i) => (
                <span
                  key={i}
                  className="absolute h-2.5 w-px -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/25"
                  style={{ left: `${(i / (marks - 1)) * 100}%` }}
                />
              ))}
            </div>
          )}

          {values.map((value, i) => (
            <SliderPrimitive.Thumb
              key={i}
              className="group/thumb relative block size-4 rounded-full border border-foreground/30 bg-background shadow transition-[color,background-color,border-color,box-shadow] hover:border-foreground/60 active:bg-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
            >
              {showValue && (
                <span
                  className={cn(
                    // w-max + nowrap: the bubble sits inside a 16px thumb, so without them
                    // it inherits that width and "60 %" breaks across two lines.
                    "pointer-events-none absolute bottom-full left-1/2 mb-1.5 w-max -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-1.5 py-0.5 text-2xs font-semibold tabular-nums text-background transition-opacity",
                    showValue === "always"
                      ? "opacity-100"
                      : "opacity-0 group-hover/slider:opacity-100 group-focus-within/slider:opacity-100",
                  )}
                >
                  {formatValue ? formatValue(value) : value}
                </span>
              )}
            </SliderPrimitive.Thumb>
          ))}
        </SliderPrimitive.Root>

        {/* One label per stop. The ends align to the track's ends rather than centring,
            so the first and last never hang off the component. The current step is the
            only one at full strength — the scale reads at a glance. */}
        {stops && stops.length > 1 && (
          <div className="relative mt-1.5 h-4 text-2xs text-muted-foreground">
            {stops.map((label, i) => {
              const selected = values.includes(i);
              return (
                <span
                  key={label}
                  className={cn(
                    "absolute top-0 whitespace-nowrap transition-colors",
                    selected && "font-semibold text-foreground",
                  )}
                  style={{
                    left: `${(i / (stops.length - 1)) * 100}%`,
                    transform: `translateX(-${(i / (stops.length - 1)) * 100}%)`,
                  }}
                >
                  {label}
                </span>
              );
            })}
          </div>
        )}

        {hasBounds && (
          <div className="mt-1 flex justify-between text-2xs uppercase tracking-eyebrow text-muted-foreground">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
          </div>
        )}
      </div>
    );
  },
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
