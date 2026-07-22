import type { Meta, StoryObj } from "@storybook/react-vite";
import { PoubelleTile } from "@/components/poubelle-tile";

const meta = {
  title: "Tiles/PoubelleTile",
  component: PoubelleTile,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { type: "PMC", time: "7h" },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PoubelleTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Today: Story = {};

/** A long type truncates rather than pushing the pill open. */
export const LongType: Story = {
  args: { type: "Déchets ménagers", time: "6h30" },
};

/** Looking further ahead than today — the day replaces "Auj.". */
export const Tomorrow: Story = {
  args: { when: "Demain", type: "Papier-carton" },
};
