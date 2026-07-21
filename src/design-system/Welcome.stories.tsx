import type { Meta, StoryObj } from "@storybook/react-vite";
import { linkTo } from "@storybook/addon-links";
import {
  ArrowRight,
  LayoutGrid,
  ListChecks,
  Palette,
  PanelTop,
  Shapes,
  SquareMousePointer,
  Sparkles,
  Waves,
} from "lucide-react";
import { Icon } from "@/components/icon";

/**
 * The design system landing page. Two faces of one project: `mockup.masy.family` is the
 * clickable experience; this Storybook is the living design system it is built from.
 */
const SECTIONS: {
  title: string;
  body: string;
  to: string;
  glyph: typeof Palette;
}[] = [
  {
    title: "Foundations",
    body: "Colour, typography, spacing, radius, shadows — read live off styles.css, so a page here can never disagree with the code.",
    to: "Foundations/Color",
    glyph: Palette,
  },
  {
    title: "Effects",
    body: "Everything that moves: the ambient backgrounds behind a page, and the keyframe utilities that animate its content.",
    to: "Effects/Overview",
    glyph: Waves,
  },
  {
    title: "Iconography",
    body: "One Icon component over lucide, five bounded sizes, and the inventory of every glyph the product uses.",
    to: "Iconography/Icon",
    glyph: Shapes,
  },
  {
    title: "Layout",
    body: "The Card — one component for every boxed surface — and the bento grid that places it.",
    to: "Layout/Card",
    glyph: LayoutGrid,
  },
  {
    title: "Forms",
    body: "Buttons, inputs, selects, toggles. The shadcn primitives, customised in place.",
    to: "Forms/Button",
    glyph: SquareMousePointer,
  },
  {
    title: "Overlays & Navigation",
    body: "Dialogs, drawers, sheets, tooltips, tabs — everything that sits above or moves between pages.",
    to: "Overlays/Dialog",
    glyph: PanelTop,
  },
  {
    title: "Information",
    body: "Badges, tables, alerts, and the domain cards that display real content.",
    to: "Information/Badge",
    glyph: Sparkles,
  },
  {
    title: "Specs",
    body: "How each module behaves — repas, énergie, anniversaires — co-located so decisions stop getting lost in chat.",
    to: "Specs/Repas · Courses",
    glyph: ListChecks,
  },
];

/** The three rules that hold the system together. Everything else follows from them. */
const RULES: { rule: string; why: string }[] = [
  {
    rule: "One component per role",
    why: "There is a single Card, a single Icon, a single Eyebrow. A second implementation next to an existing one is the bug, not the fix.",
  },
  {
    rule: "Meaning travels, not the hue",
    why: "Components reach for semantics (--primary, --warm), never for a ramp rung. The primitives are deliberately absent from @theme.",
  },
  {
    rule: "The props table is the contract",
    why: "Every prop carries a doc line. If the documentation doesn't show it, it isn't part of the component.",
  },
];

function Welcome() {
  return (
    <div className="mx-auto max-w-3xl p-8 sm:p-12">
      <p className="text-2xs uppercase tracking-eyebrow text-muted-foreground">masy.family</p>
      <h1 className="mt-2 text-4xl tracking-tight">Design System</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        The UI and UX source of truth for the house systems. Design is decided here, and the cockpit
        consumes what this repo defines — components, templates, tokens and module specs. Built on
        shadcn/ui over Tailwind v4, with a single token layer.
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {SECTIONS.map(({ title, body, to, glyph }) => (
          <button
            key={title}
            type="button"
            onClick={linkTo(to)}
            className="group rounded-2xl border border-border/60 bg-card p-4 text-left shadow-soft transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon as={glyph} />
                </span>
                <p className="text-lg font-semibold">{title}</p>
              </div>
              <Icon
                as={ArrowRight}
                className="mt-2 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </button>
        ))}
      </div>

      <h2 className="mt-12 text-xl tracking-tight">How it holds together</h2>
      <dl className="mt-4 space-y-4">
        {RULES.map(({ rule, why }) => (
          <div key={rule} className="border-l-2 border-primary/40 pl-4">
            <dt className="font-semibold">{rule}</dt>
            <dd className="mt-0.5 text-sm text-muted-foreground">{why}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-12 text-xs text-muted-foreground">
        Agents read this system through the Storybook MCP at <code>design.masy.family/mcp</code> —
        component docs and props, so a rebuild reuses what exists instead of reinventing it.
      </p>
    </div>
  );
}

const meta = {
  title: "Overview",
  component: Welcome,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Welcome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Welcome_: Story = { name: "Welcome" };
