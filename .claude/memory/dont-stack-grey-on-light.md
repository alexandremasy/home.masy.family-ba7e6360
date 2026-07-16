---
name: dont-stack-grey-on-light
description: Design preference — don't stack a grey/muted fill on the already-light page; let elements sit on the page colour, reserve white/tint for emphasis
metadata:
  type: feedback
---

Alex, twice on the Repas planner (2026-07-16): a muted/grey fill I'd added on top
of the page got pulled back to the page colour — first the past day cells
(*"le fond de la page est déjà en gris clair, ne mets pas de couleurs"*), then the
table's weekday header (*"le header du tableau doit aussi être dans la couleur de
fond"*).

**Why:** the light background (`--background`, Light/00) already reads as a soft
grey. Stacking `bg-secondary`/`bg-muted` on it is visual noise — a tinted band or
block where none is needed. Structure should come from hairlines and type, not an
extra fill.

**How to apply:** default surfaces to the page colour. Spend a fill only where it
earns emphasis — e.g. white (`bg-card`) marks the *active* zone (today onward),
while the past and the chrome (headers) just take the page. When in doubt, no fill.
Contrast the light theme against dark, where `card` vs `background` separates
cleanly on its own. See [[palette-semantics]].
