import type { Meta, StoryObj } from "@storybook/react-vite";
import { TokenPage, useComputed, useTokenValue } from "./_helpers";

/**
 * The radius scale — a 0.5rem (8px) base, climbing gently so 2xl/3xl stay restrained.
 * Each sample measures its own resolved `border-radius` off the rendered node, so the
 * page reflects whatever the browser actually applies.
 */
const meta = {
  title: "Foundations/Radius",
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

function RadiusSample({
  name,
  className,
  formula,
}: {
  name: string;
  className: string;
  formula: string;
}) {
  const { ref, value } = useComputed<HTMLDivElement>("border-radius");
  return (
    <div className="flex flex-col items-start gap-2">
      <div
        ref={ref}
        className={`h-20 w-full border border-primary/30 bg-primary/10 ${className}`}
      />
      <div>
        <p className="font-mono text-xs text-foreground">{name}</p>
        <p className="font-mono text-2xs text-muted-foreground">{value || "—"}</p>
        <p className="mt-0.5 font-mono text-2xs text-muted-foreground/70">{formula}</p>
      </div>
    </div>
  );
}

export const Radius: Story = {
  render: () => {
    const base = useTokenValue("radius");
    return (
      <TokenPage
        title="Radius"
        intro="Tighter than shadcn's default scale — the product reads crisp, not bubbly. Every rung is derived from the 8px base; each swatch measures its own applied border-radius."
      >
        <div className="space-y-6">
          <p className="text-xs text-muted-foreground">
            Base <code className="font-mono">--radius</code> ={" "}
            <span className="font-mono text-foreground">{base || "0.5rem"}</span> (8px). The rungs
            climb off it.
          </p>
          <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-6">
            <RadiusSample name="rounded-sm" className="rounded-sm" formula="--radius − 4px" />
            <RadiusSample name="rounded-md" className="rounded-md" formula="--radius − 2px" />
            <RadiusSample name="rounded-lg" className="rounded-lg" formula="--radius" />
            <RadiusSample name="rounded-xl" className="rounded-xl" formula="--radius + 4px" />
            <RadiusSample name="rounded-2xl" className="rounded-2xl" formula="--radius + 8px" />
            <RadiusSample name="rounded-3xl" className="rounded-3xl" formula="--radius + 12px" />
          </div>
        </div>
      </TokenPage>
    );
  },
};
