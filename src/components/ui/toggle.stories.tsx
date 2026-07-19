import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bold } from "lucide-react";
import { Toggle } from "./toggle";

const meta = {
  title: "UI/Toggle",
  component: Toggle,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "outline"] },
    size: { control: "select", options: ["default", "sm", "lg"] },
  },
  args: { "aria-label": "Gras", children: <Bold className="h-4 w-4" /> },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { variant: "default" } };
export const Outline: Story = { args: { variant: "outline" } };
export const WithText: Story = {
  args: { variant: "outline", children: "Gras" },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Toggle {...args} size="sm" />
      <Toggle {...args} size="default" />
      <Toggle {...args} size="lg" />
    </div>
  ),
  args: { variant: "outline" },
};
