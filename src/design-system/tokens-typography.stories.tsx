import type { Meta, StoryObj } from "@storybook/react-vite";
import { Group, TokenPage, TypeRow } from "./_helpers";

/**
 * The type scale — eleven rungs, ported from Figma (10·12·14·16·20·24·28·32·40·48·56),
 * plus the two things that are NOT from Figma: the line-heights and the eyebrow tracking.
 * Every metric is measured off its own rendered node, so the page can't drift.
 */
const meta = {
  title: "Tokens/Typography",
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Scale: Story = {
  render: () => (
    <TokenPage
      title="Typography"
      intro="Eleven rungs, nothing else — styles.css wipes Tailwind's own scale (--text-*: initial) first, so text-7xl and text-[13px] are unwritable. Size / line-height / tracking are measured off each rendered node."
    >
      <div className="space-y-10">
        <Group label="The scale — 10 · 12 · 14 · 16 · 20 · 24 · 28 · 32 · 40 · 48 · 56">
          <div>
            <TypeRow cls="text-6xl font-semibold" role="56 · display ceiling" sample="56" />
            <TypeRow cls="text-5xl font-semibold" role="48" sample="Forty eight" />
            <TypeRow
              cls="text-4xl font-semibold tracking-tight"
              role="40 · the big number"
              sample="21.4°"
            />
            <TypeRow
              cls="font-serif text-3xl tracking-tight"
              role="32 · page title"
              sample="Sixteen dishes"
            />
            <TypeRow cls="font-serif text-2xl tracking-tight" role="28" sample="Twenty eight" />
            <TypeRow
              cls="font-serif text-xl tracking-tight"
              role="24 · section title"
              sample="This week"
            />
            <TypeRow
              cls="text-lg font-semibold"
              role="20 · the name of a thing"
              sample="Chili sin carne"
            />
            <TypeRow cls="text-base" role="16 · body, roomy" sample="Reads at arm's length." />
            <TypeRow cls="text-sm" role="14 · body, the default" sample="Reads at arm's length." />
            <TypeRow
              cls="text-xs"
              role="12 · the body floor"
              sample="Metadata, figures, captions."
            />
            <TypeRow
              cls="text-2xs uppercase tracking-eyebrow"
              role="10 · the eyebrow, uppercase only"
              sample="Eyebrow"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            The names are Tailwind's, the values are Figma's, and they disagree by one rung:{" "}
            <code className="font-mono">text-xl</code> is <b>24px</b> here, not Tailwind's 20. Read
            the value, not the name.
          </p>
        </Group>

        <Group label="Font families — one native stack for both roles">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="font-mono text-2xs text-muted-foreground">--font-sans · font-sans</p>
              <p className="mt-2 font-sans text-lg">The quick brown fox jumps</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Body, UI, everything. The OS decides the face.
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="font-mono text-2xs text-muted-foreground">--font-serif · font-serif</p>
              <p className="mt-2 font-serif text-lg tracking-tight">The quick brown fox jumps</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Headings and <code className="font-mono">.font-serif</code>. Same native stack — the
                display role reads through the token, not a webfont.
              </p>
            </div>
          </div>
        </Group>

        <Group label="Eyebrow tracking — the one letter-spacing this system owns">
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <p className="font-mono text-2xs text-muted-foreground">
              --tracking-eyebrow · 0.18em · tracking-eyebrow
            </p>
            <p className="mt-3 text-2xs font-medium uppercase tracking-eyebrow text-foreground">
              Understand · align · direct
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Figma sets letter-spacing 0 on every token; the eyebrow is a dashboard pattern the
              reference doesn't cover, so the app owns its spacing. One value — there were seven.
              Owned by <code className="font-mono">components/Eyebrow.tsx</code>.
            </p>
          </div>
        </Group>
      </div>
    </TokenPage>
  ),
};
