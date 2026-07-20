import type { Meta, StoryObj } from "@storybook/react-vite";
import { MediaSweep } from "./media-sweep";
import { Eyebrow } from "@/components/eyebrow";

/**
 * A pane whose gradient drifts under its content, so a media surface feels alive
 * while nothing on it moves. The room pages use it for the now-playing card,
 * tinted with the active source's colour.
 *
 * It composes the gradient itself: pass a colour, not a `linear-gradient`.
 */
const meta = {
  title: "Foundations/Effects/Media Sweep",
  component: MediaSweep,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    tint: { control: "color" },
    speed: { control: "text" },
    size: { control: "text" },
  },
  args: {
    className: "w-96 overflow-hidden rounded-xl border border-border/60 p-5",
    children: (
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 rounded-lg bg-foreground/10" />
        <div className="min-w-0">
          <Eyebrow size="xs">Musiq3</Eyebrow>
          <p className="mt-0.5 truncate text-lg">Concerto pour piano n°21</p>
          <p className="truncate text-sm text-muted-foreground">Mozart</p>
        </div>
      </div>
    ),
  },
} satisfies Meta<typeof MediaSweep>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Tinted with the source colour — the room pages' default. */
export const Tinted: Story = {
  args: { tint: "#14b8a6" },
};

/** `tint={null}`: the neutral card wash, still breathing. Nothing is playing. */
export const Untinted: Story = {
  args: { tint: null },
};

/** A fast sweep makes the drift readable in isolation; too fast for production. */
export const Fast: Story = {
  args: { tint: "#f97316", speed: "2.5s" },
};

/** A larger gradient than the box means a softer, less directional drift. */
export const WideGradient: Story = {
  args: { tint: "#6366f1", size: "400% 400%" },
};
