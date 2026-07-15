# Design system — refactoring plan

Audited 2026-07-15. **Decision: shadcn/ui is the system. Not optional.**
The rule from here on: *use it, extend it, never re-invent it.*

Everything below is measured, not estimated. Commands to reproduce are in each section.

---

## 0. Why nobody uses the library (the root cause)

The library is not ignored out of laziness — **it is broken against this project's palette.**

`components/ui/button.tsx` was written against shadcn's *default* token semantics, where `accent`
is a subtle neutral hover. This project redefined `accent` as **mustard** (`oklch(0.78 0.12 70)`,
`styles.css:78`). Result, verified in the browser on `/repas/plats/chili`:

```
outline Button, at rest  → lab(98.3 -0.2 3.0)     (background)
outline Button, on hover → lab(74.3 18.1 48.7)    ← identical to --accent, i.e. MUSTARD
```

Four of the six variants are unusable as-is:

| Variant | Ships as | Reality here |
|---|---|---|
| `default` | `bg-primary` (teal) | The app's CTA is `bg-foreground` (inverted black) — 9 hand-made copies |
| `outline` | `hover:bg-accent` | Mustard hover |
| `ghost` | `hover:bg-accent` | Mustard hover |
| `link` | `text-primary` | OK |
| `secondary` / `destructive` | — | OK, and `destructive` has **0 usages** |

**This is the whole reason adoption stops at `/repas`.** Budget (39 buttons), Énergie (5) and
Sécurité (4) never import it. Fix this first, or every migration below fails.

**shadcn is copy-paste: we own `ui/*`.** Re-tokenising it is not a hack — it is the intended use.

---

## Phase 0 — Re-tokenise the primitives · **blocks everything else**

1. **`ui/button.tsx`**
   - Replace `hover:bg-accent hover:text-accent-foreground` (variants `outline`, `ghost`) with a
     neutral hover: `hover:bg-secondary hover:text-foreground`.
   - Add the variant the app actually uses everywhere:
     `inverted: "bg-foreground text-background shadow hover:bg-foreground/90"`.
     Do **not** repaint `--primary`: it is the teal signal (today's ring, `StatusPill`, links) and
     recolouring it would repaint the whole app.
   - Keep `default` = teal for the rare true-primary case.
2. Sweep the same `hover:bg-accent` assumption across the other `ui/*` in use
   (`dropdown-menu`, `select`, `tabs`, `dialog`, `alert-dialog`).
3. Ship nothing else in this phase. Verify a hover in both themes before moving on.

---

## Phase 1 — Adopt what already exists (zero new dependency)

Every package below is **already in `package.json`**, including `vaul` and
`@radix-ui/react-navigation-menu`. Nothing to install.

| Component | Status | Real call sites |
|---|---|---|
| `ui/button` | 11 usages | **72 raw `<button>`** — see Phase 2 |
| `ui/checkbox` | **dead** | `budget.transactions.tsx:141,164` (raw, and the header checkbox has no indeterminate state Radix would give free), `repas.courses.tsx:121` (a checkbox faked with a `<button>`) |
| `ui/label` | **dead** | 10 hand-made labels, **6 different formulas** |
| `ui/select` | 1 usage | **11 native `<select>`**, 4 visual formulas |
| `ui/radio-group` or `ui/toggle-group` | **dead** | **6 exclusive-choice groups** built from `<button>`, none with `role="radiogroup"` or keyboard nav: `DishForm` ×6, `budget.mensuel:73/77`, `budget.import:91/93`, `securite.etat:100` |
| `ui/table` | **dead** | `budget.transactions.tsx` hand-rolls a table |
| `ui/progress` | **dead** | 3 copies of the budget progress bar (`budget.mensuel:374`, `budget.vue:580,643`) |
| `ui/sheet` | **dead** (wraps Radix Dialog) | The overlay in `_app.tsx:82-103` **is** a hand-built sheet — backdrop, z-40, close pill — and it is duplicated verbatim in `budget.vue.reserve.tsx:96-102,237` |
| `ui/drawer` | **dead** (wraps `vaul`) | The meal picker on mobile: today a Dialog forced to 91dvh anchored at `top-14`, fighting a close button pinned at `-top-12`. A Drawer is that, natively, with drag-to-dismiss |

### Not a fit — do not force it
- **`ui/navigation-menu`** — Radix's mega-menu with a viewport/motion layer. `TopNav` is pills plus
  one dropdown; `DropdownMenu` is already the right tool. Using NavigationMenu would add weight for
  nothing. *(Named as attractive, but it is not the shape of this nav.)*
- **`ui/command`, `ui/skeleton`, `ui/carousel`, `ui/chart`** — no call site. A mockup has no loading
  states and no command palette. Leave dead or delete.
- **`ui/card`** — dead **and** a naming trap: `components/Card.tsx` (exports `Tile`, `Section`,
  12 importers) is a *different file*. Delete `ui/card.tsx` rather than let the confusion live.

---

## Phase 2 — The three components that are ours, not shadcn's

shadcn has no opinion on these; they are this app's own vocabulary. Building them is not
re-inventing — leaving them unbuilt is what caused the drift.

| Component | Absorbs | Current drift |
|---|---|---|
| `Eyebrow` | **132** usages / 23 files | **5** tracking values: 0.12 / 0.14 / 0.16 / 0.18 / 0.22em |
| `Panel` | **21** clones of `Section` | 4 paddings (`p-3`/`p-4`/`p-5`/`p-6`) for one role |
| `StatTile` | **7** implementations | `Kpi`, `BigStat`, `SmallStat`, `Stat`, `HealthStat`, + 2 inline — each redeclaring its own tone union |

Then the button families, in order of safety:
- **14 round icon buttons** → `<Button variant="outline" size="icon" className="rounded-full">`
  (fixes `h-9` vs `h-8` drift, and a real bug: `disabled:hover:bg-transparent` exists on exactly one
  of six disabled chevrons)
- **3 buttons in `__root.tsx`** → they copy `buttonVariants` *word for word*. Pure scaffold.
- **9 primary CTAs** → `variant="inverted"` once Phase 0 lands (today: **6 paddings**, 3 text sizes)

Legitimately out of `<Button>`'s scope, leave them: filter chips (toggle state is the point, no
`pressed` variant exists), clickable cards, external service links, the overlay close pill
(that one wants a shared `OverlayCloseLink`).

---

## Phase 3 — Give `warm` back to alerts

`warm` is the alert token. **~120 usages, ~6 are alerts.**

On budget it is the colour of *"Dépenses"* — so a real overrun (`budget.vue.tsx:566`) is the same
colour as the normal total right above it. `budget.annuel.tsx:193` tints **every** non-income entry:
a paid rent is red. `anniversaires.index.tsx:18` tints the happiest card in the app.

Meanwhile `accent`, the decorative token, has **4** usages. The decorative slot is empty and the
alert slot is saturated.

- Data series (Dépenses, curves, envelopes) → `accent` / `primary`.
- Keep `warm` for: security to-check, low tank, budget overrun, coherence warnings.
- Trap while doing it: `--warm-foreground` **inverts** between themes (near-white in light, navy in
  dark) and `--accent-foreground` is navy in **both**. They only work on a *solid* `bg-warm` /
  `bg-accent` fill. For text use `text-warm` / `text-accent`. 12 sites are currently at risk,
  e.g. `room.$roomKey.tsx:13`.

---

## Phase 4 — Delete

- `components/ServicesGrid.tsx` — 131 lines, **0 imports**, carries 11 custom SVG glyphs and 11
  out-of-system oklch literals.
- `ui/card.tsx` + the ~28 other never-imported `ui/*`.
- 7 dead CSS classes in `styles.css` (`.anim-shimmer`, `.reveal`, `.page-enter`, `.anim-blink`,
  `.anim-spin-slow`, `.anim-swing-hover`, `.bg-mesh-anim`).
- `selectCls` (`DishForm.tsx:38`) — declared, never referenced.

---

## The rule going forward

1. Need a control? **Check `components/ui/` first.** 33 of 46 are dead — the answer is probably
   already there.
2. It exists but does not fit the palette? **Edit `ui/*`.** We own it. Do not build a sibling.
3. It is genuinely this app's own vocabulary (Eyebrow, Panel, StatTile, DishCard)? Build it **once**,
   in `components/`, and share it.
4. Never a fourth path.

## Order, and why

Phase 0 first — nothing else is possible while 4 of 6 button variants are wrong.
Phase 3 (`warm`) is the biggest *meaning* gain and the biggest diff; it is independent of the rest
and can run in parallel.
Phases 1 and 2 are mechanical and low-risk.
Phase 4 is free.
