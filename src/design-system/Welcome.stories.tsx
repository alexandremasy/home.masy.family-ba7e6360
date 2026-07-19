import type { Meta, StoryObj } from "@storybook/react-vite";

// The design system landing page. Two faces of one project: mockup.masy.family is the
// clickable experience; this Storybook (design.masy.family) is the living design system —
// tokens, components, blocks/templates, and co-located specs.
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
        {[
          [
            "Tokens",
            "Color, typography, radius, shadows, spacing, motion — read live from styles.css.",
          ],
          [
            "UI",
            "The shadcn primitives, with this app's real deviations (inverted button, warn alert).",
          ],
          ["Components", "Composed pieces — Tile, PageHeader, DishCard, BudgetBar, WeatherIcon…"],
          ["Specs", "How each module behaves — co-located so decisions stop getting lost."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
            <p className="font-serif text-lg font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: "Design System/Welcome",
  component: Welcome,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Welcome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Welcome_: Story = { name: "Welcome" };
