import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentType } from "react";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { BarChart3, Lightbulb, Wifi, Zap } from "lucide-react";
import { Card } from "@/components/card";
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
 * way. The **Anatomy** story below labels each one on a complete card.
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
      options: ["lg", "xl", "2xl", "full"],
      table: { category: "1 · Global" },
    },
    padding: {
      control: "inline-radio",
      options: ["sm", "md"],
      table: { category: "1 · Global" },
    },
    divided: { control: "boolean", table: { category: "1 · Global" } },
    to: { control: "text", table: { category: "1 · Global" } },
    as: { control: false, table: { category: "1 · Global" } },
    className: { control: false, table: { category: "1 · Global" } },

    icon: { control: false, table: { category: "2 · Header" } },
    tone: {
      control: "select",
      options: ["primary", "success", "warm", "mustard"],
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
    divided: true,
  },
};

/**
 * Every region named after the prop that fills it. The outlines are the real DOM
 * nodes the component renders — each one carries a `data-slot`, so nothing here is
 * drawn for the diagram.
 */
export const Anatomy: Story = {
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ width: 540, padding: "2rem 6.5rem 1.5rem 1rem" }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="anatomy">
      <style>{`
        .anatomy [data-slot] {
          position: relative;
          outline: 1px dashed color-mix(in srgb, var(--primary) 50%, transparent);
          outline-offset: 1px;
        }
        /* header · body · footer are tethered to a label in the right margin */
        .anatomy [data-slot="header"]::after,
        .anatomy [data-slot="body"]::after,
        .anatomy [data-slot="footer"]::after {
          content: attr(data-slot);
          position: absolute; top: 50%; left: 100%; transform: translateY(-50%);
          margin-left: .75rem; white-space: nowrap;
          font-size: .625rem; text-transform: uppercase; letter-spacing: .18em;
          font-weight: 600; color: var(--primary);
        }
        .anatomy [data-slot="header"]::before,
        .anatomy [data-slot="body"]::before,
        .anatomy [data-slot="footer"]::before {
          content: ""; position: absolute; top: 50%; left: 100%; width: .625rem;
          border-top: 1px dashed color-mix(in srgb, var(--primary) 50%, transparent);
        }
        /* icon sits inside the header row, so it gets its label above instead */
        .anatomy [data-slot="icon"]::after {
          content: "icon"; position: absolute; bottom: 100%; left: 0; margin-bottom: .2rem;
          font-size: .625rem; text-transform: uppercase; letter-spacing: .18em;
          font-weight: 600; color: color-mix(in srgb, var(--primary) 75%, transparent);
        }
      `}</style>
      <Card
        icon={<Zap className="h-4 w-4" />}
        title="title"
        subline="subline"
        action={
          <Badge variant="secondary" shape="pill">
            action
          </Badge>
        }
        footer={<p className="text-sm text-muted-foreground">footer</p>}
        divided
      >
        <p className="py-6 text-sm text-muted-foreground">children</p>
      </Card>
    </div>
  ),
};

/** Without `title` there is no header at all — the body owns the whole box. */
export const BodyOnly: Story = {
  args: { children: "Une carte sans header : juste une boîte.", variant: "solid" },
};

// ── Global ──────────────────────────────────────────────────────────────────

/**
 * The five surfaces. A surface is a nature, not a colour — which is why Bernard's
 * dark card is `inverted` here rather than a tone. `inset` belongs *inside* another
 * card.
 */
export const Variants: Story = {
  args: { title: "Surface", icon: <Zap className="h-4 w-4" /> },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Card {...args} variant="solid" subline="solid — la boîte de contenu" />
      <Card {...args} variant="soft" subline="soft — la même, posée sur la page" />
      <Card {...args} variant="glass" subline="glass — la tuile du dashboard" />
      <Card {...args} variant="inset" subline="inset — une boîte dans une carte" />
      <Card {...args} variant="inverted" subline="inverted — Bernard" />
    </div>
  ),
};

/**
 * The radius is its own dimension, not a surface: the bento pills are `inset` cards
 * rounded `full`, not a variant of their own.
 */
export const Radius: Story = {
  args: { title: "Rayon", icon: <Zap className="h-4 w-4" /> },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Card {...args} variant="solid" radius="lg" subline="lg" />
      <Card {...args} variant="solid" radius="xl" subline="xl" />
      <Card {...args} variant="solid" radius="2xl" subline="2xl — le défaut" />
      <Card variant="inset" radius="full" padding="sm" title="full — la pilule du bento" />
    </div>
  ),
};

// ── Header ──────────────────────────────────────────────────────────────────

/**
 * `tone` colours the **icon**, never the card. On `glass` and `inverted` the surface
 * dictates the circle and `tone` steps aside — so a coloured card never needs its
 * icon re-tinted by hand.
 */
export const Tones: Story = {
  args: { title: "Électricité", icon: <Zap className="h-4 w-4" />, variant: "solid" },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Card {...args} tone="primary" subline="primary — le défaut (13 usages)" />
      <Card {...args} tone="success" subline="success — tout va bien (10)" />
      <Card {...args} tone="warm" subline="warm — le ton d'alerte (9)" />
      <Card {...args} tone="mustard" subline="mustard — décoratif (2)" />
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
