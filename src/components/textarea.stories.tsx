import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./textarea";
import { Label } from "./label";

const meta = {
  title: "Forms/Textarea",
  component: Textarea,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { placeholder: "Ajouter une note" },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Textarea {...args} className="w-72" />,
};

export const Disabled: Story = {
  render: (args) => <Textarea {...args} className="w-72" />,
  args: { disabled: true },
};

/** Same invalid state as `Input`, driven by `aria-invalid` — no separate prop. */
export const Invalid: Story = {
  render: (args) => (
    <div className="grid w-72 gap-2">
      <Label htmlFor="note-invalid">Note de recette</Label>
      <Textarea
        id="note-invalid"
        {...args}
        aria-invalid
        aria-describedby="note-invalid-error"
        defaultValue=""
      />
      <p id="note-invalid-error" className="text-xs text-destructive">
        La note ne peut pas être vide.
      </p>
    </div>
  ),
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-72 gap-2">
      <Label htmlFor="note">Note de recette</Label>
      <Textarea id="note" {...args} />
    </div>
  ),
};
