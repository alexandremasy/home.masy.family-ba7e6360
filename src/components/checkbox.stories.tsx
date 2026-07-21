import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

// Follows the Button grammar: unchecked = the `outline` button, checked = `inverted`,
// with the same hover (--accent) / active (--input) ramp. No teal.
const meta = {
  title: "Forms/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

// Used by the transactions table's select-all header.
export const Indeterminate: Story = { args: { checked: "indeterminate" } };

export const Disabled: Story = { args: { disabled: true } };

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="courses" {...args} />
      <Label htmlFor="courses">Ajouter aux courses</Label>
    </div>
  ),
};

// Every state side by side. Hover and press are live — mouse over the row.
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-xs text-muted-foreground">
      {(
        [
          ["unchecked", {}],
          ["checked", { defaultChecked: true }],
          ["indeterminate", { checked: "indeterminate" as const }],
          ["disabled", { disabled: true }],
          ["disabled checked", { disabled: true, defaultChecked: true }],
        ] as const
      ).map(([label, props]) => (
        <div key={label} className="flex items-center gap-3">
          <span className="w-32">{label}</span>
          <Checkbox {...props} />
        </div>
      ))}
    </div>
  ),
};

/** Same invalid state as `Input`, driven by `aria-invalid` — a required box left unticked. */
export const Invalid: Story = {
  render: () => (
    <div className="grid gap-2">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox aria-invalid aria-describedby="cgu-error" />
        J'ai lu la fiche de la recette
      </label>
      <p id="cgu-error" className="text-xs text-destructive">
        Cette case est requise.
      </p>
    </div>
  ),
};
