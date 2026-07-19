import type { Meta, StoryObj } from "@storybook/react-vite";
import { CloudSun, Zap, Car } from "lucide-react";
import { Tile } from "@/components/Card";
import { Eyebrow } from "@/components/Eyebrow";

// The dashboard's core layout block: a responsive bento grid (`.grid-bento`) of `Tile`s.
// 2 cols on mobile, 4 @640, 6 @1024. Tones + spans compose the home screen's zones.
function BentoGrid() {
  return (
    <div className="grid-bento p-4">
      <Tile span={2} tone="primary">
        <Eyebrow tone="current" className="opacity-70">
          Météo
        </Eyebrow>
        <div className="mt-2 flex items-center gap-3">
          <CloudSun className="h-8 w-8" />
          <p className="font-serif text-3xl tracking-tight">18°</p>
        </div>
      </Tile>

      <Tile span={2} tone="warm">
        <Eyebrow tone="current" className="opacity-70">
          Énergie · à faire
        </Eyebrow>
        <p className="mt-1 font-serif text-lg">Relevé mensuel à saisir</p>
      </Tile>

      <Tile tone="default">
        <Zap className="h-5 w-5 text-primary" />
        <p className="mt-2 text-sm font-semibold">Électricité</p>
      </Tile>

      <Tile tone="mustard">
        <Car className="h-5 w-5" />
        <p className="mt-2 text-sm font-semibold">Tesla · 72%</p>
      </Tile>

      <Tile span={2} tone="dark">
        <Eyebrow tone="current" className="opacity-70">
          Pièces
        </Eyebrow>
        <p className="mt-1 text-sm opacity-80">Salon · Cuisine · Chambre · Bureau</p>
      </Tile>
    </div>
  );
}

const meta = {
  title: "Blocks/Bento Grid",
  component: BentoGrid,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof BentoGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dashboard: Story = {};
