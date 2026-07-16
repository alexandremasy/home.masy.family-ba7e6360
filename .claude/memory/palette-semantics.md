---
name: palette-semantics
description: What each colour token MEANS in the mockup, now mapped to Figma rungs — warm is the alert tone, accent foregrounds are dark in both themes
metadata:
  type: project
---

The tokens in `src/styles.css` carry meaning, not just hue. Picking one for its look misreads the UI.
Since 2026-07-16 the **light theme is ported from Figma** (see [[figma-tokens-source]]): the hex in
`:root` *is* the token, with the rung named in a comment. The **semantics below are the app's** —
Figma ships only primitive ramps.

- **`warm`** = Orange/40 `#e07e62` — **the alert tone, nothing else.** Coherence warnings, "relevé à
  saisir", anything off. Never a plain highlight: Alex flagged weekend cells and "à écouler" cards as
  *"le rouge/orange n'est pas bon ici"* — neutral facts wearing an alarm.
- **`primary`** = Teal/60 `#1995a0` — the positive signal: today's ring, active, links, "à écouler".
- **`mustard`** = Yellow/50 `#dab12c` — decorative warmth (lights on, PMC tile) + data series.
- **`success`** = Green/50, **`destructive`** = Red/50 (NOT Orange — warm owns the orange family).

**Foregrounds no longer invert.** Since the port every accent foreground is **Light/90 (dark)** in
both themes — chosen for contrast (warm 6.4:1, mustard 9.0:1, teal 5.1:1; white on teal was 3.49:1,
under AA). So teal fills now carry **dark** text. The old "warm-foreground inverts" trap is gone. One
rule remains: a `-foreground` only works on its own *solid* fill; on a tint like `bg-warm/15` use
`text-warm`.

**The dark theme is NOT ported** — the library has no dark ramp, so `.dark` stays invented
(navy-tinted). It's the only invented block left in `styles.css`. Closing it means adding a Dark ramp
in Figma; inverting the Light ramp was declined (costs the dark theme its temperature).

**Always screenshot both light AND dark** — contrast bugs are invisible in one of them. See
[[live-access-and-brief-workflow]].
