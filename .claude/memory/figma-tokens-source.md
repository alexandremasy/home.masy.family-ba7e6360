---
name: figma-tokens-source
description: Design tokens have a source of truth outside the code — Alex's Figma library, not styles.css
metadata:
  type: reference
---

**The tokens live in Figma, not in the repo.** Library: *alexandremasy — tokens*, node `503-473`.

https://www.figma.com/design/CZN7PhcXM5pna3826ZcejS/alexandremasy---tokens?node-id=503-473

Read it with the Figma MCP: `get_variable_defs` with `fileKey: CZN7PhcXM5pna3826ZcejS`,
`nodeId: 503:473`. It returns the type styles as `Regular/16`, `Semi-Bold/24`, etc.

What it carries (as of 2026-07-16): **Barlow**, two weights only — Regular 400 and Semi-Bold 600 —
sizes **10·12·14·16·20·24·28·32·40·48·56**, lineHeight 1.25 flat, letterSpacing 0. Plus a few
`Colors/Light/*` greys.

**Why this matters**: `styles.css` is a *port*, not the origin. Before inventing a token — a size, a
weight, a step — check this file first. Inventing one and naming it well is still inventing it;
that's the mistake that produced `text-2xs`/`text-3xs` (10/11px) when Figma's floor is 12.

**Known divergences the code owns on purpose** (documented in `DESIGN-SYSTEM.md` and on
`/design-system`): line-heights keep Tailwind's rhythm because Figma's flat 1.25 is unreadable at
12px, and `tracking-eyebrow` (0.18em) survives Figma's letter-spacing 0 because the brand set has
no eyebrow pattern. Colours are NOT ported — the app's palette is its own; see [[palette-semantics]].

**Open**: Figma needs `Regular/10` + `Semi-Bold/10` added — the code already uses 10px for ~62
eyebrows on Alex's decision (2026-07-16). Until then, the code is one step ahead of the file.
See [[design-system-state]].
