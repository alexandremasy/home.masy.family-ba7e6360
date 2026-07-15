---
name: pageheader-bleed-gotcha
description: PageHeader bleeds edge-to-edge via negative margins — its `variant` must match the shell's padding or the page scrolls sideways
metadata:
  type: project
---

`components/PageHeader.tsx` makes its blurred sticky background span edge-to-edge with **negative
margins that cancel the shell's horizontal padding**. That coupling is invisible and silent.

- `variant="overlay"` (default) — for the overlay panel (`px-5 py-7 sm:px-8 sm:py-10`)
- `variant="page"` — for the full-bleed shell in `_app.tsx` (`px-4 py-6 sm:px-6 sm:py-10`)

Use the wrong one and the header overshoots by the padding difference (8px with the defaults), giving
a **horizontal scrollbar that only appears once the viewport stops absorbing it** — invisible above
~1440px because `max-w-7xl` caps the main, visible at 1280. Bit both `/repas` and `/securite` on
2026-07-15 after they moved to full-bleed (see [[dashboard-layout-conventions]]).

**Rule: moving a route into `isFullBleed` also means flipping its PageHeader to `variant="page"`.**
Check with a 1280-wide screenshot, not by eye at full width.
