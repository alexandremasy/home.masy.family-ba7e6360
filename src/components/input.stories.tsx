import type { Meta, StoryObj } from "@storybook/react-vite";
import { Search } from "lucide-react";
import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "Forms/Input",
  component: Input,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { placeholder: "Saisir un texte" },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };

export const Password: Story = { args: { type: "password", placeholder: "Mot de passe" } };

/**
 * Every input type the product actually uses. The box is identical across all of them —
 * only the native control inside changes (picker, spinner, file button).
 */
export const Types: Story = {
  render: (args) => (
    <div className="grid w-72 gap-3">
      {(
        [
          ["text", "Un texte libre"],
          ["search", "Chercher…"],
          ["email", "foyer@masy.family"],
          ["password", "Mot de passe"],
          ["number", "0"],
          ["tel", "+32 470 00 00 00"],
          ["url", "https://masy.family"],
          ["date", ""],
          ["time", ""],
          ["file", ""],
        ] as const
      ).map(([type, placeholder]) => (
        <label key={type} className="grid gap-1">
          <span className="text-2xs text-muted-foreground">{type}</span>
          <Input {...args} type={type} placeholder={placeholder} />
        </label>
      ))}
    </div>
  ),
};

/** Two heights, matching the button's `default` and `sm`. */
export const Sizes: Story = {
  render: (args) => (
    <div className="grid w-64 gap-3">
      <Input {...args} size="default" placeholder="Default (h-9)" />
      <Input {...args} size="sm" placeholder="Small (h-8)" />
    </div>
  ),
};

/**
 * `aria-invalid` drives the whole look — no separate prop. The field keeps the destructive
 * border on hover and focus, because an invalid value stays invalid until it is fixed.
 */
export const Invalid: Story = {
  render: (args) => (
    <div className="grid w-64 gap-2">
      <Label htmlFor="name">Nom</Label>
      <Input {...args} id="name" aria-invalid aria-describedby="name-error" defaultValue="" />
      <p id="name-error" className="text-xs text-destructive">
        Le nom est requis.
      </p>
    </div>
  ),
};

/** An icon inside the field, and a trailing unit. Both are decorative — clicks go to the input. */
export const Affixes: Story = {
  render: (args) => (
    <div className="grid w-64 gap-3">
      <Input {...args} iconLeft={<Search />} placeholder="Chercher un plat…" />
      <Input {...args} type="number" suffix="kWh" placeholder="0" />
      <Input {...args} type="number" suffix="€" placeholder="0,00" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-64 gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" {...args} placeholder="foyer@masy.family" />
    </div>
  ),
};
