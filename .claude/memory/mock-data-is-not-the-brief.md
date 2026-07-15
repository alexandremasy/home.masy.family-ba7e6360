---
name: mock-data-is-not-the-brief
description: The mockup's mock data mixes Alex's real household with Lovable-invented filler — never read it as fact
metadata:
  type: project
---

**Trap: `src/lib/mock-data.ts` is NOT a description of Alex's real home.** It mixes two things, and
mistaking one for the other produces confident nonsense (I once told Alex "🚨 your garage door is
open" — he has no garage).

**Lovable-invented filler — do NOT treat as fact:**
- `presence` = Alex / **Sam** / **Léa**. Sam and Léa exist ONLY in that array, nowhere else in the
  repo. They are not real people.
- `perimeter` / `locks` — porte de garage, garage, the whole opening list: generic filler.
- Assume anything generic-sounding with no personal detail is filler.

**Written by Alex — real, rich, personal (trust it):**
- `people` in `src/lib/maison-data.ts` — Léo (brother, moved to Amsterdam, learning guitar), Maman
  (retired, cœur de bœuf tomatoes), the 82-year-old carpenter grandfather who built the kids' crib.
  Real `matièreLibre`.
- **Cathy** — surfaces via `roomDetails.bureau` light zones `"Bureau Alex"` / `"Bureau Cathy"`.
- Fumal (location), Bernard (the Tesla), Bouboule / Chat / Lampe à sel (appliances), potée
  liégeoise & the dish catalogue.
- → The real household looks like **Alex + Cathy + children** (matière libre mentions "photos des
  enfants" and the crib), but names/ages are nowhere in the repo.

**The missing brief.** `CLAUDE.md` cites **`FOYER-BRIEF.md` — "le modèle du foyer (PM spec, WIP)"**
— and the file DOES NOT EXIST. That is the one document describing who lives in this house, and its
absence is why the household has to be asked about, not inferred. Existing briefs: MAISON-BRIEF.md,
PLANIFICATION-BRIEF.md.

**Rule:** before designing anything that depends on the household (presence, adaptivity, "situation
de chacun"), get the facts from Alex. Never infer a family from mock arrays.
