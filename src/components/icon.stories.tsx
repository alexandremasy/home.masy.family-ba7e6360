import type { Meta, StoryObj } from "@storybook/react-vite";
import { Zap } from "lucide-react";
import { Icon } from "@/components/icon";

/**
 * # Icon
 *
 * Every icon in the app is a [lucide](https://lucide.dev) glyph. This component
 * exists for one reason: to own the size.
 *
 * Before it, each site sized its icon by hand — **275 usages across seven sizes**,
 * one of them (`h-4.5`) not even on the system's scale.
 *
 * The glyph is passed as a **component**, not a name — `<Icon as={Zap} />`. A
 * `name="zap"` registry would pull the whole icon set into the bundle.
 *
 * The full list of glyphs in use lives in **Iconography → Inventory**.
 */
const meta = {
  title: "Iconography/Icon",
  component: Icon,
  tags: ["autodocs"],
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
