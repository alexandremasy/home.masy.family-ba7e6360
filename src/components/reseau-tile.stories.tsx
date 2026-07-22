import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReseauTile } from "@/components/reseau-tile";

const meta = {
  title: "Tiles/ReseauTile",
  component: ReseauTile,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    to: "/securite/reseau",
    downMbps: 472,
    upMbps: 38,
    pingMs: 11,
    testedWhen: "il y a 2h",
    clients: 20,
    cpuPct: 28,
    uptimeDays: 47,
  },
  decorators: [
    (Story) => (
      <div className="h-48 w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReseauTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stable: Story = {};

/** A bad line: the dial barely fills and the badge warns instead of reassuring. */
export const Degraded: Story = {
  args: { stable: false, downMbps: 42, upMbps: 3, pingMs: 180 },
};

/** A gigabit line — same tile, a different ceiling. */
export const Gigabit: Story = {
  args: { maxMbps: 1000, downMbps: 940, upMbps: 720, pingMs: 4 },
};
