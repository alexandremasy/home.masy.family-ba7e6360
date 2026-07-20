import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell } from "lucide-react";
import { Button } from "./button";

// The design system's button. Beyond stock shadcn, this app adds the `inverted` variant
// (its real primary action — black, not teal) and the `iconRound` size (used across the nav).
const meta = {
  title: "Forms/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["inverted", "default", "secondary", "outline", "ghost", "destructive", "link"],
    },
    size: { control: "select", options: ["default", "sm", "lg", "icon", "iconRound"] },
  },
  args: { children: "Bouton" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// The real primary action.
export const Inverted: Story = { args: { variant: "inverted" } };
export const Default: Story = { args: { variant: "default" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const Link: Story = { args: { variant: "link" } };

export const IconRound: Story = {
  args: {
    size: "iconRound",
    variant: "inverted",
    "aria-label": "Notifications",
    children: <Bell className="h-4 w-4" />,
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="default">
        Default
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
  args: { variant: "inverted" },
};
