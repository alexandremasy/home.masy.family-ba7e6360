import type { Meta, StoryObj } from "@storybook/react-vite";
import { Zap } from "lucide-react";
import { Icon } from "@/components/icon";

/**
 * The stories behind `Iconography/Icon`. The page itself is `icon.mdx` — written by
 * hand because the inventory uses `IconGallery`, a doc block, which only renders
 * inside a docs page and throws in the canvas.
 */
const meta = {
  title: "Iconography/Icon",
  component: Icon,
  parameters: { layout: "centered" },
  argTypes: {
    as: { control: false },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
  },
  args: { as: Zap },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { size: "md" } };

/** The five steps, from the cramped row to the feature glyph. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-6">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Icon {...args} size={size} />
          <span className="text-2xs text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  ),
};
