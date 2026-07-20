import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertTriangle, Car, Droplet, Flame, Lightbulb, Wifi, Zap } from "lucide-react";
import { Icon } from "@/components/icon";

/**
 * # Icon
 *
 * Every icon in the app is a [lucide](https://lucide.dev) glyph. This component
 * exists for one reason: to own the size.
 *
 * Before it, each site sized its icon by hand — **275 usages across seven sizes**
 * (124 × `h-4`, 75 × `h-3.5`, 53 × `h-3`, 11 × `h-2.5`, 9 × `h-6`, 9 × `h-5`, and
 * 7 × `h-4.5`, the last one not even on the system's scale). Same story as
 * `Eyebrow`, which collapsed seven tracking values into one.
 *
 * The glyph is passed as a **component**, not a name — `<Icon as={Zap} />`. A
 * `name="zap"` registry would pull the whole icon set into the bundle and need a
 * mapping table to maintain.
 *
 * The full list of glyphs in use lives in **Iconography → Inventory**.
 *
 * ## Accessibility
 *
 * An icon is hidden from screen readers by default, which is correct whenever a
 * label sits next to it. Pass `label` only when the icon carries the meaning alone.
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

/** Colour travels through `className`; the size never does. */
export const Colours: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Icon {...args} as={Zap} className="text-primary" />
      <Icon {...args} as={Droplet} className="text-primary" />
      <Icon {...args} as={Flame} className="text-warm" />
      <Icon {...args} as={Lightbulb} className="text-mustard" />
      <Icon {...args} as={Wifi} className="text-success" />
      <Icon {...args} as={AlertTriangle} className="text-destructive" />
    </div>
  ),
};

/**
 * With `label`, the icon is announced as an image. Without it, it is hidden — use
 * that whenever the text beside it already says what it means.
 */
export const Labelled: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3 text-sm">
      <span className="flex items-center gap-2">
        <Icon {...args} as={Car} />
        Bernard — le texte porte le sens, l'icône est masquée
      </span>
      <Icon {...args} as={Car} label="Voiture au garage" size="lg" />
    </div>
  ),
};
