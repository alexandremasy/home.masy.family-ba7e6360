import type { Meta, StoryObj } from "@storybook/react-vite";
import { Lightbulb } from "lucide-react";
import { Toggle } from "./toggle";

/**
 * A single on/off control that keeps its box in both states — a light zone, a filter.
 * There is only one look: bordered, filling with ink once pressed. A borderless variant
 * used to exist; a toggle that shows no box until you press it does not read as pressable.
 *
 * For a choice among several values, use `ToggleGroup`. For a setting that applies
 * immediately and reads as on/off, use `Switch`.
 */
const meta = {
  title: "Forms/Toggle",
  component: Toggle,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["default", "sm"] },
  },
  args: { "aria-label": "Lampe du bureau", children: <Lightbulb /> },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const On: Story = { args: { pressed: true } };

export const Disabled: Story = { args: { disabled: true } };

export const WithText: Story = {
  args: {
    children: (
      <>
        <Lightbulb />
        Bureau
      </>
    ),
  },
};

/** Two heights, matching the button's `default` and `sm`. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Toggle {...args} size="sm" />
      <Toggle {...args} size="default" />
    </div>
  ),
};
