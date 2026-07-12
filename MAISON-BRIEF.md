# Maison — Spec: Repas · Courses · Anniversaires

New cockpit domain **Maison**, alongside Budget / Énergie / Réseau / Sécurité / Tesla. Covers the household's recurring routines — weekly (repas, courses) and yearly (anniversaires). No code exists yet for this domain.

Every routine runs in two modes:
- **Réactif** — the user acts; the system assists (compose under constraints, derive, dedupe, prefill).
- **Proactif** — the system anticipates (reminders, pre-composed suggestions, imbalance signals, pre-drafted output).

**Document consumers & role split:**
- **This spec** — functional requirements + business rules + data model. Serves the three below.
- **Lovable** — builds the réactif UX/UI on **mock data** (this repo).
- **`api.masy.family`** — persistence, learning engine, external integrations (later).
- **Cockpit front** — wires real data into the domain.

**Cross-cutting principles (locked):**
- **Fast entry, no layers.** Composing a plan or a list must be fast — never clicking through many boxes and sections. Rich models live under the hood; the default gesture is one tap.
- **Mock-first UX.** Lovable renders behavior on mock data, like the Budget mockup. Real data and engine come later.
- **No irreversible action.** Birthday messages are generated locally and never sent by the system.

---

## Data model (for api + front)

- **Plat** — `nom`, `base`, `modifiers[]`, tags: `densité` (complet|léger), `température` (chaud|froid), `emportable` (bool), `effort` (rapide↔long), `rendement` (slots covered for a couple); plus `cadence` (variety spacing), `dernierServiLe`. A **named dish is an alias** of a fixed composition.
- **Base** — dish skeleton: `assiette` (neutral), `pâtes`, `bowl/riz`, `salade`, `quiche`, `pizza`, `gratin`, `soupe`, `wrap`, `tarte`, or a named one-pot (`chili`, `curry`, `raclette`, `potée`). Open bases accept many modifiers; closed bases are near-fixed. Vocabulary derived from data.
- **Modifier** — a **Composant** in a role: `protéine · légume · féculent · sauce · garniture`. A role is **multi-valued**. Each composant carries a `quantité` and a **native unit** (`pièce`, or `poids` for some proteins).
- **Liste de courses** — items = derived (planned dishes' modifiers) + staples + manual; each with quantity in the composant's unit; fully editable.
- **Personne** — structured meta (`dateNaissance`, `langue`, `âge` derived, default slider positions, `historiqueMessages`) + **matière libre** (freeform notes, no schema).
- **Curseurs** — Registre, Chaleur, Humour, Longueur.

---

## Module 1 — Repas

**Purpose: an inspiration engine, not an empty calendar to fill.** Suggest contextual, non-repetitive dish ideas and keep the plan coherent.

**Catalogue** — one shared pool of dishes, tagged on two independent axes:
- **Densité: complet ↔ léger** — drives the slot. Léger → soir, complet → midi.
- **Température: chaud / froid** — practical (reheated vs cold); correlated but distinct (a salade repas is froid *and* complet).
- Both are **defaults, not laws** — overridden by calendar events (guests, weekend) and **weather** (heatwave → midi shifts léger/froid).

**Slots & constraints** — two slots/day (midi, soir).
- Weekday **midi** must be **emportable + réchauffable** (cooked on the weekend, reheated at the office).
- **Weekend** is looser (home, no transport) — but a **rapide** option is sometimes still needed.

**Planning horizon — sliding, NOT the civil week.** Planned **Tuesday ~18h**, covering **Wednesday → Friday of the following week** (~10 days). The window slides weekly and overlaps → **coherence is evaluated over ~2 sliding weeks** (unlike Budget, which is strictly calendar-annual).

**Dish model — base + modifiers.** A dish = a `base` + role-typed `modifiers` (shared vocabulary across all bases). "Composed plate" vs "one-pot" is not a type — it is the base's **openness**. The model serves three jobs:
1. **Inspiration** — base × modifiers combinatorics generate many coherent meals from few elements.
2. **Dépannage** — a leftover component re-placed into several bases yields matching suggestions.
3. **Normalization** — messy history variants fold onto `base + {modifiers}`.
Preferred associations (`base × modifier`, `modifier × modifier`) are learned from history.

**Coherence engine — evaluated over the window, at component level.** Reconcile:
- **Cadence** — per-dish variety spacing between windows.
- **Rendement / batch** — a large dish cooked once covers N slots; decided at planning, pre-suggested by the dish's `rendement`.
- **Écoulement** — pin a bulk-bought component to reuse.
- **Variété** — at modifier level: no `protéine=poulet` every day, no `légume=tomate` everywhere.
- **Rule:** repeat the pinned component, vary all others — a per-role balancing over the window.

**Weekend production constraint.** The week's dishes are batch-cooked on the weekend. **Cooking feasibility is a first-class constraint**: prefer easy/quick dishes for the week; keep the weekend's cumulative cooking load reasonable. A batch dish (one cook, N slots) also serves this.

**Entry — fast, no layers.** Default gesture = **pick a whole dish** (suggested or searched), one tap. Base+modifiers assembly ("**custom**" mode) appears **only on demand**: create a dish, swap/vary a component, or dépannage. A custom dish **optionally saves as a new alias** (opt-in), else it is a throwaway variation.

**Modes:**
- **Suggestion-driven, never a pre-filled menu.** The system proposes; the user composes. A suggestion is **movable** — accept the idea, choose its day.
- **Dépannage** — a day's plan falls through, or a leftover must be used ("reste de BBQ"): ask *"what do we do with this?"* → suggestions matching the leftover, season-aware.

---

## Module 2 — Courses

**Purpose: update the shopping list fast, from the planned meals.**

**The list = 3 sources:**
1. **Components of planned dishes** — modifiers aggregated + deduped over the window. **Zero entry** (derived).
2. **Recurrent staples** — bread, milk, coffee… what comes back every time. **Pre-checked.**
3. **Manual additions** — the exceptional.

**Quantities — derived by cumulation** over the window (3 dishes using avocado, 1+2+2 → "**5 avocados**"). Quantity lives at **component level**, in the component's **native unit** (`pièce`, or `poids` for some proteins), no conversion, no fine ingredients.

**No pantry tracking.** "We have enough / enough for two" is decided at **meal planning** (batch), not via an inventory to maintain.

**Living list.** The engine prefills (derived + staples); **add/remove and quantity change must be one-gesture fast**. Staples are pre-suggested items, editable like the rest.

**Placement:** attached to the meal planning (one surface: plan → courses), with its own list view.

---

## Module 3 — Anniversaires

**Purpose: an assisted message studio** — more personal drafts than the current loop. Keeps the loop's trigger, replaces its generic output.

**Non-negotiable floor — sincere, heartfelt, never generic.** The family only writes to people it genuinely cares about → the sentiment is always warm and true. **No slider setting descends toward boilerplate** ("plein de bonheur pour cette nouvelle année"). This floor is the real generation spec; sliders modulate above it.

**Three bricks:**
1. **Suggestion from the person's meta** (model below).
2. **Style sliders** (branding-like, orthogonal + actionable):
   - **Registre** — pudique ↔ complice (never cold/formal — only loved people).
   - **Chaleur** — sobre ↔ tendre.
   - **Humour** — sincère ↔ taquin.
   - **Longueur** — bref ↔ développé.
3. **Comment-driven regeneration** — natural-language feedback ("shorter", "add a nod to X") regenerates on that basis.

**Person model** — minimal structured meta (`dateNaissance` = trigger, `langue`, age derived, default slider positions, **message history** for year-to-year non-repetition) + **matière libre** (freeform notes per person, no imposed fields). The matière libre is the personalization source; **density of personal references is driven by it, not a slider**.

**Generation input:** matière libre + sliders + floor + history → message, regenerable by comment.

**Framing:**
- **100% local, never sent.** The system produces text; the human copies and sends it. Target format = **instant-message style (WhatsApp)**: short, direct, personal — not a letter.
- **Trigger:** birthday-day **Discord** notification (existing, back).

---

## Scope: Lovable (now) vs back (later)

**Lovable — mock UX, this repo:**
- **Repas** — weekly planning surface with movable suggestions, slot/context filtering (semaine→emportable, weekend→souple/rapide), dépannage-by-leftover, dish sheets, quick pick + on-demand custom assembly.
- **Courses** — derived + staples + manual living list, cumulated quantities, one-gesture edit, attached to the planning.
- **Anniversaires** — birthday calendar, person sheet (meta + matière libre), the four style sliders, message area with **regenerate** + **comment** field. Generation is **mocked**.

**Back — `api.masy.family` + integrations, later:**
- Google Calendar history extraction + normalization; learning engine (seasonality, cadence, preferred associations); weather source; produce-in-season reference.
- Real LLM generation for birthdays; person / meta storage.
- Proactive channels: Tuesday 18h planning reminder + birthday-day notice, via **Discord**.

---

## Deferred (fine, non-blocking)
- Base vocabulary finalization; base openness (declared roles vs free modifiers); tags carried by base vs dish.
- Courses list view: standalone screen vs detail embedded in the planning.
