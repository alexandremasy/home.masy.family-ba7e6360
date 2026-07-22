import type { Meta, StoryObj } from "@storybook/react-vite";
import { EnergieTile } from "@/components/energie-tile";

const meta = {
  title: "Tiles/EnergieTile",
  component: EnergieTile,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    to: "/energie",
    saisieTo: "/energie/saisie",
    electricity: { value: "9,3 kWh/j", trend: "down", trendPct: -11, status: "normal" },
    water: { value: "0,32 m³/j", trend: "stable", trendPct: 1, status: "normal" },
    oil: { value: "62 %", sub: "~120 j", status: "normal" },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EnergieTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllWell: Story = {};

/** The tank is low: the line is flagged, the flame wriggles, the badge names it. */
export const OilLow: Story = {
  args: { oil: { value: "22 %", sub: "~48 j", status: "alert", low: true } },
};

/** More than one thing to look at — the badge names the first and counts the rest. */
export const SeveralAlerts: Story = {
  args: {
    electricity: { value: "18,7 kWh/j", trend: "up", trendPct: 34, status: "alert" },
    oil: { value: "22 %", sub: "~48 j", status: "alert", low: true },
  },
};

/** A reading is due: not a smaller summary, a different tile — it asks for something. */
export const ReadingDue: Story = {
  args: { due: true },
};
