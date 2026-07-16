---
name: mirror-sibling-patterns
description: before composing any new UI construct, find the sibling route/component that already does it and copy its shape — don't invent
metadata:
  type: feedback
---

"Nous avons un design system, arrête d'inventer des choses." (Alex, 2026-07-16) — said after I
built a custom underline tab bar and hand-rolled form fields for the Anniversaires screens.

**Why:** the system is not just the `ui/*` primitives ([[design-system-state]]) — it's also the
**composition patterns** already established at the route level. Reinventing them reads as sloppiness
even when the primitives are correct.

**How to apply:** before building any construct (tabs, a form, a list, an edit page), grep for a
route/component that already does the same job and mirror it exactly:
- **Routed tabs inside a screen** → `_app.repas.tsx`: `Tabs`/`TabsList`/`TabsTrigger` driven by the
  pathname + `navigate`, with `<PageHeader title=… variant="page" />`. A section's tabs live
  IN the screen, not in the TopNav (that pattern is for a full "mode" — see [[dashboard-layout-conventions]]).
- **A form** → `DishForm.tsx`: `Field` (a `<label>` + `<Eyebrow size="xs" as="span">`) for inputs,
  `FieldGroup` (a `<div>`, never a `<label>`) for button-driven controls like `Select`/segmented,
  `Segmented` on `ToggleGroup` for either/or axes.
- **An edit page** → `_app.repas.plats.$dishId.tsx`: back-link, `bg-card` box with a name + destructive
  `Button variant="outline"`, the form, and **deletion behind an `AlertDialog`** (never a bare remove).
- `cap` is exported from `@/lib/utils` — don't redefine it inline.
