import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentType } from "react";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { BarChart3, Lightbulb, Wifi, Zap } from "lucide-react";
import { Card } from "@/components/Card";
import { Eyebrow } from "@/components/Eyebrow";
import { Badge } from "@/components/ui/badge";

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
 * ```
 * ┌─────────────────────────────────────────────┐
 * │ (icon)  title                     action    │  header — omitted without `title`
 * │         subline                             │
 * ├─────────────────────────────────────────────┤  ← divided
 * │ children                                    │  body — a pure slot
 * ├─────────────────────────────────────────────┤  ← divided
 * │ footer                                      │  pinned by mt-auto
 * └─────────────────────────────────────────────┘
 * ```
 *
 * **One grammar**: icon left in its tinted circle, title beside it. There is no
 * `layout` prop — the dashboard's tonal tiles migrate onto this one.
 *
 * The body stays a pure slot: the audit found a big number, a gauge, a list, a
 * chart, controls, and nothing at all. Parameterising it is what produced the
 * fifty flavors in the first place.
 *
 * Padding lives on the slots rather than on the box, so `divided` draws a true
 * full-bleed rule and `bleed` lets a table run edge-to-edge under a padded header.
 *
 * > `Tile`, `Panel` and `Section` still exist as thin deprecated shims over this
 * > component, so the ~56 existing call sites keep rendering. They hold no styling
 * > of their own and disappear once the views are migrated.
 */
const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    title: { control: "text", table: { category: "Content" } },
    subline: { control: "text", table: { category: "Content" } },
    children: { control: "text", table: { category: "Content" } },
    icon: { control: false, table: { category: "Content" } },
    action: { control: false, table: { category: "Content" } },
    footer: { control: false, table: { category: "Content" } },
    variant: {
      control: "select",
      options: ["solid", "soft", "glass", "pill", "inset"],
      table: { category: "Shape" },
    },
    tone: {
      control: "select",
      options: ["default", "primary", "warm", "mustard", "dark"],
      table: { category: "Shape" },
    },
    padding: { control: "inline-radio", options: ["sm", "md", "lg"], table: { category: "Shape" } },
    divided: { control: "boolean", table: { category: "Shape" } },
    bleed: { control: "boolean", table: { category: "Shape" } },
    span: { control: "select", options: [1, 2, 3, 4, 6], table: { category: "Placement" } },
    rowSpan: { control: false, table: { category: "Placement" } },
    to: { control: "text", table: { category: "Placement" } },
    as: { control: false, table: { category: "Placement" } },
    className: { control: false, table: { category: "Placement" } },
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

/** The four header slots filled at once — play with the controls to see each drop out. */
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
    divided: true,
  },
};

/** Without `title` there is no header at all — the body owns the whole box. */
export const BodyOnly: Story = {
  args: { children: "Une carte sans header : juste une boîte.", variant: "solid" },
};

// ── Shape ───────────────────────────────────────────────────────────────────

/** The five surfaces. `inset` belongs *inside* another card, never on the page. */
export const Variants: Story = {
  args: { title: "Surface" },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Card {...args} variant="solid" subline="solid — la boîte de contenu" />
      <Card {...args} variant="soft" subline="soft — la même, posée sur la page" />
      <Card {...args} variant="glass" subline="glass — la tuile du dashboard" />
      <Card {...args} variant="inset" subline="inset — une boîte dans une carte" />
      <Card variant="pill" padding="sm">
        <span className="text-sm">pill — une rangée arrondie</span>
      </Card>
    </div>
  ),
};

/** Tints for a feature card. They ride over the surface, not instead of it. */
export const Tones: Story = {
  args: { title: "Relevé à saisir", children: "3 compteurs en attente." },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Card {...args} tone="primary" />
      <Card {...args} tone="warm" />
      <Card {...args} tone="mustard" />
      <Card {...args} tone="dark" />
    </div>
  ),
};

/** `divided` draws the rule full-bleed — no negative margins at the call site. */
export const Divided: Story = {
  args: {
    icon: <BarChart3 className="h-4 w-4" />,
    title: "Historique mensuel",
    subline: "Médiane 312 kWh/mois",
    children: "Le corps, séparé du header par un filet pleine largeur.",
    footer: <p className="text-xs text-muted-foreground">Projection sur les 3 mois clos.</p>,
    divided: true,
  },
};

/** `bleed` drops the body padding so a table can run edge-to-edge under a padded header. */
export const Bleed: Story = {
  args: {
    title: "Historique des relevés",
    subline: "24 entrées — modifiables",
    divided: true,
    bleed: true,
    children: (
      <ul className="divide-y divide-border/60 text-sm">
        {["12 juillet", "12 juin", "11 mai"].map((d) => (
          <li key={d} className="flex justify-between px-5 py-3 sm:px-6">
            <span>{d}</span>
            <span className="tabular-nums text-muted-foreground">248 kWh</span>
          </li>
        ))}
      </ul>
    ),
  },
};

// ── Placement ───────────────────────────────────────────────────────────────

/** `span` places the card in the bento grid; it is inert outside one. */
export const Spans: Story = {
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="grid grid-cols-4 gap-3" style={{ width: 640 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <Card variant="glass" span={1} title="1" />
      <Card variant="glass" span={1} title="1" />
      <Card variant="glass" span={2} title="2" />
      <Card variant="glass" span={4} title="4" />
    </>
  ),
};

/** With `to`, the whole card becomes a router Link and gains the hover lift. */
export const AsLink: Story = {
  args: {
    icon: <Wifi className="h-4 w-4" />,
    title: "Réseau",
    to: "/",
    tone: "primary",
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
          <span className="font-serif text-2xl tracking-tight tabular-nums">8,4</span>
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
              <p className="mt-1 font-serif text-lg tabular-nums">
                {value}
                <span className="ml-1 text-xs text-muted-foreground">kWh</span>
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Bernard — trimestre */}
      <Card icon={<Zap className="h-4 w-4" />} title="Trimestre en cours" subline="2026.Q3" divided>
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
        divided
      >
        <p className="grid place-items-center py-4">
          <span className="font-serif text-2xl tabular-nums">487</span>
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
  return "mt-1 font-serif text-lg tabular-nums " + colour;
}
