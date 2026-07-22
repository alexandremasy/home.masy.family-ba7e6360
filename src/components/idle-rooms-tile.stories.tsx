import type { Meta, StoryObj } from "@storybook/react-vite";
import { IdleRoomsTile } from "@/components/idle-rooms-tile";

const meta = {
  title: "Tiles/IdleRoomsTile",
  component: IdleRoomsTile,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    rooms: [
      { key: "chambre", to: "/room/chambre", name: "Chambre", icon: "bed", temperature: 19.2 },
      { key: "buanderie", to: "/room/buanderie", name: "Buanderie", icon: "washing-machine" },
    ],
  },
  decorators: [
    (Story) => (
      <div className="h-48 w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof IdleRoomsTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Two: Story = {};

/** A single quiet room still fills the cell rather than sitting half-height. */
export const One: Story = {
  args: {
    rooms: [{ key: "escalier", to: "/room/escalier", name: "Escalier", icon: "footprints" }],
  },
};
