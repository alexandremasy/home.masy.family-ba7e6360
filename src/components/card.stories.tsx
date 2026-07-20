import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentType } from "react";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { Wifi, Zap } from "lucide-react";
import { Card, type CardProps, type CardVariant } from "@/components/card";
import { Eyebrow } from "@/components/eyebrow";
import { Badge } from "@/components/badge";

/**
 * # Card
 *
 * **The** card. One component for every boxed surface in the app — dashboard tile,
 * content section, feature tile, inset box.
 *
 * An audit of four views (énergie, Bernard, dashboard, pièces) found the same
 * skeleton written **ten times**: three competing named components plus seven
 * inline copies, across 152 card-shaped surfaces and 50 distinct signatures. They
 * agreed on the structure and diverged on the surface — which is a consequence,
 * not the problem.
 *
 * ## The anatomy
 *
 * The header takes **four slots**, and the fourth is the one that never existed —
 * which is why every view smuggled its badge, filter, tabs or toggle in some other
 * way.
 *
 * **One grammar**: icon left in its tinted circle, title beside it. There is no
 * `layout` prop — the dashboard's tonal tiles migrate onto this one.
 *
 * The body stays a pure slot: the audit found a big number, a gauge, a list, a
 * chart, controls, and nothing at all. Parameterising it is what produced the
 * fifty flavors in the first place.
 *
 * Padding lives on the slots rather than on the box, so the rule under the header
 * runs full-bleed and `bleed` lets a table run edge-to-edge under a padded header.
 *
 * > `Tile`, `Panel` and `Section` still exist as thin deprecated shims over this
 * > component, so the ~56 existing call sites keep rendering. They hold no styling
 * > of their own and disappear once the views are migrated.
 */
const meta = {
  title: "Layout/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  // Categories follow the anatomy, so the table reads in the order the card is built.
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "soft", "glass", "inset", "inverted"],
      table: { category: "1 · Global" },
    },
    radius: {
      control: "inline-radio",
      options: ["xl", "full"],
      table: { category: "1 · Global" },
    },
    padding: {
      control: "inline-radio",
      options: ["sm", "md"],
      table: { category: "1 · Global" },
    },
    to: { control: "text", table: { category: "1 · Global" } },
    as: { control: false, table: { category: "1 · Global" } },
    className: { control: false, table: { category: "1 · Global" } },

    icon: { control: false, table: { category: "2 · Header" } },
    tone: {
      control: "select",
      options: ["primary", "success", "warm", "mustard", "destructive"],
      table: { category: "2 · Header" },
    },
    title: { control: "text", table: { category: "2 · Header" } },
    subline: { control: "text", table: { category: "2 · Header" } },
    action: { control: false, table: { category: "2 · Header" } },

    children: { control: "text", table: { category: "3 · Body" } },
    bleed: { control: "boolean", table: { category: "3 · Body" } },

    footer: { control: false, table: { category: "4 · Footer" } },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

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

/**
 * The four header slots filled at once. This is the story the Docs page opens on —
 * drive it with the controls below to see each slot drop in and out.
 */
export const Default: Story = {
  args: {
    icon: <Zap className="h-4 w-4" />,
    title: "Électricité",
    subline: "12 derniers mois — vue glissante",
    action: (
      <Badge variant="secondary" shape="pill">
        Stable
      </Badge>
    ),
    children: "Body — un slot pur.",
    footer: <p className="text-xs text-muted-foreground">Footer — collé en bas.</p>,
    variant: "soft",
  },
};

// ── One story per surface ────────────────────────────────────────────────────

/**
 * Every slot combination of one surface, side by side — so a surface can be checked
 * in one glance instead of hunting through stories. Each cell says what it renders.
 */
function SurfaceMatrix({ variant }: { variant: CardVariant }) {
  const icon = <Zap className="h-4 w-4" />;
  const action = (
    <Badge variant="secondary" shape="pill">
      action
    </Badge>
  );
  const foot = <p className="text-xs opacity-70">footer</p>;
  const body = <p className="text-sm opacity-70">body</p>;

  const cases: { label: string; props: Partial<CardProps> }[] = [
    { label: "header · body · footer", props: { icon, title: "title", action, footer: foot } },
    { label: "+ subline", props: { icon, title: "title", subline: "subline", action } },
    { label: "header · body", props: { icon, title: "title" } },
    { label: "no icon", props: { title: "title", action } },
    { label: "body only", props: {} },
    { label: "header only", props: { icon, title: "title", action, children: undefined } },
    { label: "body · footer", props: { footer: foot } },
    { label: "pill", props: { radius: "full", padding: "sm", children: "pill" } },
  ];

  // `items-start` so each cell takes its natural height — a card fills whatever the
  // parent gives it, and a stretched grid row would make an empty card look tall.
  return (
    <div className="grid items-start gap-5 sm:grid-cols-2" style={{ width: 620 }}>
      {cases.map(({ label, props }) => (
        <div key={label} className="flex flex-col gap-1.5">
          <Eyebrow size="xs">{label}</Eyebrow>
          <Card variant={variant} {...props}>
            {"children" in props ? props.children : body}
          </Card>
        </div>
      ))}
    </div>
  );
}

const surfaceStory = (variant: CardVariant): Story => ({
  parameters: { layout: "padded" },
  decorators: [],
  render: () => <SurfaceMatrix variant={variant} />,
});

/** The plain content box — a border, no elevation. */
export const Solid: Story = surfaceStory("solid");

/** The default: the same box, lifted off the page. The shadow sits on the fill only. */
export const Soft: Story = surfaceStory("soft");

/** The frosted dashboard tile. Needs something behind it to read as glass. */
export const Glass: Story = surfaceStory("glass");

/** A tinted box that belongs *inside* another card, never on the page. */
export const Inset: Story = surfaceStory("inset");

/** The dark feature card — Bernard on the dashboard. */
export const Inverted: Story = surfaceStory("inverted");

/**
 * With `to`, the whole card becomes a router Link: it takes the caret on the right,
 * lifts on hover (the caret slides with it), settles back on press, and shows a
 * focus ring when reached with the keyboard. Tab to it to see the ring.
 */
export const AsLink: Story = {
  args: {
    icon: <Wifi className="h-4 w-4" />,
    title: "Réseau",
    to: "/",
    children: "Toute la carte est cliquable.",
  },
  decorators: [withRouter],
};
