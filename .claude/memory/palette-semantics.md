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

**Trap: `--accent-foreground` and `--warm-foreground` are dark navy in BOTH light and dark themes.**
They are designed to sit on a *solid* `bg-accent` / `bg-warm` fill. Put `text-accent-foreground` on a
card (`bg-accent/[0.07]`) and it vanishes in dark mode. Either use a solid fill with its own
foreground, or a token whose text form works on the card (`text-warm`, `text-primary`).

**Always screenshot both `colorScheme: light` and `dark`** — this class of bug is invisible in light
mode. See [[live-access-and-brief-workflow]].
