import type { Meta, StoryObj } from "@storybook/react-vite";
import { TrendBadge } from "@/components/trend-badge";

const meta = {
  title: "Information/TrendBadge",
  component: TrendBadge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { trend: "down", pct: -11, suffix: "vs période préc." },
} satisfies Meta<typeof TrendBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Consumption went down — the good direction, so green. */
export const Down: Story = {};

export const Up: Story = {
  args: { trend: "up", pct: 8 },
};

/** Inside the dead-band the caller calls it stable, whatever the exact figure. */
export const Stable: Story = {
  args: { trend: "stable", pct: 2 },
};

/** No percentage: the arrow alone, for a tile that already shows the figure. */
export const ArrowOnly: Story = {
  args: { trend: "down", hidePct: true, suffix: undefined, size: "sm" },
};

export const AllDirections: Story = {
  render: () => (
    <div className="space-y-2">
      <TrendBadge trend="down" pct={-11} suffix="vs période préc." />
      <TrendBadge trend="stable" pct={1} suffix="vs période préc." />
      <TrendBadge trend="up" pct={8} suffix="vs période préc." />
      <TrendBadge trend="down" pct={-11} size="sm" />
    </div>
  ),
};
