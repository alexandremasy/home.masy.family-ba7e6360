import type { Meta, StoryObj } from "@storybook/react-vite";
import { Group, TokenPage } from "./_helpers";

/**
 * The `.anim-*` utility layer from styles.css, each applied to a live sample. These are
 * hand-authored classes (not generated), so what you see is exactly what the app runs.
 */
const meta = {
  title: "Tokens/Motion",
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** The looping transform / filter utilities — the reusable ambient motion. */
const LOOPING: { cls: string; keyframe: string; note: string }[] = [
  { cls: "anim-breathe", keyframe: "breathe", note: "scale + fade, 2.4s" },
  { cls: "anim-float", keyframe: "float", note: "gentle Y bob, 3.2s" },
  { cls: "anim-drift", keyframe: "drift", note: "gentle X drift, 4s" },
  { cls: "anim-sway", keyframe: "sway", note: "rotate ±3°, top origin" },
  { cls: "anim-glow", keyframe: "glow", note: "primary drop-shadow, 2.8s" },
];

/** Weather-icon motions — each paired with a WeatherIcon condition. */
const WEATHER: { cls: string; keyframe: string }[] = [
  { cls: "anim-sun", keyframe: "sun-spin" },
  { cls: "anim-partly", keyframe: "partly-bob" },
  { cls: "anim-cloud", keyframe: "cloud-drift" },
  { cls: "anim-rain", keyframe: "rain-bob" },
  { cls: "anim-storm", keyframe: "storm-flicker" },
  { cls: "anim-snow", keyframe: "snow-fall" },
  { cls: "anim-fog", keyframe: "fog-drift" },
];

const ALL_KEYFRAMES = [
  "breathe",
  "pulse-ring",
  "slide-up",
  "wiggle",
  "equalizer",
  "float",
  "drift",
  "pop-in",
  "glow",
  "sway",
  "media-gradient",
  "shake-x",
  "mode-in",
  "overlay-fade-in / overlay-panel-in / overlay-fade-out / overlay-panel-out",
  "overlay-drawer-in / overlay-drawer-out",
  "sun-spin",
  "rain-bob",
  "storm-flicker",
  "snow-fall",
  "fog-drift",
  "partly-bob",
  "cloud-drift",
  "lg-drift-a / lg-drift-b / lg-drift-c",
  "repas-glow-morph",
];

function Tile({ cls, keyframe, note }: { cls: string; keyframe: string; note?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-5">
      <div className="flex h-16 items-center justify-center">
        <div className={`h-9 w-9 rounded-lg bg-primary text-primary ${cls}`} />
      </div>
      <div className="text-center">
        <p className="font-mono text-xs text-foreground">.{cls}</p>
        <p className="font-mono text-2xs text-muted-foreground">@keyframes {keyframe}</p>
        {note && <p className="mt-0.5 text-2xs text-muted-foreground/70">{note}</p>}
      </div>
    </div>
  );
}

export const Motion: Story = {
  render: () => (
    <TokenPage
      title="Motion"
      intro="Roughly thirty keyframes drive the app's micro-motion. The reusable ambient utilities are shown live below; entrance and overlay animations are one-shot and listed by name."
    >
      <div className="space-y-10">
        <Group label="Ambient loops — .anim-* utilities">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {LOOPING.map((a) => (
              <Tile key={a.cls} cls={a.cls} keyframe={a.keyframe} note={a.note} />
            ))}
          </div>
        </Group>

        <Group label="Triggered — hover, one-shot & composed">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-5">
              <div className="flex h-16 items-center justify-center">
                <div className="anim-wiggle h-9 w-9 rounded-lg bg-mustard" />
              </div>
              <div className="text-center">
                <p className="font-mono text-xs text-foreground">.anim-wiggle</p>
                <p className="font-mono text-2xs text-muted-foreground">@keyframes wiggle</p>
                <p className="mt-0.5 text-2xs text-muted-foreground/70">hover me</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-5">
              <div className="flex h-16 items-center justify-center">
                <div className="anim-pulse-ring relative h-9 w-9 rounded-full bg-primary text-primary" />
              </div>
              <div className="text-center">
                <p className="font-mono text-xs text-foreground">.anim-pulse-ring</p>
                <p className="font-mono text-2xs text-muted-foreground">@keyframes pulse-ring</p>
                <p className="mt-0.5 text-2xs text-muted-foreground/70">::after, currentColor</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-5">
              <div className="flex h-16 items-center justify-center">
                <div className="anim-slide-up h-9 w-9 rounded-lg bg-success" />
              </div>
              <div className="text-center">
                <p className="font-mono text-xs text-foreground">.anim-slide-up</p>
                <p className="font-mono text-2xs text-muted-foreground">@keyframes slide-up</p>
                <p className="mt-0.5 text-2xs text-muted-foreground/70">one-shot on mount</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-5">
              <div className="flex h-16 items-center justify-center">
                <div className="anim-pop-in h-9 w-9 rounded-lg bg-warm" />
              </div>
              <div className="text-center">
                <p className="font-mono text-xs text-foreground">.anim-pop-in</p>
                <p className="font-mono text-2xs text-muted-foreground">@keyframes pop-in</p>
                <p className="mt-0.5 text-2xs text-muted-foreground/70">one-shot on mount</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-5">
              <div className="flex h-16 items-end justify-center gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="eq-bar h-8 w-1.5 rounded-full bg-primary"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
              <div className="text-center">
                <p className="font-mono text-xs text-foreground">.eq-bar</p>
                <p className="font-mono text-2xs text-muted-foreground">@keyframes equalizer</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-5">
              <div className="flex h-16 w-full items-center justify-center">
                <div
                  className="anim-media-gradient h-9 w-full rounded-lg"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, var(--primary), var(--mustard), var(--warm), var(--primary))",
                    backgroundSize: "300% 100%",
                  }}
                />
              </div>
              <div className="text-center">
                <p className="font-mono text-xs text-foreground">.anim-media-gradient</p>
                <p className="font-mono text-2xs text-muted-foreground">
                  @keyframes media-gradient
                </p>
              </div>
            </div>
          </div>
        </Group>

        <Group label="Weather icons — one motion per condition">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {WEATHER.map((a) => (
              <Tile key={a.cls} cls={a.cls} keyframe={a.keyframe} />
            ))}
          </div>
        </Group>

        <Group label="Every keyframe in the system">
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex flex-wrap gap-1.5">
              {ALL_KEYFRAMES.map((k) => (
                <code
                  key={k}
                  className="rounded-md bg-muted px-2 py-0.5 font-mono text-2xs text-muted-foreground"
                >
                  {k}
                </code>
              ))}
            </div>
          </div>
        </Group>

        <div className="rounded-xl border border-warm/40 bg-warm/5 p-4">
          <p className="text-2xs font-medium uppercase tracking-eyebrow text-warm">
            prefers-reduced-motion
          </p>
          <p className="mt-1.5 text-sm text-foreground">
            styles.css only silences the decorative layers under{" "}
            <code className="font-mono text-xs">@media (prefers-reduced-motion: reduce)</code> — the
            cursor follower, the living gradient, and the repas glow. The{" "}
            <code className="font-mono text-xs">.anim-*</code> utilities above are <b>not</b> gated
            yet; honouring the setting for them is a known gap, not a claim this page makes.
          </p>
        </div>
      </div>
    </TokenPage>
  ),
};
