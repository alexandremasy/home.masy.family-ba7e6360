import type { Meta, StoryObj } from "@storybook/react-vite";
import { linkTo } from "@storybook/addon-links";
import { ArrowRight } from "lucide-react";

// The design system landing page. Two faces of one project: mockup.masy.family is the
// clickable experience; this Storybook (design.masy.family) is the living design system —
// tokens, components, blocks, and co-located specs. The cards below link into each section.
const SECTIONS: { title: string; body: string; to: string }[] = [
  {
    title: "Tokens",
    body: "Color, typography, radius, shadows, spacing, motion — read live from styles.css.",
    to: "Tokens/Color",
  },
  {
    title: "UI",
    body: "The shadcn primitives, with this app's real deviations (inverted button, warn alert).",
    to: "UI/Button",
  },
  {
    title: "Components",
    body: "Composed pieces — Tile, PageHeader, DishCard, BudgetBar, WeatherIcon…",
    to: "Components/Card",
  },
  {
    title: "Blocks",
    body: "Layout building blocks — the dashboard bento grid.",
    to: "Blocks/Bento Grid",
  },
  {
    title: "Specs",
    body: "How each module behaves — co-located so decisions stop getting lost.",
    to: "Specs/Repas · Courses",
  },
];

function Welcome() {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <p className="text-2xs uppercase tracking-eyebrow text-muted-foreground">Maison</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Design System</h1>
      <p className="mt-3 text-muted-foreground">
        The living design system behind <strong className="text-foreground">masy.family</strong>.
        Built on shadcn/ui over Tailwind v4 — one token layer, components owned in{" "}
        <code>src/components</code>, documented here so the cockpit can reuse them without drift.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {SECTIONS.map(({ title, body, to }) => (
          <button
            key={title}
            type="button"
            onClick={linkTo(to)}
            className="group rounded-2xl border border-border/60 bg-card p-4 text-left shadow-soft transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <div className="flex items-center justify-between">
              <p className="font-serif text-lg font-semibold">{title}</p>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: "Welcome",
  component: Welcome,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Welcome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Welcome_: Story = { name: "Welcome" };
