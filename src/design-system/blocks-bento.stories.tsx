import type { Meta, StoryObj } from "@storybook/react-vite";
import { Car, CloudSun, Wifi, Zap } from "lucide-react";
import { BentoGrid, BentoItem } from "@/blocks/bento";
import { Card } from "@/components/card";
import { Eyebrow } from "@/components/eyebrow";

/**
 * # Bento Grid
 *
 * The dashboard's layout block: a responsive grid — 2 columns on mobile, 4 from
 * `sm`, 6 from `lg` — whose cells are `BentoItem`.
 *
 * **`BentoItem` is the only thing that knows where a card sits.** A `Card` carries
 * no `span`: it would have to know the grid around it, and the same card could then
 * never be reused anywhere else. The grid owns placement, the card owns itself.
 */
const meta = {
  title: "Layout/Bento Grid",
  component: BentoItem,
  subcomponents: { BentoGrid },
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  argTypes: {
    span: { control: "select", options: [1, 2, 3, 4, 6] },
    rowSpan: { control: "select", options: [undefined, 2] },
    children: { control: false },
  },
} satisfies Meta<typeof BentoItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The home screen's zones, composed from cells of different widths. */
export const Dashboard: Story = {
  args: { children: null },
  render: () => (
    <BentoGrid className="p-4">
      <BentoItem span={2}>
        <Card variant="glass" icon={<CloudSun className="h-4 w-4" />} title="Météo">
          <p className="font-serif text-3xl tracking-tight">18°</p>
        </Card>
      </BentoItem>

      <BentoItem span={2}>
        <Card
          variant="glass"
          tone="warm"
          title="Relevé mensuel à saisir"
          icon={<Zap className="h-4 w-4" />}
        >
          <p className="text-sm text-muted-foreground">3 compteurs en attente.</p>
        </Card>
      </BentoItem>

      <BentoItem span={1}>
        <Card variant="glass" icon={<Zap className="h-4 w-4" />} title="Électricité" />
      </BentoItem>

      <BentoItem span={1}>
        <Card variant="glass" icon={<Wifi className="h-4 w-4" />} title="Réseau" tone="success" />
      </BentoItem>

      <BentoItem span={2}>
        <Card variant="inverted" icon={<Car className="h-4 w-4" />} title="Bernard">
          <Eyebrow tone="current" className="opacity-60">
            Au garage
          </Eyebrow>
        </Card>
      </BentoItem>
    </BentoGrid>
  ),
};

/** Each cell states its own width; the card inside is unaware of any of it. */
export const Spans: Story = {
  args: { children: null },
  render: () => (
    <BentoGrid className="p-4">
      {([1, 1, 2, 2, 4] as const).map((span, i) => (
        <BentoItem key={i} span={span}>
          <Card variant="glass" title={`span ${span}`} />
        </BentoItem>
      ))}
    </BentoGrid>
  ),
};
