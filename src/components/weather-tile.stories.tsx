import type { Meta, StoryObj } from "@storybook/react-vite";
import { WeatherTile } from "@/components/weather-tile";

const meta = {
  title: "Tiles/WeatherTile",
  component: WeatherTile,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    today: {
      location: "Fumal",
      cond: "partly",
      label: "Éclaircies",
      tempC: 17,
      feelsC: 16,
      minC: 11,
      maxC: 19,
      rainMm: 1.2,
      rainProb: 35,
      windKmh: 14,
      humidity: 62,
      sunrise: "05:48",
      sunset: "21:24",
    },
    forecast: [
      { day: "Ven", cond: "sun", minC: 12, maxC: 21, rainProb: 5 },
      { day: "Sam", cond: "partly", minC: 13, maxC: 22, rainProb: 20 },
      { day: "Dim", cond: "rain", minC: 11, maxC: 17, rainProb: 80 },
      { day: "Lun", cond: "cloud", minC: 10, maxC: 16, rainProb: 40 },
      { day: "Mar", cond: "partly", minC: 11, maxC: 19, rainProb: 25 },
    ],
  },
  decorators: [
    (Story) => (
      <div className="h-40 w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WeatherTile>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click the tile: the detail and the five days ahead open in a dialog. */
export const Partly: Story = {};

export const Storm: Story = {
  args: {
    today: {
      location: "Fumal",
      cond: "storm",
      label: "Orages",
      tempC: 24,
      feelsC: 27,
      minC: 17,
      maxC: 28,
      rainMm: 18.4,
      rainProb: 90,
      windKmh: 46,
      humidity: 84,
      sunrise: "05:48",
      sunset: "21:24",
    },
  },
};
