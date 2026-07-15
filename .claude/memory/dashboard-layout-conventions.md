---
name: dashboard-layout-conventions
description: The mockup's two implicit layout rules — the bento unit, and mode (full-bleed) vs overlay
metadata:
  type: project
---

Two conventions that are real but written nowhere; both cost several round-trips to discover.

**1. The bento unit is `col-span-2`, not `col-span-1`.**
`.grid-bento` (src/styles.css) is 2 / 4 / 6 columns (mobile / sm / lg). A room card (Salon, Bureau)
spans **2 columns** — that is "one cell". `col-span-1` therefore renders as a **half cell**, which
looks broken next to the rooms. Anything meant to sit alongside the rooms (weather, the idle-rooms
slot) must be `col-span-2`. Alex's phrasing: *"là c'est 1 + 1/2"*.
Note `grid-auto-flow: row dense` — a narrow tile will silently back-fill an earlier hole.

**2. A "mode" is a full-bleed world; everything else is an overlay.**
`_app.tsx` splits on this: routes in a mode render full-bleed with the TopNav visible; every other
route opens as an **overlay (z-40) above the blurred dashboard** — and that overlay **covers the
TopNav (z-30)**. So a module can only show its own tabs in the TopNav if it is full-bleed.
- Modes live in `ModeSwitcher.tsx` → **Maison · Sécurité · Budget** (Médias/Veille = "Bientôt").
- A mode's tabs live in `TopNav.tsx` (`budgetTabs`, `securiteTabs`); `items` picks them by pathname
  and replaces the domain list.
- Sécurité was made a mode on 2026-07-15: layout `_app.securite.tsx` + `/securite` → redirect to
  `/securite/etat`, tabs **État · Périmètre · Activité**. It is NOT in the Maison nav any more.
- Maison's nav = Pièces · Repas · Courses · Anniversaires · Bernard · Réseau · Énergie — all in the
  TopNav, all full-bleed. **There is no `/maison` URL segment** (flattened 2026-07-15: `/repas`,
  `/courses`, `/anniversaires`; the `_app.maison.tsx` layout and its inner tab nav are gone).
  Maison is the mode, not a path — never reintroduce it into a URL.
- `isFullBleed` in `_app.tsx` is an explicit prefix list. **Adding a route to the Maison nav means
  adding its prefix there**, or it opens as an overlay and its page reads as a modal.

**Idle rooms rule:** a room with `!lightsOn && !occupied` gives up its own slot — the idle ones share
one `col-span-2` cell, each still its own card with a 3px border (not a merged group).

**Meal plan gotcha:** `WINDOW_START = addDays(TODAY, 1)` — the plan starts **tomorrow** by design,
so "today" is always empty on the home. Don't treat it as a bug. See [[mock-data-is-not-the-brief]].
