import type { Meta, StoryObj } from "@storybook/react-vite";
import type { WeatherCond } from "@/lib/mock-data";
import { WeatherIcon } from "@/components/weather-icon";

const conds: WeatherCond[] = ["sun", "cloud", "partly", "rain", "storm", "snow", "fog"];

const meta = {
  title: "Iconography/Weather Icon",
  component: WeatherIcon,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { className: "h-8 w-8 text-primary", animated: true, cond: "sun" },
} satisfies Meta<typeof WeatherIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every condition at once, each with its own motion. That is the whole set. */
export const AllConditions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      {conds.map((cond) => (
        <div key={cond} className="flex flex-col items-center gap-1">
          <WeatherIcon cond={cond} className="h-8 w-8 text-primary" />
          <span className="text-2xs text-muted-foreground">{cond}</span>
        </div>
      ))}
    </div>
  ),
};
