import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";

const meta = {
  title: "Forms/Select",
  component: Select,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Choisir un repas" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Semaine</SelectLabel>
          <SelectItem value="lundi">Lundi</SelectItem>
          <SelectItem value="mardi">Mardi</SelectItem>
          <SelectItem value="mercredi">Mercredi</SelectItem>
          <SelectItem value="jeudi" disabled>
            Jeudi (complet)
          </SelectItem>
          <SelectItem value="vendredi">Vendredi</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};
