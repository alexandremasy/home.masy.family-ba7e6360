/**
 * The ambient effect layer: decorative backgrounds shared across the app.
 *
 * Each effect is a CSS class in `styles.css` driven by custom properties, and a
 * thin React wrapper that types those properties. Add an effect here rather
 * than inlining a gradient in a route — Foundations/Effects in Storybook is the
 * catalogue, and it can only show what lives in this folder.
 */
export { AmbientMesh, type AmbientMeshProps } from "./ambient-mesh";
export { AmbientGlow, type AmbientGlowProps } from "./ambient-glow";
export { MediaSweep, type MediaSweepProps } from "./media-sweep";
