import type { Meta, StoryObj } from "@storybook/react-vite";
import { Group, Swatch, TokenPage } from "./_helpers";

/**
 * Every semantic colour, read live off `document.documentElement`. Flip the Storybook
 * theme toggle and each value follows. Light theme is ported from Figma (the "Colors"
 * page); the dark theme is authored (the library has no dark ramp yet).
 */
const meta = {
  title: "Tokens/Color",
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Palette: Story = {
  render: () => (
    <TokenPage
      title="Color"
      intro="Meaning before hue. Each chip reads its resolved value off the root, so this page can never disagree with styles.css — toggle the theme and the values re-read."
    >
      <div className="space-y-10">
        <Group label="Semantics — meaning before hue">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Swatch token="primary" note="Positive signal: today, links, active" />
            <Swatch token="warm" note="ALERT. Nothing else." />
            <Swatch token="mustard" note="Decorative + data series" />
            <Swatch token="success" note="Succeeded, nominal" />
            <Swatch token="destructive" note="Destructive, error" />
            <Swatch token="accent" note="shadcn's hover/focus surface. Neutral." />
            <Swatch token="secondary" note="Neutral fill under controls" />
          </div>
        </Group>

        <Group label="Surfaces">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Swatch token="background" note="The page" />
            <Swatch token="card" note="Raised surface" />
            <Swatch token="popover" note="Menus, tooltips" />
            <Swatch token="muted" note="Recessed fill" />
          </div>
        </Group>

        <Group label="Text & lines">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Swatch token="foreground" note="Body text" />
            <Swatch token="muted-foreground" note="Secondary text" />
            <Swatch token="border" note="Hairlines" />
            <Swatch token="input" note="Field borders" />
            <Swatch token="ring" note="Focus ring" />
          </div>
        </Group>

        <Group label="Sidebar — its own ramp so the rail reads distinct">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Swatch token="sidebar" note="Rail surface" />
            <Swatch token="sidebar-foreground" />
            <Swatch token="sidebar-primary" note="Active item" />
            <Swatch token="sidebar-accent" note="Hover surface" />
            <Swatch token="sidebar-border" />
            <Swatch token="sidebar-ring" />
          </div>
        </Group>

        <div className="rounded-xl border border-warm/40 bg-warm/5 p-4">
          <p className="text-2xs font-medium uppercase tracking-eyebrow text-warm">
            The -foreground pairing rule
          </p>
          <p className="mt-1.5 text-sm text-foreground">
            A <code className="font-mono text-xs">-foreground</code> token only works on its own
            solid fill. Every accent foreground is Light/90 (dark) in both themes, chosen for
            contrast — warm 6.4:1, mustard 9.0:1, teal 5.1:1. On a <i>tint</i> like{" "}
            <code className="font-mono text-xs">bg-warm/15</code> the fill is nearly the page, so
            reach for <code className="font-mono text-xs">text-warm</code>, not the foreground.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-md bg-warm px-2.5 py-1 text-xs text-warm-foreground">
              bg-warm + text-warm-foreground ✓
            </span>
            <span className="rounded-md bg-mustard px-2.5 py-1 text-xs text-mustard-foreground">
              bg-mustard + text-mustard-foreground ✓
            </span>
            <span className="rounded-md bg-primary px-2.5 py-1 text-xs text-primary-foreground">
              bg-primary + text-primary-foreground ✓
            </span>
            <span className="rounded-md bg-warm/15 px-2.5 py-1 text-xs text-warm">
              bg-warm/15 + text-warm ✓
            </span>
          </div>
        </div>
      </div>
    </TokenPage>
  ),
};
