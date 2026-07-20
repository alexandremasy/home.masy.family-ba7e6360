import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarDays, ListChecks, Sparkles } from "lucide-react";
import { SlidingTabs } from "@/components/sliding-tabs";

const meta = {
  title: "Navigation/Sliding Tabs",
  component: SlidingTabs,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  // Stories are controlled (useState in render); default args just satisfy the required
  // props so the render-only stories typecheck.
  args: { value: "", onValueChange: () => {}, options: [] },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SlidingTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoOptions: Story = {
  render: () => {
    const [value, setValue] = useState("plan");
    return (
      <SlidingTabs
        value={value}
        onValueChange={setValue}
        options={[
          { value: "plan", label: "Plan" },
          { value: "courses", label: "Courses" },
        ]}
      />
    );
  },
};

export const WithIcons: Story = {
  render: () => {
    const [value, setValue] = useState("calendrier");
    return (
      <SlidingTabs
        value={value}
        onValueChange={setValue}
        options={[
          { value: "calendrier", label: "Calendrier", icon: CalendarDays },
          { value: "courses", label: "Courses", icon: ListChecks },
          { value: "idees", label: "Idées", icon: Sparkles },
        ]}
      />
    );
  },
};
