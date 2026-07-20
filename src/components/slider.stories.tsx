import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider } from "./slider";

const meta = {
  title: "Forms/Slider",
  component: Slider,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <Slider {...args} />
    </div>
  ),
  args: { defaultValue: [50], max: 100, step: 1 },
};

export const Range: Story = {
  render: (args) => (
    <div className="w-72">
      <Slider {...args} />
    </div>
  ),
  args: { defaultValue: [25, 75], max: 100, step: 1 },
};
