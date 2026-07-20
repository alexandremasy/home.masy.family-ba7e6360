import type { Meta, StoryObj } from "@storybook/react-vite";
import { BudgetBar } from "@/components/budget-bar";

const meta = {
  title: "Information/Budget Bar",
  component: BudgetBar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BudgetBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 62 },
};

export const Low: Story = {
  args: { value: 18 },
};

export const Full: Story = {
  args: { value: 100 },
};

/** Committed-but-not-spent is drawn behind the spent segment. */
export const WithProjected: Story = {
  args: { value: 55, projected: 80 },
};

/** Over budget: the indicator turns warm and a spill segment extends past 100%. */
export const Overflow: Story = {
  args: { value: 100, overflow: 25 },
};
