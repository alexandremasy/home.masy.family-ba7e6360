import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./separator";

const meta = {
  title: "Layout/Separator",
  component: Separator,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "radio", options: ["horizontal", "vertical"] },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: (args) => (
    <div className="w-64">
      <p className="text-sm font-semibold">Foyer</p>
      <Separator {...args} className="my-3" />
      <p className="text-sm text-muted-foreground">Repas, courses et anniversaires.</p>
    </div>
  ),
  args: { orientation: "horizontal" },
};

export const Vertical: Story = {
  render: (args) => (
    <div className="flex h-6 items-center gap-3 text-sm">
      <span>Repas</span>
      <Separator {...args} />
      <span>Courses</span>
      <Separator {...args} />
      <span>Budget</span>
    </div>
  ),
  args: { orientation: "vertical" },
};
