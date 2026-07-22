import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider } from "./slider";
import { Label } from "./label";

const meta = {
  title: "Forms/Slider",
  component: Slider,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <Slider {...args} />
    </div>
  ),
  args: { defaultValue: [50], max: 100, step: 1 },
};

/** Two handles. One `Thumb` is rendered per value, so a range keeps both. */
export const Range: Story = {
  render: (args) => (
    <div className="w-72">
      <Slider {...args} />
    </div>
  ),
  args: { defaultValue: [25, 75], max: 100, step: 1 },
};

/**
 * The two ends carry meaning, not numbers — the pattern every tone slider in the
 * birthday studio uses.
 */
export const Bounds: Story = {
  render: (args) => (
    <div className="w-72">
      <Slider {...args} />
    </div>
  ),
  args: { defaultValue: [40], max: 100, step: 1, minLabel: "Sobre", maxLabel: "Tendre" },
};

/**
 * `ticks` is a count of graduations, not the step: `step={1}` over 0–100 would draw
 * 101 unreadable marks. Pair it with a step that lands on them.
 */
export const Ticks: Story = {
  render: (args) => (
    <div className="grid w-72 gap-8">
      <Slider {...args} ticks={5} step={25} />
      <Slider {...args} ticks={11} step={10} />
    </div>
  ),
  args: { defaultValue: [50], max: 100 },
};

/**
 * The bubble reads the current value. `interaction` reveals it on hover, focus or drag;
 * `always` pins it. `formatValue` carries the unit.
 */
export const ValueBubble: Story = {
  render: (args) => (
    <div className="grid w-72 gap-10">
      <Slider {...args} showValue="interaction" />
      <Slider {...args} showValue="always" formatValue={(v) => `${v} %`} />
      <Slider {...args} defaultValue={[18, 22]} showValue="always" formatValue={(v) => `${v}°C`} />
    </div>
  ),
  args: { defaultValue: [60], max: 100, step: 1 },
};

/** Everything at once — bounds, graduations and a formatted bubble on one control. */
export const Full: Story = {
  render: (args) => (
    <div className="w-72">
      <Slider {...args} />
    </div>
  ),
  args: {
    defaultValue: [60],
    max: 100,
    step: 20,
    ticks: 6,
    minLabel: "Bref",
    maxLabel: "Développé",
    showValue: "interaction",
    formatValue: (v: number) => `${v} %`,
  },
};

/**
 * Named positions instead of a number. This is what makes a preset a *place on the
 * scale* rather than a control of its own: the steps are named here, and "tendre" or
 * "taquin" is simply the combination of steps it selects across several sliders.
 */
export const NamedStops: Story = {
  render: () => (
    <div className="max-w-md space-y-8">
      <div className="space-y-2">
        <Label>Registre</Label>
        <Slider
          defaultValue={[2]}
          max={4}
          step={1}
          stops={["Pudique", "Retenu", "Nuancé", "Chaleureux", "Complice"]}
        />
      </div>
      <div className="space-y-2">
        <Label>Longueur</Label>
        <Slider
          defaultValue={[1]}
          max={3}
          step={1}
          stops={["Bref", "Court", "Développé", "Long"]}
        />
      </div>
    </div>
  ),
};
