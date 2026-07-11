# Planification — Implementation Brief

Handoff for building the **real** budget Planification. This repo is a **design mockup** (100% frontend-mock, no persistence) that validated the UX + logic. Reproduce the model; build the data layer that's missing here.

**Reference implementation in this repo:**
- `src/lib/budget-data.ts` — all the logic (functions listed below), the taxonomy seed, the mock réel generator.
- `src/routes/_app.budget.planification.tsx` — the validated UI (table + modal + mobile + header).
- **`Budget-2024.xlsx`** (Alex's real spreadsheet) — the ground truth. Tab **📅** = annualisation per poste; tab **🌅** = the equilibrium/forecast. The full ~100-poste taxonomy lives there.

---

## The model — reproduce exactly

**A poste = a `(catégorie, sous-catégorie)` pair. It has two faces:**
- **Prévu** — hand-set: `montant` + `périodicité` (Mensuelle/Trimestrielle/Annuelle/**Ponctuel**/Au besoin) + `échéance` (anchor month for non-monthly). **No auto-derivation** — the user types it, a few times a year. Périodicité is manual too.

**Ponctuel — dated, per-hit amounts (primes).** The 4 smoothable cadences are `montant × even spread`; they can't express a lump that lands on a *specific* month, still less several lumps at different months with different amounts (pécule in May, 13e mois in December). "Ponctuel" replaces the single amount with a list of `occurrences: [{ mois, montant }]`. Model rules: (1) it **enters the annual equilibrium** — it's predictable, unlike Au besoin; (2) it is **never provisioned** — income lumps *fund* the year, they aren't smoothed like outgoing lumps (a Ponctuel *dépense* would be provisioned like Annuelle/Trimestrielle, since it's a predictable outgoing lump); (3) the poste's annual prévu = `Σ occurrence amounts` (its `amount` field is unused); (4) `months` mirrors the occurrence months, driving the strip tinting. **This is the raw material of the liquidity forecast** (see the known-model-limit paragraph): a datable income spike is exactly what the month-to-month coverage view needs.
- **Réel** — aggregation of imported iSaveMoney transactions matching that `(cat, sous-cat)`, per month (the 12-month strip).
- **Écart = prévu − réel** is the only signal. The réel never drives the prévu; it sits beside it for comparison.

**Fixed system taxonomy (NOT derived from the import).** The import *maps* transactions into this fixed list — if the taxonomy floated with the import, the mapping rules collapse. Three families:
- **Entrées** — income postes (Salaires, Allocations, Pension alimentaire, Pécule, Prime…). The plan needs a revenue side; income is planned, not a constant.
- **Sorties** — the dépense categories (Logement, Famille, Déplacements, Nourriture, Santé, Cadeaux, Divers), each with sous-groupes › postes.
- **Épargne** — savings **targets** you set (Projets, Loisirs, Pension). **Logic B**: you declare the target, the plan checks it fits.

**Annualisation provision** = `(Σ annuel + Σ trimestriel dépenses) / 12`. The sinking fund. **Excludes "Au besoin"** (unpredictable — never smoothed) **and Mensuel** (already flat). This is the plan's key actionable output ("X €/mois à mettre de côté").

**Equilibrium (ANNUAL — it's a yearly budget):**
`Entrées − Dépenses − Épargne cibles = Marge` (all summed over the year, each poste in its own cadence). `Marge < 0` → the plan over-commits ("dans le rouge"). **Au besoin is excluded** from the equilibrium — it hits the margin when it lands. Provision is a *sub-component* of Dépenses (its non-mensuel part), surfaced separately as info, NOT a fourth subtraction.

**Écart tint inverts by family:** for Sorties, over prévu = bad (spent more). For Entrées/Épargne, over = good (earned/saved more).

**Cross-domain signal (the one bit of intelligence):** Mazout is `Annuelle` (provisioned). The oil-tank level from the énergie domain is surfaced as a **signal** beside the poste ("cuve 22%, un plein approche"), **never auto-injected** — the user adjusts the échéance. Generalizes to any poste with a physical state.

**The plan is calendar-annual — there is no rolling plan.** Editing the plan is always scoped to a civil year (Jan→Déc): the equilibrium and the annualisation provision (`Σ échéances / 12`) only mean something over a calendar year — you can't smooth échéances over a moving window. So the Planification screen has NO rolling toggle. The **rolling view is a read concept** and lives in the Vue d'ensemble / Mensuel (réel over the last 12 months). Its one coupling to the plan: to show the *expected prévu* over a rolling window (e.g. in July 2026: Aug 2025 → Jul 2026), you reconstruct it month-by-month, each month pulling its échéance from **the plan of the calendar year that month belongs to** (5 months of the 2025 plan + 7 of the 2026 plan). That reconstruction is impossible without per-year persistence (see BUILD #1). The provision stays calendar-annual; in rolling view you compare réel against the expected monthly prévu, not against a "rolling provision" (which would be meaningless).

**Known model limit (why the forecast matters):** the annual equilibrium can be green while you're cash-short in a given month (a big bill lands before its provision accumulated). The plan proves the year balances on average, not month-to-month liquidity. → the **forecast** (coverage of upcoming échéances) is a **modelization on top of this plan, shown in the Vue d'ensemble** — NOT a separate screen.

**Plan lifecycle — autonomous close, four states.** A year's plan moves through: **draft** (next year, editable) → **current** (editable) → **closing** (civil year over) → **archived** (frozen, read-only). The key split: **prévu freezes automatically** the moment the year ends — what you planned for 2026 *was* your 2026 plan, and letting it stay editable would silently rewrite history and corrupt the rolling-prévu reconstruction (see rolling paragraph). **Réel needs a correction window** though: December's transactions land mid-January via the import, and a bad transaction (wrong amount, duplicate, mis-mapped poste) must be fixable before the year freezes. That correction lives in the **transactions/import layer**, not the plan — you fix the transaction (or its mapping) and the poste's réel re-aggregates. So the **closing** state = prévu already frozen, transactions still editable.

The freeze is **autonomous by default** — the system closes the year on its own; no mandatory ritual. It can't detect a bad transaction itself (a wrong amount is still a valid number), so it can't freeze on a pure technical signal — it freezes after a **grace window** (e.g. end of February) unless you close earlier. An optional manual **"boucler {year} maintenant"** just brings the freeze date forward; it's never the *condition* for it. Reopening an archived year is possible but **exceptional and logged** (friction on purpose), never a normal mode — otherwise "archived" means nothing.

---

## Functions to port (from `budget-data.ts`)

- `type PlanKind = "entree" | "depense" | "epargne"`, `type PlanRecurrence = Recurrence4 | "Ponctuel"`, `type PlanOccurrence = { m, amount }`, `type PlanPoste` (id, cat, group, label, amount, recurrence, months[], occurrences?, sensor?)
- `planPosteYear(poste)` — annual prévu: `Σ occurrences` for Ponctuel, `amount` for Au besoin (envelope), else `amount × months.length`. Used by the cascade and the écart.
- `planKindOf(poste)` — family of a poste (via the fixed `PLAN_CATS` map)
- `annualisationProvision(postes)` — `Σ (Trimestrielle|Annuelle) amount×months.length / 12`
- `planCascade(postes)` — returns `{ entrees, depenses, epargne, marge, provision, auBesoin }` (annual €, provision monthly)
- `posteMonthly(poste)` — the 12-month réel (MOCK here; replace with real aggregation from imported transactions). **Réel is IMPORTED data — it must be independent of the prévu.** In the mock it anchors to the poste's seed baseline (`baselinePoste`), so editing the prévu never moves the réel (only the écart shifts). The real impl reads transactions; the invariant is the same.
- `prevuMonthly(poste)` — the prévu spread over 12 months (flat for Mensuelle, dated for Ponctuel, occurrence-months for Trim/Annuelle, **empty for Au besoin** — no schedule). Drives the modal's prévu row.
- `planReelYear(poste)` / `planReelMedian(poste)` — annual total + median-over-hit-months. The table's Réel column shows **both**; the écart is on the annual basis (`planReelYear − planPosteYear`), tinted by family (over = bad for dépenses, good for entrées/épargne, neutral within ±5%).
- `planPostePrevYear(poste, year)` — the same poste one year earlier, to surface N-1's réel beside the plan (the modal's 3-series compare: prévu · réel N · réel N-1).

**Au besoin has NO échéance month** — it's an annual envelope, excluded from the equilibrium and the provision, that hits the margin when it lands. The modal hides the month field for it; nothing is tinted in its 12-month strip. What is dated-but-variable (anniversaires…) belongs to **Ponctuel**, not Au besoin.

---

## What to BUILD for real (the actual work — absent from this mockup)

1. **Persistence — per calendar year (see "Plan lifecycle" above for the state machine).** Store the hand-set prévu (montant/périodicité/échéance) per poste, **scoped to a calendar year**. Each year's plan is its own snapshot, frozen on close. The states the UI must render:
   - **Past (archived)** — read-only. Consulted, never rewritten (badge 🔒).
   - **Closing** — civil year over, prévu frozen, transactions still correctable until the autonomous freeze.
   - **Current** — editable.
   - **Next (`currentYear + 1`)** — editable **draft** ("Préparation"): you prepare next year's budget before it starts (e.g. late December). Only ±1 year of future — no far horizon.

   Preparing next year = **seed from the current year's plan, indexed up**, then adjust (reindexed salary, new/dropped échéances). Never a blank sheet.

   **Kill the year-to-year transcription (design, not yet built in the mock).** You plan N+1 *against what N actually was* (its réel), not against N's prévu — today that means reading the réel on one screen and re-typing it into the prévu on another. Fix: the skeleton stays the indexed prévu (you prepare before N is over, so N's réel is incomplete), but in **Préparation** mode each poste surfaces **N-1's réel beside the N+1 prévu field** with a one-gesture **"reprendre le réel"** (adopt the observed as the plan). It's the écart mechanism shifted one year — prévu N+1 informed by réel N-1 — reusing the same Réel column, showing the *previous* year as reference instead of the (non-existent) current one. One screen, one click, zero re-typing. A **future year has no réel** (no imported transactions yet) → hide the Réel/Écart column and the modal's réel strip; only prévu shows. **Bascule is automatic**: since the store is keyed by `(year, poste)`, on Jan 1 the prepared next-year plan simply becomes the current one — no manual copy. Nothing here persists (local React state); the mockup fakes past years by scaling the seed and holds the current + next-year drafts in a `Record<year, PlanPoste[]>` (`planPostesForYear`, `PLAN_MIN_YEAR`/`PLAN_MAX_YEAR`). Needs a real store/db keyed by `(year, poste)`.

   **Open product decision (not locked):** is next year editable *year-round*, or only from Q4 onward (a "prepare next year" affordance that appears late in the current year)? The mockup opens it year-round; a Q4-gated nudge is the alternative.
2. **Real import** — parse the iSaveMoney xlsx (here `importPreviewMock` is fake), produce transactions.
3. **Taxonomy mapping** — map each imported transaction into the fixed `(catégorie, sous-catégorie)`. This is the import rules layer.
4. **Réel aggregation** — sum transactions per poste per month → replace `posteMonthly`'s mock with real data. That drives the 12-month strip, `planReelCadence`, and the écart.
5. **Canonical taxonomy** — finalize the full ~100-poste list from `Budget-2024.xlsx` 📅, as ONE definition shared by import + transactions + planification. Today the mockup's plan taxonomy (`PLAN_CATS`/`planPostesSeed`, ~35 postes) is a separate duplicate from the other budget screens' `categories`/`CatKey` — reconcile into a single source of truth.
6. **Autonomous close + notifications** — the year-close state machine (draft→current→closing→archived), the automatic prévu-freeze on Jan 1, the grace-window auto-freeze of transactions, and the optional "boucler {year} maintenant" / logged reopen. Drive it with **actionable notifications** (each deep-links to the right screen): (a) *"réel {year} complet — vérifie"* when the December-covering import lands (opens the closing year); (b) *"{year} se clôture dans N jours"* before the auto-freeze (last correction window + "boucler maintenant"); (c) *"{year} bouclée et archivée"* once frozen. The Jan-1 bascule may notify too (secondary — the on-screen badge already signals it). Channel (push / in-app / mail) is an implementation detail — note there's already a "monitoring maison" in this repo to build on.

---

## UX decisions locked (don't re-litigate)

- **Read-first table, edit in a modal** (click a row). First view is reading.
- **Shared grid** — 12 month columns aligned across all rows; **sticky sub-category header** carries the column labels (Assurances sticks, then Crédits replaces it…).
- **3 zones per row**, separated by full-height vertical rules (no bg tint): Plan (poste · prévu · fréquence) │ Année (12 mois, échéance tintée) │ Statut (réel · écart).
- **3 families visually separated** (Entrées green · Sorties neutral · Épargne teal), collapsible dépense categories.
- **Header** = annual equilibrium (Entrées − Dépenses − Épargne = Marge, marge colored red/green) + **provision promoted** as a prominent callout. No verdict banner (the marge box already carries it).
- **Mobile** = compact card list per sous-catégorie; the 12-month detail lives in the modal (no horizontal-scroll table).
- Uniform type scale, € on all amounts, thousands grouping on the annual header.
- **Year navigator** in the header (‹ year ›, same pattern as the Annuel screen), bounded `PLAN_MIN_YEAR … PLAN_MAX_YEAR`. State is signalled by a badge: past → 🔒 "Archive · lecture seule", next → ✏️ "Préparation". No badge on the current year. Future years render "à venir" in the Réel/Écart zone.
