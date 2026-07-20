import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

const meta = {
  title: "Forms/Toggle Group",
  component: ToggleGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  // Render-only stories compose their own ToggleGroup; default args satisfy the required
  // `type` on the props union.
  args: { type: "single" },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="left" variant="outline">
      <ToggleGroupItem value="left" aria-label="Aligner a gauche">
        <AlignLeft className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Centrer">
        <AlignCenter className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Aligner a droite">
        <AlignRight className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Multiple: Story = {
  render: () => (
    <ToggleGroup type="multiple" defaultValue={["repas"]}>
      <ToggleGroupItem value="repas">Repas</ToggleGroupItem>
      <ToggleGroupItem value="courses">Courses</ToggleGroupItem>
      <ToggleGroupItem value="budget">Budget</ToggleGroupItem>
    </ToggleGroup>
  ),
};
