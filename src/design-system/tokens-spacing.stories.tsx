import type { Meta, StoryObj } from "@storybook/react-vite";
import { Group, TokenPage, useTokenValue } from "./_helpers";

/**
 * The layout tokens that aren't part of Tailwind's spacing scale: the sticky-bar height
 * `--nav-h`, and the `.grid-bento` mosaic the dashboard is built on. Values read live.
 */
const meta = {
  title: "Foundations/Spacing",
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Layout: Story = {
  render: () => {
    const navH = useTokenValue("nav-h");
    return (
      <TokenPage
        title="Spacing & layout"
        intro="Beyond Tailwind's spacing scale, two layout tokens carry the dashboard: the sticky-bar height and the bento grid."
      >
        <div className="space-y-10">
          <Group label="--nav-h · the sticky bar height">
            <div className="overflow-hidden rounded-xl border border-border/60">
              <div
                className="flex items-center bg-card px-4 shadow-soft"
                style={{ height: "var(--nav-h)" }}
              >
                <span className="font-mono text-xs text-foreground">
                  --nav-h · {navH || "56px"}
                </span>
              </div>
              <div className="bg-muted/40 p-4 text-xs text-muted-foreground">
                Anything that sticks in a full-bleed page must offset by this height, or it hides
                behind the bar. Mirrors the header in <code className="font-mono">_app.tsx</code>{" "}
                (h-14).
              </div>
            </div>
          </Group>

          <Group label=".grid-bento · the dashboard mosaic">
            <p className="text-xs text-muted-foreground">
              2 columns on mobile, 4 at ≥640px, 6 at ≥1024px, with fixed row heights on desktop and{" "}
              <code className="font-mono">grid-auto-flow: row dense</code>. Resize the preview to
              watch it reflow.
            </p>
            <div className="grid-bento">
              <div className="col-span-2 row-span-2 flex items-end rounded-2xl bg-primary/15 p-4 text-primary">
                <span className="font-mono text-xs">2 × 2</span>
              </div>
              <div className="col-span-2 flex items-end rounded-2xl bg-mustard/20 p-4">
                <span className="font-mono text-xs">2 × 1</span>
              </div>
              <div className="flex items-end rounded-2xl bg-warm/15 p-4 text-warm">
                <span className="font-mono text-xs">1 × 1</span>
              </div>
              <div className="flex items-end rounded-2xl bg-secondary p-4">
                <span className="font-mono text-xs">1 × 1</span>
              </div>
              <div className="col-span-2 flex items-end rounded-2xl bg-secondary p-4">
                <span className="font-mono text-xs">2 × 1</span>
              </div>
              <div className="flex items-end rounded-2xl bg-success/15 p-4 text-success">
                <span className="font-mono text-xs">1 × 1</span>
              </div>
              <div className="flex items-end rounded-2xl bg-muted p-4">
                <span className="font-mono text-xs">1 × 1</span>
              </div>
            </div>
          </Group>
        </div>
      </TokenPage>
    );
  },
};
