import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sun, Utensils } from "lucide-react";
import { DishCard, StatusPill } from "@/components/dish-card";
import { dishes } from "@/lib/maison-data";

// A dish rich in attributes (complet, chaud, emportable, long, couvre 2 repas).
const richDish = dishes.find((d) => d.id === "poulet-moutarde-gratin") ?? dishes[0];
// A long-named dish, good for the compact line-clamp.
const saladeDish = dishes.find((d) => d.id === "salade-poulet-avocat") ?? dishes[0];

/**
 * `DishCard` renders the BODY only — each caller owns the shell — so the
 * decorator wraps it in a representative card box.
 */
const meta = {
  title: "Information/Dish Card",
  component: DishCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div
        className="rounded-md border border-border/60 bg-card p-4 shadow-soft"
        style={{ width: 360 }}
      >
        <Story />
      </div>
    ),
  ],
  args: { dish: richDish },
} satisfies Meta<typeof DishCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Full: Story = {
  args: { variant: "full" },
};

export const Compact: Story = {
  args: { dish: saladeDish, variant: "compact" },
};

export const WithStatusPill: Story = {
  args: {
    variant: "full",
    status: <StatusPill tone="primary">à écouler · 2×</StatusPill>,
  },
};

export const WithActions: Story = {
  args: {
    variant: "full",
    actions: (
      <button className="ml-auto text-2xs font-medium text-muted-foreground hover:text-foreground">
        Remplacer
      </button>
    ),
  },
};

export const WithLeadingAndFooter: Story = {
  args: {
    variant: "full",
    leading: <Sun className="h-4 w-4 text-mustard" />,
    footer: <p className="mt-3 text-2xs text-muted-foreground">Dernier servi il y a 3 semaines</p>,
  },
};

// ── StatusPill (exported from the same module) ────────────────────────────────
type PillStory = StoryObj<typeof StatusPill>;

export const PillPrimary: PillStory = {
  render: () => <StatusPill tone="primary">à écouler</StatusPill>,
};

export const PillMuted: PillStory = {
  render: () => <StatusPill tone="muted">batch</StatusPill>,
};

export const PillIconOnly: PillStory = {
  render: () => <StatusPill tone="muted" icon={<Utensils className="h-3 w-3" />} title="Midi" />,
};
