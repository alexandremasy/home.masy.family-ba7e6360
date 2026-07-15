---
name: palette-semantics
description: What each colour token MEANS in the mockup — warm is the alert tone, and accent/warm foregrounds are dark in both themes
metadata:
  type: project
---

The tokens in `src/styles.css` carry meaning, not just hue. Picking one for its look misreads the UI.

- **`warm`** (terracotta, hue 35) — **the alert tone.** Coherence warnings, "relevé à saisir", anything
  that wants attention because something is off. Never use it to merely highlight: Alex flagged
  weekend cells and "à écouler" cards as *"le rouge/orange n'est pas bon ici"* — both were neutral
  facts wearing an alarm.
- **`primary`** (teal, hue 195) — the app's own signal: today's ring, active state, positive
  highlight. This is the right token for "notice this", and what "à écouler" now uses.
- **`accent`** (mustard, hue 70) — decorative warmth (lights on, PMC tile).
- **`success`** / **`destructive`** — as named.

**Trap: the `-foreground` tokens only work on a *solid* `bg-accent` / `bg-warm` fill**, and the two
behave differently — measured in `styles.css`:

| Token | light | dark |
|---|---|---|
| `--accent-foreground` | navy `0.22` | navy `0.18` — **navy in both** |
| `--warm-foreground` | near-white `0.99` | navy `0.18` — **it inverts** |

So `text-accent-foreground` on a card vanishes in dark mode, while `text-warm-foreground` off a solid
fill is invisible in *light* mode and flips meaning at the theme switch. For text, use `text-warm` /
`text-primary` / `text-accent` — never the `-foreground` pair unless the element owns a solid fill.

**Always screenshot both `colorScheme: light` and `dark`** — this class of bug is invisible in light
mode. See [[live-access-and-brief-workflow]].
