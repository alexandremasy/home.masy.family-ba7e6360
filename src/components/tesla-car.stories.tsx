import type { Meta, StoryObj } from "@storybook/react-vite";
import { TeslaCar } from "@/components/tesla-car";

const meta = {
  title: "Illustration/TeslaCar",
  component: TeslaCar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { charging: false, locked: true, location: "Maison" },
} satisfies Meta<typeof TeslaCar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Parked: Story = {};

/** Current flowing — the charge port pulses. */
export const Charging: Story = {
  args: { charging: true },
};

export const Unlocked: Story = {
  args: { locked: false },
};

/** No place known: the footer keeps the lock badge alone. */
export const NoLocation: Story = {
  args: { location: null },
};
