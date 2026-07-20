import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentType } from "react";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { Lightbulb, Wifi, Zap } from "lucide-react";
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

// ── The real cards, rebuilt with this component ─────────────────────────────

/**
 * The four views side by side: énergie, Bernard, dashboard, pièces. Same skeleton,
 * four contents — and the footers line up because the component pins them.
 */
export const RealCards: Story = {
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="grid gap-4 sm:grid-cols-2" style={{ width: 880 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      {/* énergie — MetricCard ×3 */}
      <Card
        icon={<Zap className="h-4 w-4" />}
        title="Électricité"
        footer={
          <div className="flex h-9 items-end gap-1" aria-hidden="true">
            {[38, 52, 44, 67, 58, 80, 71].map((h, i, all) => (
              <span
                key={h}
                className={
                  "flex-1 rounded-t-sm " + (i === all.length - 1 ? "bg-primary" : "bg-primary/35")
                }
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        }
      >
        <p className="flex items-baseline gap-1.5">
          <span className="text-2xl tracking-tight tabular-nums">8,4</span>
          <span className="text-base text-muted-foreground">kWh / jour</span>
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            ["Jour", "5,1"],
            ["Nuit", "3,3"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-secondary/60 p-3">
              <Eyebrow size="xs" as="div">
                {label}
              </Eyebrow>
              <p className="mt-1 text-lg tabular-nums">
                {value}
                <span className="ml-1 text-xs text-muted-foreground">kWh</span>
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Bernard — trimestre */}
      <Card icon={<Zap className="h-4 w-4" />} title="Trimestre en cours" subline="2026.Q3">
        <div className="grid grid-cols-3 divide-x divide-border/60 py-4">
          {[
            ["kWh", "412", "2/3 mois · 19 sessions", "text-primary"],
            ["Montant", "98,20 €", "0,238 € / kWh", ""],
            ["vs Q2", "−12 %", "468 kWh · 111,40 €", "text-success"],
          ].map(([label, value, sub, colour], i) => (
            <div key={label} className={i === 0 ? "pr-3" : i === 1 ? "px-3" : "pl-3"}>
              <Eyebrow size="xs" as="div">
                {label}
              </Eyebrow>
              <p className={cnStat(colour)}>{value}</p>
              <p className="mt-0.5 text-2xs text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* dashboard — réseau */}
      <Card
        icon={<Wifi className="h-4 w-4" />}
        title="Réseau"
        action={
          <Badge variant="secondary" shape="pill" className="text-success">
            Stable
          </Badge>
        }
        footer={
          <div className="flex justify-center gap-4 text-xs tabular-nums text-muted-foreground">
            <span>↑ 42</span>
            <span>18 ms</span>
            <span>23 clients</span>
          </div>
        }
      >
        <p className="grid place-items-center py-4">
          <span className="text-2xl tabular-nums">487</span>
          <span className="text-base text-muted-foreground">Mbps ↓</span>
        </p>
      </Card>

      {/* pièces — Luminosité */}
      <Card
        title="Luminosité"
        variant="solid"
        action={<span className="text-xs text-muted-foreground">2 / 4 allumées</span>}
      >
        <ul className="flex flex-col gap-2">
          {[
            { name: "Plafonnier", value: "80 %", on: true },
            { name: "Lampadaire", value: "45 %", on: true },
            { name: "Applique", value: "Éteint", on: false },
          ].map((l) => (
            <li key={l.name} className="flex items-center gap-2.5 text-sm">
              <Lightbulb
                className={"h-3.5 w-3.5 " + (l.on ? "text-mustard" : "text-muted-foreground")}
              />
              {l.name}
              <span
                className={
                  "ml-auto tabular-nums " + (l.on ? "font-semibold" : "text-muted-foreground")
                }
              >
                {l.value}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  ),
};

function cnStat(colour: string) {
  return "mt-1 text-lg tabular-nums " + colour;
}
