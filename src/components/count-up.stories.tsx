import type { Meta, StoryObj } from "@storybook/react-vite";
import { CountUp } from "@/components/count-up";

/**
 * Eases towards `to` once the element scrolls into view (IntersectionObserver at
 * 0.3). In Storybook it is visible on load, so the animation runs immediately.
 */
const meta = {
  title: "Information/Count Up",
  component: CountUp,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { className: "font-serif text-4xl font-semibold tabular-nums" },
} satisfies Meta<typeof CountUp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { to: 1234 },
};

export const Decimals: Story = {
  args: { to: 9.3, decimals: 1 },
};

/** Thousands grouping (fr-BE) — opt-in via `group`. */
export const Grouped: Story = {
  args: { to: 48230, group: true },
};

export const WithPrefixSuffix: Story = {
  args: { to: 42.6, decimals: 2, prefix: "€ ", suffix: " / mois" },
};
