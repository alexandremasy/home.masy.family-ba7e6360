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

What it carries (as of 2026-07-16):
- **Type** (node `503-473`): **Barlow**, two weights — Regular 400, Semi-Bold 600 — sizes
  **10·12·14·16·20·24·28·32·40·48·56**, lineHeight 1.25 flat, letterSpacing 0.
- **Colour** ("Colors" page, node `0-1`): nine **primitive** ramps — Light, Red, Orange, Yellow,
  Green, Blue, Teal, Purple, Pink — each `00`→`90`. No semantic tokens, no dark ramp. Read a full
  ramp with `get_screenshot` (the variable API drops rungs not bound to a variable, e.g. Orange/40).

Both type and colour are **ported into `:root`** — the hex/size *is* the token, rung named in a
comment. The semantics (which rung is `primary`, `warm`…) are the app's, not Figma's. The dark theme
is the one thing NOT ported: the library has no dark ramp. See [[palette-semantics]].

**Why this matters**: `styles.css` is a *port*, not the origin. Before inventing a token — a size, a
weight, a step — check this file first. Inventing one and naming it well is still inventing it;
that's the mistake that produced `text-2xs`/`text-3xs` (10/11px) when Figma's floor is 12.

**Known divergences the code owns on purpose** (documented in `DESIGN-SYSTEM.md` and on
`/design-system`): line-heights keep Tailwind's rhythm because Figma's flat 1.25 is unreadable at
12px, and `tracking-eyebrow` (0.18em) survives Figma's letter-spacing 0 because the brand set has
no eyebrow pattern. Colours are NOT ported — the app's palette is its own; see [[palette-semantics]].

**Don't over-index on this file.** "Ne te tracasse pas tant de Figma" (Alex, 2026-07-16). It is the
reference to check before *inventing* a token — not a spec to chase pixel-for-pixel. Alex settles
the gaps himself and fast: 500 → 600, no debate. Read it, then ask him, don't agonise.

**Open**: Figma needs `Regular/10` + `Semi-Bold/10` added — the code already uses 10px for ~62
eyebrows on Alex's decision (2026-07-16). Until then, the code is one step ahead of the file.
See [[design-system-state]].
