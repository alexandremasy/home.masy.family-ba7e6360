import type { Meta, StoryObj } from "@storybook/react-vite";
import { Flame, Snowflake, Sun } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

/**
 * One control, several segments: the items sit flush inside a single 2px border, separated
 * by a 1px gap, and in `single` mode the selection slides from one segment to the next.
 *
 * `ToggleGroupItem` is one segment. It takes Radix's item props — `value`, `disabled` —
 * plus `size`, which the group passes down through context. It carries no box of its own:
 * the group draws the border, the sliding block draws the selection.
 */
const meta = {
  title: "Forms/Toggle Group",
  component: ToggleGroup,
  subcomponents: { ToggleGroupItem },
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  // Render-only stories compose their own ToggleGroup; default args satisfy the required
  // `type` on the props union.
  args: { type: "single" },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One value among a few — the everyday case. */
export const Single: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="complet">
      <ToggleGroupItem value="léger" className="px-3">
        Léger
      </ToggleGroupItem>
      <ToggleGroupItem value="complet" className="px-3">
        Complet
      </ToggleGroupItem>
      <ToggleGroupItem value="copieux" className="px-3">
        Copieux
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

/**
 * Several segments on at once. There is no sliding block — nothing single to slide to — so
 * the selected segments take the ink directly, and the group's 1px gap keeps two selected
 * neighbours legible as two.
 */
export const Multiple: Story = {
  render: () => (
    <ToggleGroup type="multiple" defaultValue={["repas", "budget"]}>
      <ToggleGroupItem value="repas" className="px-3">
        Repas
      </ToggleGroupItem>
      <ToggleGroupItem value="courses" className="px-3">
        Courses
      </ToggleGroupItem>
      <ToggleGroupItem value="budget" className="px-3">
        Budget
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

/** Icons, with a label or alone. `size="sm"` on the group reaches every item. */
export const WithIcons: Story = {
  render: () => (
    <div className="grid gap-4">
      <ToggleGroup type="single" defaultValue="heat" className="w-72">
        <ToggleGroupItem value="heat" className="flex-1 gap-1.5">
          <Flame />
          Chaud
        </ToggleGroupItem>
        <ToggleGroupItem value="cool" className="flex-1 gap-1.5">
          <Snowflake />
          Froid
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" defaultValue="jour" size="sm">
        <ToggleGroupItem value="nuit" aria-label="Nuit">
          <Snowflake />
        </ToggleGroupItem>
        <ToggleGroupItem value="jour" aria-label="Jour">
          <Sun />
        </ToggleGroupItem>
        <ToggleGroupItem value="chauffe" aria-label="Chauffe">
          <Flame />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

/** A segment can be unavailable without the group losing its shape. */
export const DisabledItem: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="semaine">
      <ToggleGroupItem value="jour" className="px-3">
        Jour
      </ToggleGroupItem>
      <ToggleGroupItem value="semaine" className="px-3">
        Semaine
      </ToggleGroupItem>
      <ToggleGroupItem value="mois" className="px-3" disabled>
        Mois
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

/** Full width, segments spread evenly with `flex-1` — how a form field uses it. */
export const FullWidth: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="semaine" className="w-80">
      <ToggleGroupItem value="jour" className="flex-1">
        Jour
      </ToggleGroupItem>
      <ToggleGroupItem value="semaine" className="flex-1">
        Semaine
      </ToggleGroupItem>
      <ToggleGroupItem value="mois" className="flex-1">
        Mois
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};
