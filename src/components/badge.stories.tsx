import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge";

const meta = {
  title: "Information/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "muted", "destructive", "outline"],
    },
    shape: { control: "inline-radio", options: ["tag", "pill"] },
  },
  args: { children: "Badge" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { variant: "default" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const Outline: Story = { args: { variant: "outline" } };

export const Muted: Story = { args: { variant: "muted" } };

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Badge {...args} variant="default">
        Default
      </Badge>
      <Badge {...args} variant="secondary">
        Secondary
      </Badge>
      <Badge {...args} variant="muted">
        Muted
      </Badge>
      <Badge {...args} variant="destructive">
        Destructive
      </Badge>
      <Badge {...args} variant="outline">
        Outline
      </Badge>
    </div>
  ),
};

/**
 * The views hand-roll ~49 chips inline instead of using Badge — because Badge only
 * ever offered the `tag` shape, and ~34 of those usages are pills. Both shapes here.
 */
export const Shapes: Story = {
  render: (args) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge {...args} shape="pill" variant="secondary">
          pill · secondary (~19)
        </Badge>
        <Badge {...args} shape="pill" variant="muted">
          pill · muted (~12)
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Badge {...args} shape="tag" variant="secondary">
          tag · secondary (~12)
        </Badge>
        <Badge {...args} shape="tag" variant="muted">
          tag · muted
        </Badge>
      </div>
    </div>
  ),
};
