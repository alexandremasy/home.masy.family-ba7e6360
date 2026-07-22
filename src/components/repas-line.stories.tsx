import type { Meta, StoryObj } from "@storybook/react-vite";
import { RepasLine } from "@/components/repas-line";

const meta = {
  title: "Tiles/RepasLine",
  component: RepasLine,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    to: "/repas",
    dateLabel: "mercredi 22 juillet",
    midi: "Salade de pâtes au thon",
    soir: "Soupe de potiron",
  },
} satisfies Meta<typeof RepasLine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BothMeals: Story = {};

/** Only one slot planned — the other line simply does not exist. */
export const EveningOnly: Story = {
  args: { midi: undefined },
};

/** Nothing planned yet: the day still shows, the menu says so plainly. */
export const Empty: Story = {
  args: { midi: undefined, soir: undefined },
};
