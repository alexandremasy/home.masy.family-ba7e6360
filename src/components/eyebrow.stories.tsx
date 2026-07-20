import type { Meta, StoryObj } from "@storybook/react-vite";
import { Eyebrow } from "@/components/eyebrow";

const meta = {
  title: "Information/Eyebrow",
  component: Eyebrow,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { children: "Cette semaine" },
} satisfies Meta<typeof Eyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { tone: "muted", size: "sm" },
};

export const Foreground: Story = {
  args: { tone: "foreground", size: "sm" },
};

export const SizeXs: Story = {
  args: { tone: "muted", size: "xs" },
};

/** `current` inherits its parent's color — shown here inside a primary surface. */
export const Current: Story = {
  args: { tone: "current" },
  decorators: [
    (Story) => (
      <div className="rounded-xl bg-primary p-6 text-primary-foreground">
        <Story />
      </div>
    ),
  ],
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-3">
      <Eyebrow tone="muted" size="sm">
        Muted · sm
      </Eyebrow>
      <Eyebrow tone="muted" size="xs">
        Muted · xs
      </Eyebrow>
      <Eyebrow tone="foreground" size="sm">
        Foreground · sm
      </Eyebrow>
    </div>
  ),
};
