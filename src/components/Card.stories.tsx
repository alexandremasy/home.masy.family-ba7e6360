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

// ── Tile variants (surface) — the 3 real shapes, was ~6 ad-hoc !-override flavors ──
export const Solid: Story = {
  args: { variant: "solid", children: "Solid — the default card" },
};

export const Glass: Story = {
  args: { variant: "glass", className: "flex flex-col", children: "Glass — frosted translucent" },
};

export const Pill: Story = {
  args: { variant: "pill", span: 1, children: "Pill — a rounded row" },
};

export const AllVariants: Story = {
  render: () => (
    <>
      <Tile variant="solid">Solid</Tile>
      <Tile variant="glass" className="flex flex-col">
        Glass
      </Tile>
      <Tile variant="pill" span={1}>
        Pill
      </Tile>
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

/**
 * The four content-box surfaces, clustered from a repo-wide audit of the
 * hand-rolled ones. This is the taxonomy to arbitrate before migrating the
 * ~63 inline sites onto the component — the counts are real usages.
 */
export const PanelVariants: Story = {
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 460 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="space-y-3">
      <Panel variant="flat" padding="sm">
        <b>flat</b> · rounded-lg, no shadow — what Panel/Section render today (~31 sites)
      </Panel>
      <Panel variant="compact" padding="sm">
        <b>compact</b> · rounded-xl — the most common hand-rolled card (~21)
      </Panel>
      <Panel variant="soft" padding="sm">
        <b>soft</b> · rounded-2xl + shadow-soft — the budget / securite views (~13)
      </Panel>
      <Panel variant="soft" padding="sm">
        <b>inset</b> · a tinted box <i>inside</i> a card, not a card itself (~21)
        <Panel variant="inset" padding="sm" className="mt-3">
          bg-secondary/50, rounded-xl
        </Panel>
      </Panel>
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
