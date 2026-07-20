import type { Meta, StoryObj } from "@storybook/react-vite";
import { Power } from "lucide-react";
import { CommandButton } from "@/components/command-button";

/**
 * Headless behaviour (no box of its own): it owns the pending / errored state of
 * a simulated Home Assistant round-trip. Click to see it — a random 350–1250 ms
 * latency shows the spinner overlay, and ~12 % of clicks fail, flashing the
 * destructive ring (and a toast). The states are runtime-only, so they can't be
 * frozen into a static story; interact with the button to observe them.
 */
const meta = {
  title: "Forms/Command Button",
  component: CommandButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof CommandButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    commandLabel: "Scène Travail",
    className:
      "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
    children: (
      <>
        <Power className="h-4 w-4" />
        Scène Travail
      </>
    ),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    className:
      "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground opacity-50",
    children: (
      <>
        <Power className="h-4 w-4" />
        Indisponible
      </>
    ),
  },
};

/** The small icon-tile shape used on the room pages (grid place-items-center). */
export const IconTile: Story = {
  args: {
    commandLabel: "Lumières",
    className: "grid h-11 w-11 place-items-center rounded-xl border border-border bg-card",
    children: <Power className="h-[18px] w-[18px]" />,
  },
};
