import { useEffect, useRef, useState } from "react";

/**
 * Measuring hooks for the Foundations pages.
 *
 * The rendering is Storybook's job — `ColorPalette`, `Typeset`, `IconGallery` and the
 * MDX blocks do it. These two hooks only answer "what value is actually applied right
 * now", so a page can never drift from `styles.css` and re-reads when the theme
 * toggles. Nothing here draws anything.
 */

/** Reads a CSS custom property off `document.documentElement`, live. */
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
 * Reads a computed property off a rendered probe element. Used where the truthful
 * value is what the browser resolves on a real node — radius, shadow — rather than a
 * raw variable, since some of those only exist inlined.
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
