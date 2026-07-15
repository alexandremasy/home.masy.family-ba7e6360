---
name: design-system-state
description: The mockup has a shadcn dump, not a design system — 33/46 ui/ components are dead and most UI is hand-rolled markup
metadata:
  type: project
---

Audited 2026-07-15. Before adding UI, know what's actually shared — the `ui/` folder is
misleading.

**33 of 46 `src/components/ui/*` are never imported.** They are Lovable's shadcn scaffold, not
choices. Only these are real: `button`, `input`, `dialog`, `dropdown-menu`, `tabs`, `tooltip`,
`switch`, `badge`, `select`, `alert-dialog`, `slider`, `sonner`, `textarea`.

**The hand-rolled majority** (measured, not guessed):
- 72 raw `<button>` vs 12 `<Button>` — the component is the exception
- 1 `<Badge>` usage (inside `DishCard`); 9 pills hand-built elsewhere
- 31 hand-built card shells (`rounded-2xl border border-border/60 bg-card`), 13 sharing one
  copy-pasted class string
- 11 native `<select>` although `ui/select` (Radix) exists
- 132 uppercase "eyebrow" labels across 23 files with **5 different tracking values**
  (0.12 / 0.14 / 0.16 / 0.18 / 0.22em) — one role, five looks, no component

**Naming trap:** `components/Card.tsx` (exports `Tile`, `Section`, 12 importers) is NOT
`components/ui/card.tsx` (exports `Card*`, zero importers, dead).

**Real shared components** worth reusing: `Tile`/`Section` (components/Card.tsx), `DishCard` +
`StatusPill`, `DishFilters`, `PageHeader` (mind [[pageheader-bleed-gotcha]]), `WeatherIcon`,
`DishForm`.

The three that would absorb the most drift if they existed: **Eyebrow** (132), **Panel** (31),
**IconButton** (7 identical round nav buttons). See [[palette-semantics]] for the colour side.
