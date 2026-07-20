import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarChart3, Lightbulb, Sparkles, Wifi, Zap } from "lucide-react";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/Card";
import { Eyebrow } from "@/components/Eyebrow";
import { Badge } from "@/components/ui/badge";

/**
 * # Anatomie de la Card
 *
 * An audit of four views — énergie, Bernard, dashboard, pièces — found the same
 * skeleton written **ten times**: three competing named components (`Section`,
 * `SectionTitle`, `MetricCard`) plus seven inline copies, across 152 card-shaped
 * surfaces and 50 distinct signatures.
 *
 * They agree on the structure. What they disagreed on was the surface — which is
 * a consequence, not the problem.
 *
 * ## Four slots, not three
 *
 * | Slot | Role |
 * |---|---|
 * | `icon` | The 36px tinted circle, present in 7 of the 10 implementations. |
 * | `title` | One typographic declaration, copied verbatim in all ten. |
 * | `subline` | A **node**, not a string — Bernard composes JSX in it. |
 * | `action` | The slot that was always missing. Its position never varies, only its nature: badge, filter, tabs, legend, trend chip — or a real control. |
 *
 * The **body** stays a pure slot (the audit found a number, a gauge, a list, a
 * chart, controls, and nothing at all — there is nothing to parameterise). The
 * **footer** belongs to the component, pinned by `mt-auto`, because footers that
 * each caller positions never line up in a grid.
 *
 * ## One grammar
 *
 * Icon left in its circle, title beside it. No `layout` prop: the tonal dashboard
 * tiles' "eyebrow + icon right" variant is a divergence, and they migrate onto
 * this one.
 *
 * The specimens below are the four real cards, rebuilt with these components.
 */
const meta = {
  title: "Components/Card Anatomy",
  component: Card,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { children: null },
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

/** Every slot filled and labelled, so the skeleton reads on its own. */
export const Anatomy: Story = {
  render: () => (
    <Card>
      <CardHeader
        icon={<Sparkles className="h-4 w-4" />}
        title="Titre"
        subline="Subline — un node, pas une string"
        action={
          <Badge variant="secondary" shape="pill">
            action
          </Badge>
        }
        divided
      />
      <CardBody>
        <p className="py-4 text-sm text-muted-foreground">
          Body — slot pur. Chiffre, jauge, liste, graphe, contrôles, ou rien.
        </p>
      </CardBody>
      <CardFooter divided>
        <p className="text-xs text-muted-foreground">Footer — collé en bas par mt-auto.</p>
      </CardFooter>
    </Card>
  ),
};

/** énergie · `MetricCard` ×3 — header sans action, footer sparkline. */
export const Electricite: Story = {
  render: () => (
    <Card>
      <CardHeader icon={<Zap className="h-4 w-4" />} title="Électricité" />
      <CardBody>
        <p className="flex items-baseline gap-1.5">
          <span className="font-serif text-2xl tracking-tight tabular-nums">8,4</span>
          <span className="text-base text-muted-foreground">kWh / jour</span>
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-secondary/60 p-3">
            <Eyebrow size="xs" as="div">
              Jour
            </Eyebrow>
            <p className="mt-1 font-serif text-lg tabular-nums">
              5,1<span className="ml-1 text-xs text-muted-foreground">kWh</span>
            </p>
          </div>
          <div className="rounded-xl bg-secondary/60 p-3">
            <Eyebrow size="xs" as="div">
              Nuit
            </Eyebrow>
            <p className="mt-1 font-serif text-lg tabular-nums">
              3,3<span className="ml-1 text-xs text-muted-foreground">kWh</span>
            </p>
          </div>
        </div>
      </CardBody>
      <CardFooter>
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
      </CardFooter>
    </Card>
  ),
};

/** Bernard · `SectionTitle` — même header, séparé par un filet pleine largeur. */
export const Trimestre: Story = {
  render: () => (
    <Card>
      <CardHeader
        icon={<Zap className="h-4 w-4" />}
        title="Trimestre en cours"
        subline="2026.Q3"
        divided
      />
      <CardBody>
        <div className="grid grid-cols-3 divide-x divide-border/60 py-4">
          <div className="pr-3">
            <Eyebrow size="xs" as="div">
              kWh
            </Eyebrow>
            <p className="mt-1 font-serif text-lg tabular-nums text-primary">412</p>
            <p className="mt-0.5 text-2xs text-muted-foreground">2/3 mois · 19 sessions</p>
          </div>
          <div className="px-3">
            <Eyebrow size="xs" as="div">
              Montant
            </Eyebrow>
            <p className="mt-1 font-serif text-lg tabular-nums">98,20 €</p>
            <p className="mt-0.5 text-2xs text-muted-foreground">0,238 € / kWh</p>
          </div>
          <div className="pl-3">
            <Eyebrow size="xs" as="div">
              vs Q2
            </Eyebrow>
            <p className="mt-1 font-serif text-lg tabular-nums text-success">−12 %</p>
            <p className="mt-0.5 text-2xs text-muted-foreground">468 kWh · 111,40 €</p>
          </div>
        </div>
      </CardBody>
    </Card>
  ),
};

/** dashboard · tuile réseau — l'action porte le badge d'état, le footer la légende. */
export const Reseau: Story = {
  render: () => (
    <Card>
      <CardHeader
        icon={<Wifi className="h-4 w-4" />}
        title="Réseau"
        action={
          <Badge variant="secondary" shape="pill" className="text-success">
            Stable
          </Badge>
        }
      />
      <CardBody className="grid place-items-center py-6">
        <p className="flex items-baseline gap-1.5">
          <span className="font-serif text-2xl tracking-tight tabular-nums">487</span>
          <span className="text-base text-muted-foreground">Mbps ↓</span>
        </p>
      </CardBody>
      <CardFooter divided>
        <div className="flex justify-center gap-4 text-xs tabular-nums text-muted-foreground">
          <span>↑ 42</span>
          <span>18 ms</span>
          <span>23 clients</span>
          <span>CPU 11 %</span>
        </div>
      </CardFooter>
    </Card>
  ),
};

/**
 * pièces · `Section` ×8 — ni icône ni subline : le seul composant partagé était
 * aussi le plus pauvre. L'action existe mais reste passive, un simple état.
 */
export const Luminosite: Story = {
  render: () => (
    <Card>
      <CardHeader
        title="Luminosité"
        action={<span className="text-xs text-muted-foreground">2 / 4 allumées</span>}
      />
      <CardBody>
        <ul className="flex flex-col gap-2 pb-1">
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
      </CardBody>
    </Card>
  ),
};

/**
 * The four side by side. Same skeleton, four contents — and the footers line up
 * because the component owns them, not the caller.
 */
export const AllSpecimens: Story = {
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
      <Card>
        <CardHeader icon={<Zap className="h-4 w-4" />} title="Électricité" />
        <CardBody>
          <p className="flex items-baseline gap-1.5">
            <span className="font-serif text-2xl tabular-nums">8,4</span>
            <span className="text-base text-muted-foreground">kWh / jour</span>
          </p>
        </CardBody>
        <CardFooter>
          <p className="text-xs text-muted-foreground">7 derniers jours</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader
          icon={<BarChart3 className="h-4 w-4" />}
          title="Historique mensuel"
          subline="Médiane 312 kWh/mois"
          action={<span className="text-xs text-success">sous la médiane</span>}
          divided
        />
        <CardBody className="py-4">
          <p className="text-sm text-muted-foreground">Groupé par trimestre.</p>
        </CardBody>
        <CardFooter>
          <p className="text-xs text-muted-foreground">Projection sur les 3 mois clos.</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader
          icon={<Wifi className="h-4 w-4" />}
          title="Réseau"
          action={
            <Badge variant="secondary" shape="pill" className="text-success">
              Stable
            </Badge>
          }
        />
        <CardBody className="grid place-items-center py-4">
          <p className="font-serif text-2xl tabular-nums">487</p>
        </CardBody>
        <CardFooter divided>
          <p className="text-center text-xs text-muted-foreground">↑ 42 · 18 ms · 23 clients</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader
          title="Luminosité"
          action={<span className="text-xs text-muted-foreground">2 / 4 allumées</span>}
        />
        <CardBody>
          <p className="text-sm text-muted-foreground">Plafonnier, lampadaire allumés.</p>
        </CardBody>
      </Card>
    </>
  ),
};
