import type { Meta, StoryObj } from "@storybook/react-vite";
import { SalonTile } from "@/components/salon-tile";

const meta = {
  title: "Tiles/SalonTile",
  component: SalonTile,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    to: "/room/salon",
    name: "Salon",
    icon: "sofa",
    lightsOn: true,
    source: "spotify",
    media: "Linked · Bonobo",
    playing: true,
  },
  decorators: [
    (Story) => (
      <div className="h-40 w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SalonTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Spotify: Story = {};

export const Netflix: Story = {
  args: { source: "netflix", media: "Dark · S2E4" },
};

/** Nothing playing: the room takes its own icon back and the equaliser stops. */
export const Idle: Story = {
  args: { source: "none", media: "Chromecast en veille", playing: false, lightsOn: false },
};
