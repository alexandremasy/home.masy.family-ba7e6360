"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & { sliding: boolean }
>({
  size: "default",
  sliding: false,
});

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, size, children, ...props }, ref) => {
  // One selection, one indicator. A `multiple` group can have several segments on at
  // once, so there is nothing for a single block to slide to.
  const sliding = props.type === "single";

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [indicator, setIndicator] = React.useState<{ left: number; width: number } | null>(null);

  // The indicator follows the selected item's real box, so segments do not have to be
  // equal-width and it works controlled or not. Measured, never assumed from an index.
  React.useLayoutEffect(() => {
    if (!sliding) return;
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      const active = root.querySelector<HTMLElement>('[data-state="on"]');
      setIndicator(active ? { left: active.offsetLeft, width: active.offsetWidth } : null);
    };

    measure();
    const states = new MutationObserver(measure);
    states.observe(root, { attributes: true, attributeFilter: ["data-state"], subtree: true });
    const resize = new ResizeObserver(measure);
    resize.observe(root);
    return () => {
      states.disconnect();
      resize.disconnect();
    };
  }, [sliding, children]);

  return (
    <ToggleGroupPrimitive.Root
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(
        // A toggle group is one control, whatever its type: the items sit flush inside a
        // single 2px border, so the row reads as one object instead of a handful of
        // buttons. The p-1 inset keeps the selection off the border.
        "relative flex items-center justify-center gap-px overflow-hidden rounded-md border-2 border-input p-1",
        className,
      )}
      {...props}
    >
      {/* The selected surface is this block, not the item, so the selection slides
          between segments instead of blinking from one to the next. */}
      {sliding && indicator && (
        <span
          aria-hidden
          // inset-y-1 matches the track's padding; offsetLeft already accounts for it.
          className="pointer-events-none absolute inset-y-1 left-0 rounded-sm bg-foreground transition-[transform,width] duration-300 ease-out dark:bg-foreground/85"
          style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }}
        />
      )}
      <ToggleGroupContext.Provider value={{ size, sliding }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
});

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({ size: context.size || size }),
        // The item drops its own box — the group draws the border. Segments are separated
        // by the group's 1px gap rather than a rule: two selected neighbours in a
        // `multiple` group stay legible as two, and nothing cuts the sliding block.
        "relative z-10 rounded-sm border-0",
        context.sliding
          ? // The sliding block is the selected surface, so the item only changes its text.
            "bg-transparent hover:bg-transparent active:bg-transparent data-[state=on]:bg-transparent data-[state=on]:text-background"
          : "data-[state=on]:text-background",
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
