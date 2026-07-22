import type { Meta, StoryObj } from "@storybook/react-vite";
import { TickGauge } from "@/components/tick-gauge";

const meta = {
  title: "Components/TickGauge",
  component: TickGauge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { value: 472, max: 500, className: "w-48 overflow-visible" },
} satisfies Meta<typeof TickGauge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Full: Story = {};

export const Half: Story = {
  args: { value: 250 },
};

/** Nothing to read — every tick stays short, the arc still holds its shape. */
export const Empty: Story = {
  args: { value: 0 },
};

/** Past the ceiling: the arc clamps rather than wrapping around. */
export const OverMax: Story = {
  args: { value: 720 },
};
