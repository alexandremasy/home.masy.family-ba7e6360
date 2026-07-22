import type { Meta, StoryObj } from "@storybook/react-vite";
import { RoomTile } from "@/components/room-tile";

const meta = {
  title: "Tiles/RoomTile",
  component: RoomTile,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    to: "/room/salon",
    name: "Salon",
    icon: "sofa",
    temperature: 21.4,
    lightsOn: true,
    climate: { on: true, setpoint: 21 },
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RoomTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Lit: Story = {};

export const Dark: Story = {
  args: { lightsOn: false, climate: { on: false, setpoint: 21 } },
};

/** No climate in this room — the second line carries the lights alone. */
export const NoClimate: Story = {
  args: { climate: undefined },
};

/** No sensor: the temperature slot stays open so the bento row keeps its rhythm. */
export const NoSensor: Story = {
  args: { temperature: undefined },
};
