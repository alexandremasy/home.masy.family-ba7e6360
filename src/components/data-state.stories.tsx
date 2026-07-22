import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from "@tanstack/react-router";
import { DataState } from "./data-state";

const meta = {
  title: "Information/DataState",
  component: DataState,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { label: "les plats" },
} satisfies Meta<typeof DataState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** On its way. A spinner, nothing more — the page is about to have content. */
export const Loading: Story = {
  args: { status: "loading" },
};

/**
 * The request failed. This is the one that matters: without it an unreachable api reads
 * as a slow one, or worse, as "you have no dishes".
 */
export const Error: Story = {
  args: { status: "error", onRetry: () => {} },
};

/** Loaded, and there is genuinely nothing. The affordance to create the first one goes in the slot. */
export const Empty: Story = {
  args: {
    status: "empty",
    children: (
      <Link
        to="/repas/plats/nouveau"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Ajouter un plat
      </Link>
    ),
  },
};

/** Both default lines can be replaced when a page needs to say something more specific. */
export const OwnCopy: Story = {
  args: {
    status: "empty",
    title: "Aucun repas cette semaine",
    description: "Le plan est vide du 20 juillet au 2 août.",
  },
};
