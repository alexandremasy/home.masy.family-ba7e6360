import { useEffect, useRef, useState } from "react";
import { ColorItem, ColorPalette, IconItem, IconGallery } from "@storybook/addon-docs/blocks";
import { type LucideIcon } from "lucide-react";
import { Icon } from "@/components/icon";
import { useComputed, useTokenValue } from "./_helpers";

/* ────────────────────────────────────────────────────────────────────────────
   Live specimens for the Foundations pages.

   Storybook's own doc blocks do the rendering wherever it ships one — ColorPalette
   for colour, Typeset for type, IconGallery for icons. This file only resolves the
   values off `document.documentElement` and hands them over, so a page can never
   disagree with styles.css and it re-reads when the theme toggles. Hardcoding hex
   values into <ColorItem> would create exactly the drift the token layer prevents.

   Radius, shadow and motion have no equivalent block — those specimens measure
   themselves off the rendered node, same contract.
   ──────────────────────────────────────────────────────────────────────────── */

/** Prints a token's resolved value inline, in running text. */
export function TokenValue({ token, fallback }: { token: string; fallback?: string }) {
  const value = useTokenValue(token);
  return <code>{value || fallback || `var(--${token})`}</code>;
}

/**
 * Resolves a whole list of tokens in ONE effect, reading them off a probe node
 * rather than the document root — so an item placed inside a `.dark` container
 * reports the dark values without touching the page theme.
 *
 * Reading them in a loop of `useTokenValue` calls would break the rules of hooks
 * the moment a list changes length, and `ColorItem` chokes on an unresolved
 * `var(--x)`: it parses the value to compute its contrast label, so it must get a
 * real colour or nothing.
 */
/** A semantic token, and the ramp rung it points at when there is one. */
export type TokenRef = string | { name: string; rung: string };

const refName = (t: TokenRef) => (typeof t === "string" ? t : t.name);
/** The swatch label carries the rung, so the mapping lives with the colour itself. */
const refLabel = (t: TokenRef) => (typeof t === "string" ? `--${t}` : `--${t.name} · ${t.rung}`);

function useTokenValuesAt(tokens: TokenRef[]) {
  const ref = useRef<HTMLSpanElement>(null);
  const key = tokens.map((t) => `${refName(t)}|${refLabel(t)}`).join(",");
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const style = getComputedStyle(el);
      const next: Record<string, string> = {};
      for (const pair of key.split(",")) {
        const [name, label] = pair.split("|");
        const v = style.getPropertyValue(`--${name}`).trim();
        if (v) next[label] = v;
      }
      setValues(next);
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, [key]);

  return { ref, values };
}

function LiveColorItem({
  title,
  subtitle,
  tokens,
}: {
  title: string;
  subtitle?: string;
  tokens: TokenRef[];
}) {
  const { ref, values } = useTokenValuesAt(tokens);
  return (
    <>
      <span ref={ref} aria-hidden="true" />
      {Object.keys(values).length > 0 && (
        <ColorItem title={title} subtitle={subtitle ?? ""} colors={values} />
      )}
    </>
  );
}

/** The palette, grouped by role. Values read live, rendering by Storybook. */
export function TokenPalette({
  groups,
}: {
  groups: { title: string; note?: string; tokens: TokenRef[] }[];
}) {
  return (
    <ColorPalette>
      {groups.map((g) => (
        <LiveColorItem key={g.title} title={g.title} subtitle={g.note} tokens={g.tokens} />
      ))}
    </ColorPalette>
  );
}

const RUNGS = ["00", "10", "20", "30", "40", "50", "60", "70", "80", "90"] as const;

/**
 * The primitive ramps, 00 → 90. One row per hue, so the rungs line up vertically
 * and the usable band (40–60 on a light ground) reads across the whole set.
 */
export function RampPalette({ ramps }: { ramps: { name: string; note?: string }[] }) {
  return (
    <ColorPalette>
      {ramps.map((r) => (
        <LiveColorItem
          key={r.name}
          title={r.name}
          subtitle={r.note}
          tokens={RUNGS.map((n) => `${r.name.toLowerCase()}-${n}`)}
        />
      ))}
    </ColorPalette>
  );
}

/** The icon inventory, rendering by Storybook's IconGallery. */
export function LucideGallery({ icons }: { icons: Record<string, LucideIcon> }) {
  return (
    <IconGallery>
      {Object.entries(icons).map(([name, glyph]) => (
        <IconItem key={name} name={name}>
          <Icon as={glyph} size="lg" />
        </IconItem>
      ))}
    </IconGallery>
  );
}

/**
 * One step of the spacing scale, reporting the width the browser actually applied.
 * `className` carries the literal Tailwind class — interpolating it would leave the
 * JIT nothing to find.
 */
export function SpacingSample({
  step,
  className,
  note,
}: {
  step: string;
  className: string;
  note?: string;
}) {
  const { ref, value } = useComputed<HTMLDivElement>("width");
  return (
    <div className="flex items-center gap-4 border-b border-border/40 py-2 last:border-0">
      <code className="w-14 shrink-0 font-mono text-xs text-foreground">{step}</code>
      <code className="w-14 shrink-0 font-mono text-2xs text-muted-foreground">{value || "—"}</code>
      <div ref={ref} className={`h-4 shrink-0 rounded-sm bg-primary/70 ${className}`} />
      {note && <span className="text-2xs text-muted-foreground">{note}</span>}
    </div>
  );
}

/** A corner that reports the radius the browser actually applied. */
export function RadiusSample({
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

/** An elevation that reports its own resolved box-shadow. */
export function ShadowSample({
  name,
  className,
  role,
}: {
  name: string;
  className: string;
  role: string;
}) {
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

/** One `.anim-*` utility, running. */
export function MotionSample({
  cls,
  keyframe,
  note,
  swatch = "bg-primary",
}: {
  cls: string;
  keyframe: string;
  note?: string;
  swatch?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-5">
      <div className="flex h-16 items-center justify-center">
        <div className={`h-9 w-9 rounded-lg text-primary ${swatch} ${cls}`} />
      </div>
      <div className="text-center">
        <p className="font-mono text-xs text-foreground">.{cls}</p>
        <p className="font-mono text-2xs text-muted-foreground">@keyframes {keyframe}</p>
        {note && <p className="mt-0.5 text-2xs text-muted-foreground/70">{note}</p>}
      </div>
    </div>
  );
}
