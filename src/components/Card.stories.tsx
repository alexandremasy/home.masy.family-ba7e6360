import type { ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { Tile, Panel, Section } from "@/components/Card";

/**
 * `Card` ships three roles: `Tile` (the dashboard grid cell), `Panel` (a plain
 * boxed section) and `Section` (a Panel with a title row). Stories cover each.
 */
const meta = {
  title: "Components/Card",
  component: Tile,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  // Default args satisfy Tile's required `children`, so the render-only showcase
  // stories below (which ignore args) typecheck without repeating it.
  args: { children: null },
  decorators: [
    (Story) => (
      <div className="grid grid-cols-4 gap-3 p-6" style={{ width: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tile>;

export default meta;
type Story = StoryObj<typeof meta>;

const withRouter = (Story: ComponentType) => {
  const rootRoute = createRootRoute({ component: () => <Story /> });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  return <RouterProvider router={router} />;
};

// ── Tile tones ──────────────────────────────────────────────────────────────
export const TileDefault: Story = {
  args: { tone: "default", children: "Default tile" },
};

export const TilePrimary: Story = {
  args: { tone: "primary", children: "Primary tile" },
};

export const TileWarm: Story = {
  args: { tone: "warm", children: "Warm tile" },
};

export const TileMustard: Story = {
  args: { tone: "mustard", children: "Mustard tile" },
};

export const TileDark: Story = {
  args: { tone: "dark", children: "Dark tile" },
};

export const AllTones: Story = {
  render: () => (
    <>
      <Tile tone="default">Default</Tile>
      <Tile tone="primary">Primary</Tile>
      <Tile tone="warm">Warm</Tile>
      <Tile tone="mustard">Mustard</Tile>
      <Tile tone="dark">Dark</Tile>
    </>
  ),
};

// ── Tile spans ──────────────────────────────────────────────────────────────
export const Spans: Story = {
  render: () => (
    <>
      <Tile span={1}>span 1</Tile>
      <Tile span={1}>span 1</Tile>
      <Tile span={2}>span 2</Tile>
      <Tile span={4}>span 4</Tile>
    </>
  ),
};

export const AsLink: Story = {
  args: { to: "/", tone: "primary", children: "Clickable tile (renders a router Link)" },
  decorators: [withRouter],
};

// ── Panel ───────────────────────────────────────────────────────────────────
export const PanelPaddings: Story = {
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="space-y-3">
      <Panel padding="sm">Panel · padding sm</Panel>
      <Panel padding="md">Panel · padding md (default)</Panel>
      <Panel padding="lg">Panel · padding lg</Panel>
    </div>
  ),
};

// ── Section ─────────────────────────────────────────────────────────────────
export const SectionWithAction: Story = {
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Section
      title="Prochains repas"
      action={<button className="text-xs text-muted-foreground">Voir tout</button>}
    >
      <p className="text-sm text-muted-foreground">The section body sits under the title row.</p>
    </Section>
  ),
};

export const SectionPlain: Story = {
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Section title="Sans action">
      <p className="text-sm text-muted-foreground">A section with a title and no action.</p>
    </Section>
  ),
};
