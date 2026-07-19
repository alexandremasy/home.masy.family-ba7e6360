import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "UI/Input",
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

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-64 gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" {...args} placeholder="foyer@masy.family" />
    </div>
  ),
};
