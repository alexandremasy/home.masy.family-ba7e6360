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

export const Sun: Story = { args: { cond: "sun" } };
export const Cloud: Story = { args: { cond: "cloud" } };
export const Partly: Story = { args: { cond: "partly" } };
export const Rain: Story = { args: { cond: "rain" } };
export const Storm: Story = { args: { cond: "storm" } };
export const Snow: Story = { args: { cond: "snow" } };
export const Fog: Story = { args: { cond: "fog" } };

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
