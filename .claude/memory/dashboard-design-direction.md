---
name: dashboard-design-direction
description: Alex's design vision for the Maison dashboard refactor (product nature, attention model, visual language, module nav)
metadata:
  type: project
---

Direction set 2026-07-15 for reworking the mockup's home dashboard (`_app.index.tsx`
Dashboard, rendered under `_app.tsx` layout). Alex is designing this as its owner — this is
co-build, propose structure and challenge.

**Product nature.** The Maison dashboard is consulted **on a voluntary basis** — you go to it
when you want, it's not an always-on monitoring wall. The layout must evolve to reflect that.

**Attention model (the core shift).** More space, less "in your face" on arrival. On landing you
should see **the few things that actually deserve attention**, then **living access points to the
system's modules** — not the whole bento dumped at once. Today the home mixes everything (rooms +
energy + security + network + tesla + appliances) as one flat bento → too much at once.

**Visual language.** The current base (cream / serif / editorial) is good but lacks **humanity,
depth, and a sense of atmosphere**. Target: **minimalist Nordic**, simple, with a **touch of
Apple "liquid glass"** (translucency, layering, soft depth) — not a full glassy iOS clone.

**Navigation = by module.** Distinct modules, each its own space. The **Accueil module** is the
default landing (the bento home) and must give **fast access to house control**. Other modules
(Budget already a full-bleed world; Énergie, Sécurité, Réseau, Bernard/mobility, Maison-life =
repas/courses/anniversaires per [[live-access-and-brief-workflow]]'s MAISON-BRIEF) reached via a
clearer module nav. Current nav (TopNav): Pièces · Maison · Bernard · Réseau · Énergie · Sécurité,
with non-home routes opening as blurred overlays over the home — that overlay-return-to-home
pattern is the seed of "module nav" but needs to be made explicit and calmer.

**Working mode:** prototype V2 in the live mockup, screenshot (see [[live-access-and-brief-workflow]]),
iterate. Align the module taxonomy + nav paradigm before coding the big refactor — it's structural.
