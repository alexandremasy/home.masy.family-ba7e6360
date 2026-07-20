import type { Meta, StoryObj } from "@storybook/react-vite";
import { TokenPage, useComputed } from "./_helpers";

/**
 * Three elevations, all in one cool hue (oklch 0.2 0.02 200) so shadows read as depth,
 * not colour. Each card measures its own resolved `box-shadow` off the rendered node.
 */
const meta = {
  title: "Foundations/Shadows",
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

function ShadowCard({ name, className, role }: { name: string; className: string; role: string }) {
  const { ref, value } = useComputed<HTMLDivElement>("box-shadow");
  return (
    <div className="space-y-3">
      <div
        ref={ref}
        className={`flex h-28 items-center justify-center rounded-2xl border border-border/40 bg-card ${className}`}
      >
        <span className="font-mono text-xs text-muted-foreground">{name}</span>
      </div>
      <div>
        <p className="text-xs text-foreground">{role}</p>
        <p className="mt-0.5 truncate font-mono text-2xs text-muted-foreground" title={value}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export const Elevation: Story = {
  render: () => (
    <TokenPage
      title="Shadows"
      intro="Depth, not colour — every layer shares one cool hue and only deepens. Each card reads its own resolved box-shadow, so a change in styles.css shows up here."
    >
      <div className="grid gap-8 sm:grid-cols-3">
        <ShadowCard name="shadow-soft" className="shadow-soft" role="Resting cards, tiles" />
        <ShadowCard name="shadow-lift" className="shadow-lift" role="Hover, raised surfaces" />
        <ShadowCard
          name="shadow-float"
          className="shadow-float"
          role="Genuinely floating — the mobile bottom bar"
        />
      </div>
    </TokenPage>
  ),
};
