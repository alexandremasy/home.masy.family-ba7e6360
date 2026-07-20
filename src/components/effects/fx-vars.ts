import type { CSSProperties } from "react";

/**
 * Builds the inline custom-property bag an effect hands to its class, dropping
 * every key left undefined so the CSS default in `styles.css` survives. Passing
 * `undefined` through would still emit the property and blank the default out.
 */
export function fxVars(vars: Record<string, string | number | undefined>): CSSProperties {
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(vars)) {
    if (value !== undefined) style[key] = String(value);
  }
  return style as CSSProperties;
}
