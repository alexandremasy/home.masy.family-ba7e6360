import type { ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { UtensilsCrossed, Plus } from "lucide-react";
import { Button } from "@/components/button";
import { PageHeader } from "@/components/page-header";

const withRouter = (Story: ComponentType) => {
  const rootRoute = createRootRoute({ component: () => <Story /> });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  return <RouterProvider router={router} />;
};

/**
 * Sticky page header. It bleeds edge-to-edge via negative margins, so it needs a
 * padded, width-bounded container — the decorator supplies one. Stories run inside
 * a memory router because the surrounding shell relies on router context.
 */
const meta = {
  title: "Layout/Page Header",
  component: PageHeader,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    withRouter,
    // The header is translucent and its fade bleeds 32px below itself, so the stage
    // is the app background full-bleed (no card, no rounding) plus the bottom room
    // the fade needs. The padding MUST be the overlay shell's exact rungs — the
    // header's negative margins cancel them, and any mismatch (px-5 against
    // `md:-mx-8`) pushes it past the viewport and scrolls sideways.
    (Story) => (
      <div className="bg-background px-5 pt-7 pb-8 md:px-8 md:pt-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The full header: icon, title, subtitle and a trailing action. */
export const Default: Story = {
  args: {
    title: "Repas",
    subtitle: "10 jours planifiés, 4 créneaux libres",
    icon: <UtensilsCrossed className="h-5 w-5" />,
    trailing: <Button iconLeft={<Plus />}>Ajouter</Button>,
  },
};

/** Title alone — the minimum the header renders. */
export const TitleOnly: Story = {
  args: { title: "Repas" },
};

export const WithSubtitle: Story = {
  args: { title: "Repas", subtitle: "10 jours planifiés, 4 créneaux libres" },
};

export const WithIcon: Story = {
  args: {
    title: "Repas",
    subtitle: "Cuisine de la semaine",
    icon: <UtensilsCrossed className="h-5 w-5" />,
  },
};

export const WithTrailing: Story = {
  args: {
    title: "Plats",
    trailing: <Button iconLeft={<Plus />}>Ajouter</Button>,
  },
};
