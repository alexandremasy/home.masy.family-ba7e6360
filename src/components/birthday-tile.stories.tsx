import type { Meta, StoryObj } from "@storybook/react-vite";
import { BirthdayTile } from "@/components/birthday-tile";

const meta = {
  title: "Tiles/BirthdayTile",
  component: BirthdayTile,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { to: "/anniversaires", name: "Louise", age: 9, days: 6 },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BirthdayTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Upcoming: Story = {};

/** Today — the cake comes forward and the countdown reads "Auj.". */
export const Today: Story = {
  args: { days: 0 },
};

export const Tomorrow: Story = {
  args: { days: 1 },
};
