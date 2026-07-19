import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Room } from "@/lib/mock-data";
import { RoomIcon } from "@/components/RoomIcon";

const icons: Room["icon"][] = [
  "sofa",
  "briefcase",
  "utensils",
  "bed",
  "footprints",
  "washing-machine",
];

const meta = {
  title: "Components/RoomIcon",
  component: RoomIcon,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { className: "h-6 w-6 text-primary", icon: "sofa" },
} satisfies Meta<typeof RoomIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sofa: Story = { args: { icon: "sofa" } };
export const Briefcase: Story = { args: { icon: "briefcase" } };
export const Utensils: Story = { args: { icon: "utensils" } };
export const Bed: Story = { args: { icon: "bed" } };

export const AllIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      {icons.map((icon) => (
        <div key={icon} className="flex flex-col items-center gap-1">
          <RoomIcon icon={icon} className="h-6 w-6 text-primary" />
          <span className="text-2xs text-muted-foreground">{icon}</span>
        </div>
      ))}
    </div>
  ),
};
