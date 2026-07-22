import type { Meta, StoryObj } from "@storybook/react-vite";
import { BernardTile } from "@/components/bernard-tile";

const meta = {
  title: "Tiles/BernardTile",
  component: BernardTile,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    to: "/tesla",
    charge: 74,
    rangeKm: 310,
    chargeLimit: 80,
    pluggedIn: true,
    state: "garage",
    location: "Maison",
    chargingLabel: "En charge",
    interior: 21,
    exterior: 14,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BernardTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Charging: Story = {};

/** Out and unplugged — the headline changes, the place carries the rest. */
export const Away: Story = {
  args: { pluggedIn: false, state: "driving", location: "Bruxelles · Place Flagey", charge: 46 },
};

/** Nearly empty: nothing shouts, the gauge just tells the truth. */
export const LowBattery: Story = {
  args: { charge: 12, rangeKm: 48, pluggedIn: false, state: "parked" },
};

/** The car has not reported: every figure reads "—" rather than a plausible zero. */
export const Unreachable: Story = {
  args: {
    charge: undefined,
    rangeKm: undefined,
    chargeLimit: undefined,
    interior: undefined,
    exterior: undefined,
    pluggedIn: false,
    state: "parked",
    location: "Position inconnue",
  },
};
