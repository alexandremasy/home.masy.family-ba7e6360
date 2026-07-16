---
name: design-system-state
description: shadcn/ui IS the mockup's design system and the refactor landed — use it, extend ui/*, never build a sibling
metadata:
  type: project
---

Audited 2026-07-15, refactored 2026-07-16. **shadcn/ui is the system, not an option.** The full
record (what was broken, what was measured, what was deliberately not done) is in
`DESIGN-SYSTEM.md` at the repo root — read that before changing anything structural.

**Current state**: 19 `ui/*` primitives, all live. 39 `<Button>`. 0 native `<select>`. The
overlay runs on Radix Dialog, the mobile picker on vaul Drawer.

**The four paths, in order:**
1. Need a control? Look in `src/components/ui/` first.
2. It exists but fights the palette? **Edit `ui/*`** — shadcn is copy-paste, we own that code.
3. Genuinely this app's own vocabulary? Build it **once** in `components/`, share it: `Eyebrow`,
   `Panel`/`Section`/`Tile`, `DishCard`+`StatusPill`, `BudgetBar`, `OverlayCloseLink`, `DishForm`,
   `DishFilters`, `PageHeader`, `WeatherIcon`, `CommandButton`.
4. There is no fourth path.

**Type**: the scale is **ported from Figma** — *alexandremasy — tokens*, node `503-473`, the source
of truth. Barlow, 10·12·14·16·20·24·28·32·40·48·56. `styles.css` wipes Tailwind's scale
(`--text-*: initial`) and declares only these, so `text-7xl`/`text-[13px]` don't exist rather than
being discouraged. **Names are Tailwind's, values are Figma's — they disagree by one rung:
`text-xl` is 24px, not 20.** Read the value, not the name. Two deliberate divergences: line-heights
keep Tailwind's rhythm (Figma's flat 1.25 is unreadable at 12px), and `tracking-eyebrow` (0.18em)
survives Figma's letter-spacing 0 because the brand set has no eyebrow. Use `<Eyebrow>`, never the
classes. Open gap: 62 `font-medium` (500) remain, and Figma has only 400/600.

**Language**: the product UI is **French** (a French household's dashboard — that's content, and
the routes `/repas`, `/plats` are French on purpose, so their derived identifiers are too).
Everything else — comments, docs, the `/design-system` page — is **English**.

**Naming trap:** `components/Card.tsx` (exports `Tile`, `Section`, `Panel`) is NOT
`components/ui/card.tsx` — the latter was deleted precisely because the confusion was live.

**Lint is not a gate here**: the repo carries ~2200 eslint errors on `main`, all prettier
formatting, because Lovable generates unformatted code and the linter has never been run. Don't
read a red `bun run lint` as your regression.

See [[palette-semantics]] for the colour side and [[pageheader-bleed-gotcha]] for `--nav-h`.
