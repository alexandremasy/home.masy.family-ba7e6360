import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, Download, Lightbulb, Plus } from "lucide-react";
import { Button } from "./button";

// The design system's button. Beyond stock shadcn, this app adds the `inverted` variant
// (its real primary action — black, not teal), the `iconRound` size (used across the nav),
// and `iconLeft` / `iconRight` slots. `outline` is the default; there is no teal button.
const meta = {
  title: "Forms/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["outline", "inverted", "ghost", "destructive", "link"],
    },
    size: { control: "select", options: ["default", "sm", "icon", "iconRound"] },
  },
  args: { children: "Bouton" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// The default.
export const Outline: Story = { args: { variant: "outline" } };
// The real primary action.
export const Inverted: Story = { args: { variant: "inverted" } };
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

// Any variant takes an icon on either side.
export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      <Button {...args} iconLeft={<Plus />}>
        Ajouter
      </Button>
      <Button {...args} iconRight={<Download />}>
        Exporter
      </Button>
      <Button {...args} variant="inverted" iconLeft={<Plus />}>
        Ajouter
      </Button>
    </div>
  ),
  args: { variant: "outline" },
};

// `link` carries the arrow on its own; `iconRight={null}` drops it.
export const LinkIcons: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      <Button {...args}>Tout voir</Button>
      <Button {...args} iconLeft={<Download />} iconRight={null}>
        Télécharger
      </Button>
      <Button {...args} iconRight={null}>
        Sans flèche
      </Button>
    </div>
  ),
  args: { variant: "link" },
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
    </div>
  ),
  args: { variant: "inverted" },
};

// Hover / active / focus / disabled, side by side per variant.
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["outline", "inverted", "ghost", "destructive", "link"] as const).map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <span className="w-24 text-xs text-muted-foreground">{variant}</span>
          <Button variant={variant}>Normal</Button>
          <Button variant={variant} disabled>
            Disabled
          </Button>
        </div>
      ))}
    </div>
  ),
};

/**
 * `loading` covers the whole round-trip: the content dims, a spinner takes the centre, and
 * the button stops accepting clicks without reading as disabled. Failure is not a button
 * state — it surfaces in the toast or in the object the command was supposed to change.
 */
export const Loading: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["outline", "inverted", "ghost", "destructive"] as const).map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <span className="w-24 text-xs text-muted-foreground">{variant}</span>
          <Button variant={variant} iconLeft={<Lightbulb />}>
            Idle
          </Button>
          <Button variant={variant} iconLeft={<Lightbulb />} loading>
            Loading
          </Button>
          <Button variant={variant} size="icon" loading aria-label="Chargement" />
        </div>
      ))}
    </div>
  ),
};
