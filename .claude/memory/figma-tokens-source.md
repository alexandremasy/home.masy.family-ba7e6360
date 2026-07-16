---
name: figma-tokens-source
description: Figma is a one-way REFERENCE for the mockup's tokens, not a linked source — the code is the source of truth; nothing flows back to Figma
metadata:
  type: reference
---

**Figma is a reference, not a link.** Alex has a token library (*alexandremasy — tokens*,
`fileKey: CZN7PhcXM5pna3826ZcejS`) — type on node `503-473`, colour on the "Colors" page `0-1`. You
consult it when you'd otherwise *invent* a token, so the mockup borrows real values instead of made-up
ones. That's the whole relationship.

**The code is the source of truth.** `styles.css` is not a copy of Figma that must be kept in sync.
There is no reconciliation, no drift-back, no todo that flows to Figma. NEVER tell Alex "the code is
ahead of the file" or "Figma still needs X added" — he has said repeatedly the two are **not linked**
("ce n'est pas lié", 2026-07-16). If the code uses a value the library doesn't have (10px eyebrows,
the dark theme), that is simply the mockup's own decision, finished — not a gap owed to anyone.

Read type with `get_variable_defs`; read a full colour ramp with `get_screenshot` (the variable API
drops rungs not bound to a variable, e.g. Orange/40).

What was borrowed (2026-07-16): Barlow, weights 400/600, sizes 10·12·14·16·20·24·28·32·40·48·56;
and the light palette (nine primitive ramps → `:root`, rung named in a comment). The dark theme and
the eyebrow's line-height/tracking are the app's own calls, not Figma's — see [[palette-semantics]]
and [[design-system-state]]. All of it lives in the code now; don't re-open it against Figma.

**Tone**: "Ne te tracasse pas tant de Figma." Check it before inventing, then move on. Alex settles
gaps himself and fast (500 → 600, no debate). Don't chase pixel parity and don't hand him Figma
chores.
