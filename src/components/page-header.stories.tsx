import type { ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { UtensilsCrossed, Plus } from "lucide-react";
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
 * padded, width-bounded container — the decorator supplies one. The back link is
 * a router Link, so every story runs inside a memory router.
 */
const meta = {
  title: "Layout/Page Header",
  component: PageHeader,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    withRouter,
    (Story) => (
      <div className="px-5 pt-7" style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
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

export const WithAction: Story = {
  args: {
    title: "Plats",
    action: (
      <button className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
        <Plus className="h-4 w-4" />
        Ajouter
      </button>
    ),
  },
};

export const SmallSize: Story = {
  args: { title: "Salon", size: "sm", backLabel: "Maison" },
};

export const NoBack: Story = {
  args: { title: "Cockpit", back: null },
};
