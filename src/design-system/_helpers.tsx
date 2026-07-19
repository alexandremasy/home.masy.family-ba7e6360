import { useEffect, useRef, useState, type ReactNode } from "react";
import { Eyebrow } from "@/components/Eyebrow";

/**
 * Shared primitives for the Tokens/* story pages.
 *
 * The two measuring primitives — `Swatch` and `TypeRow` — mirror the live style guide
 * in `src/routes/_app.design-system.tsx`: each reads its own resolved value off the DOM
 * rather than repeating it, so these pages cannot drift from `styles.css`, and they
 * re-read whenever the `.dark` class is toggled on the root.
 */

/** Page shell — `layout: "fullscreen"` gives us the whole canvas, so we own the frame. */
export function TokenPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background p-6 text-foreground sm:p-10">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-2">
          <Eyebrow size="xs">Tokens</Eyebrow>
          <h1 className="font-serif text-3xl tracking-tight">{title}</h1>
          {intro && <p className="max-w-2xl text-sm text-muted-foreground">{intro}</p>}
        </header>
        {children}
      </div>
    </div>
  );
}

/** A titled group of specimens. */
export function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <Eyebrow size="xs">{label}</Eyebrow>
      {children}
    </section>
  );
}

/**
 * Reads a CSS custom property off `document.documentElement`, re-reading on theme
 * switch. The single source for every token value shown on these pages.
 */
export function useTokenValue(token: string): string {
  const [value, setValue] = useState("");

  useEffect(() => {
    const read = () =>
      setValue(getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim());
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, [token]);

  return value;
}

/**
 * Reads a computed style property off a rendered probe element, re-reading on theme
 * switch. Used where the truthful value is what the browser resolves on a real node
 * (radius, shadow) rather than a raw variable — some tokens only exist inlined.
 */
export function useComputed<T extends HTMLElement>(prop: string) {
  const ref = useRef<T>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setValue(getComputedStyle(el).getPropertyValue(prop).trim());
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, [prop]);

  return { ref, value };
}

/**
 * A colour chip that reads its own resolved value from the DOM rather than repeating
 * it — the page can't drift from `styles.css`, and it re-reads on theme switch.
 */
export function Swatch({ token, note }: { token: string; note?: ReactNode }) {
  const value = useTokenValue(token);

  return (
    <div className="flex items-center gap-3">
      <span
        className="h-11 w-11 shrink-0 rounded-lg border border-border/60 shadow-soft"
        style={{ background: `var(--${token})` }}
      />
      <div className="min-w-0">
        <p className="truncate font-mono text-xs text-foreground">--{token}</p>
        <p className="truncate font-mono text-2xs text-muted-foreground">{value || "—"}</p>
        {note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}
      </div>
    </div>
  );
}

/**
 * A type specimen that measures itself. Same contract as `Swatch`: the size is read
 * off the rendered node, never retyped here, so the page can't drift from the scale.
 */
export function TypeRow({ cls, role, sample }: { cls: string; role: string; sample: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [metrics, setMetrics] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const s = getComputedStyle(el);
    const track = s.letterSpacing === "normal" ? "" : ` · ${s.letterSpacing}`;
    setMetrics(`${s.fontSize} / ${s.lineHeight}${track}`);
  }, [cls]);

  return (
    <div className="grid gap-1 border-b border-border/40 py-3 last:border-0 sm:grid-cols-[12rem_9rem_minmax(0,1fr)] sm:items-baseline sm:gap-4">
      <code className="font-mono text-xs text-foreground">{cls}</code>
      <span className="font-mono text-xs text-muted-foreground">{metrics || "—"}</span>
      <p ref={ref} className={cls}>
        {sample}
        <span className="ml-2 font-sans text-xs font-normal normal-case tracking-normal text-muted-foreground/70">
          {role}
        </span>
      </p>
    </div>
  );
}
