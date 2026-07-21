import type { Meta, StoryObj } from "@storybook/react-vite";
import { AmbientGlow } from "./ambient-glow";

/**
 * A tinted wash anchored to the top edge of its box. It fills the band behind a
 * page title and fades downward, so there is never a seam where the effect ends.
 *
 * The Repas module uses it at its defaults. Position it yourself — the component
 * only paints, the caller places (`absolute inset-x-0 -top-6 -z-10 h-96`).
 */
const meta = {
  title: "Effects/Ambient Glow",
  component: AmbientGlow,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    color: { control: "text" },
    strength: { control: { type: "range", min: 0, max: 60, step: 1 } },
    x: { control: "text" },
    spread: { control: "text" },
    speed: { control: "text" },
    shift: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div className="relative isolate h-[26rem] overflow-hidden bg-muted">
        <Story />
        <div className="relative px-8 pt-16">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Module</p>
          <h2 className="mt-2 font-serif text-4xl">Repas</h2>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            The glow sits behind the title band and dies out before the content starts.
          </p>
        </div>
      </div>
    ),
  ],
  args: { className: "absolute inset-x-0 -top-6 -z-10 h-96" },
} satisfies Meta<typeof AmbientGlow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `--primary` at 26% — what the Repas module ships. */
export const Default: Story = {};

/** Pushed past ambient: the wash becomes a deliberate colour field. */
export const Intense: Story = {
  args: { strength: 45, spread: "160%" },
};

/** Off-token colour, for a module that owns its own hue. */
export const CustomColor: Story = {
  args: { color: "#7c3aed", strength: 32 },
};

/** Anchored right, narrow, and slow — a glow that hugs one corner. */
export const CornerAnchored: Story = {
  args: { x: "85%", spread: "90%", speed: "22s" },
};

/** Static by default under `prefers-reduced-motion`; here, motion is simply off. */
export const NoDrift: Story = {
  args: { speed: "0s", shift: "0deg" },
};
