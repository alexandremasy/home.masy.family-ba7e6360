# Planification — Implementation Brief

Handoff for building the **real** budget Planification. This repo is a **design mockup** (100% frontend-mock, no persistence) that validated the UX + logic. Reproduce the model; build the data layer that's missing here.

**Reference implementation in this repo:**
- `src/lib/budget-data.ts` — all the logic (functions listed below), the taxonomy seed, the mock réel generator.
- `src/routes/_app.budget.planification.tsx` — the validated UI (table + modal + mobile + header).
- **`Budget-2024.xlsx`** (Alex's real spreadsheet) — the ground truth. Tab **📅** = annualisation per poste; tab **🌅** = the equilibrium/forecast. The full ~100-poste taxonomy lives there.

---

## The model — reproduce exactly

**A poste = a `(catégorie, sous-catégorie)` pair. It has two faces:**
- **Prévu** — hand-set: `montant` + `périodicité` (Mensuelle/Trimestrielle/Annuelle/Au besoin) + `échéance` (anchor month for non-monthly). **No auto-derivation** — the user types it, a few times a year. Périodicité is manual too.
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

**Known model limit (why the forecast matters):** the annual equilibrium can be green while you're cash-short in a given month (a big bill lands before its provision accumulated). The plan proves the year balances on average, not month-to-month liquidity. → the **forecast** (coverage of upcoming échéances) is a **modelization on top of this plan, shown in the Vue d'ensemble** — NOT a separate screen.

---

## Functions to port (from `budget-data.ts`)

- `type PlanKind = "entree" | "depense" | "epargne"`, `type PlanPoste` (id, cat, group, label, amount, recurrence, months[], sensor?)
- `planKindOf(poste)` — family of a poste (via the fixed `PLAN_CATS` map)
- `annualisationProvision(postes)` — `Σ (Trimestrielle|Annuelle) amount×months.length / 12`
- `planCascade(postes)` — returns `{ entrees, depenses, epargne, marge, provision, auBesoin }` (annual €, provision monthly)
- `posteMonthly(poste)` — the 12-month réel (MOCK here; replace with real aggregation from imported transactions)
- `planReelCadence(poste)` — réel on the poste's cadence, for the écart

---

## What to BUILD for real (the actual work — absent from this mockup)

1. **Persistence** — store the hand-set prévu (montant/périodicité/échéance) per poste. Nothing here persists (local React state). Needs a real store/db.
2. **Real import** — parse the iSaveMoney xlsx (here `importPreviewMock` is fake), produce transactions.
3. **Taxonomy mapping** — map each imported transaction into the fixed `(catégorie, sous-catégorie)`. This is the import rules layer.
4. **Réel aggregation** — sum transactions per poste per month → replace `posteMonthly`'s mock with real data. That drives the 12-month strip, `planReelCadence`, and the écart.
5. **Canonical taxonomy** — finalize the full ~100-poste list from `Budget-2024.xlsx` 📅, as ONE definition shared by import + transactions + planification. Today the mockup's plan taxonomy (`PLAN_CATS`/`planPostesSeed`, ~35 postes) is a separate duplicate from the other budget screens' `categories`/`CatKey` — reconcile into a single source of truth.

---

## UX decisions locked (don't re-litigate)

- **Read-first table, edit in a modal** (click a row). First view is reading.
- **Shared grid** — 12 month columns aligned across all rows; **sticky sub-category header** carries the column labels (Assurances sticks, then Crédits replaces it…).
- **3 zones per row**, separated by full-height vertical rules (no bg tint): Plan (poste · prévu · fréquence) │ Année (12 mois, échéance tintée) │ Statut (réel · écart).
- **3 families visually separated** (Entrées green · Sorties neutral · Épargne teal), collapsible dépense categories.
- **Header** = annual equilibrium (Entrées − Dépenses − Épargne = Marge, marge colored red/green) + **provision promoted** as a prominent callout. No verdict banner (the marge box already carries it).
- **Mobile** = compact card list per sous-catégorie; the 12-month detail lives in the modal (no horizontal-scroll table).
- Uniform type scale, € on all amounts, thousands grouping on the annual header.
