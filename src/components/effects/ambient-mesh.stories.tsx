import type { Meta, StoryObj } from "@storybook/react-vite";
import { AmbientMesh } from "./ambient-mesh";

/**
 * Blurred blobs drifting behind the page. It is the app's default background
 * atmosphere — `_app.tsx` mounts it `fixed` with `scrollHue` on every non
 * full-bleed view.
 *
 * The stage below is `relative`, so the mesh covers the frame rather than the
 * viewport. Every knob writes a CSS variable on `.fx-mesh`: drop a prop and the
 * default in `styles.css` takes over.
 */
const meta = {
  title: "Effects/Ambient Mesh",
  component: AmbientMesh,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    size: { control: "text" },
    blur: { control: "text" },
    opacity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    speed: { control: "text" },
    hueRange: { control: "text" },
    fixed: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="relative isolate grid h-[26rem] place-items-center overflow-hidden bg-background">
        <Story />
        <p className="relative max-w-sm text-center text-sm text-muted-foreground">
          Content sits above the mesh — the effect is `z-index: -1` inside its own stacking context.
        </p>
      </div>
    ),
  ],
} satisfies Meta<typeof AmbientMesh>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Exactly what the app runs, minus the viewport anchoring. */
export const Default: Story = {};

/** Tighter, sharper blobs — the mesh reads as three distinct lights. */
export const Defined: Story = {
  args: { size: "18rem", blur: "40px", opacity: 0.7, speed: "9s" },
};

/** Barely there: the atmosphere behind a dense, content-heavy page. */
export const Subtle: Story = {
  args: { opacity: 0.25, blur: "110px", speed: "26s" },
};

/** The palette is a prop, not a fork. Warm variant, same motion. */
export const WarmPalette: Story = {
  args: { colors: ["#f97316", "#e11d48", "#f59e0b"] },
};

/**
 * `scrollHue` writes scroll progress into `--fx-mesh-scroll`, which the CSS
 * turns into a hue-rotate up to `hueRange`. Open this one in a new tab and
 * scroll — the frame below is tall enough to move it.
 */
export const ScrollDrivenHue: Story = {
  args: { scrollHue: true, hueRange: "180deg" },
  decorators: [
    (Story) => (
      <div className="relative isolate h-[200vh] overflow-hidden bg-background p-8">
        <Story />
        <p className="sticky top-8 text-sm text-muted-foreground">
          Scroll the preview — the hue travels 180°.
        </p>
      </div>
    ),
  ],
};
