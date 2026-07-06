# Refonte de l'accueil Budget (/budget/vue)

L'écran actuel juxtapose des KPIs bruts, un chart entrées/dépenses et une bande de mois. Ça ne répond pas directement aux requirements : pas de verdict de trajectoire, pas de continuité annuelle claire, pas de mise en avant des grosses échéances couvertes/non couvertes, pas d'ancrage épargne. Voici la nouvelle structure, section par section, chacune rattachée à un requirement.

## Nouvelle structure de la page

```text
┌─────────────────────────────────────────────────────┐
│ 1. Verdict — "Dans les clous"          (R1)         │
├─────────────────────────────────────────────────────┤
│ 2. L'année en continu (courbe cumulée)  (R2)        │
├─────────────────────────────────────────────────────┤
│ 3. Grosses échéances à venir + couverture (R3+R4)   │
├─────────────────────────────────────────────────────┤
│ 4. Épargne — état, évolution, ajustement (R5+R6)    │
├─────────────────────────────────────────────────────┤
│ 5. Catégories — pourquoi la trajectoire (R7)        │
└─────────────────────────────────────────────────────┘
```

### 1. Bandeau Verdict (R1) — remplace les 4 KPI cards
Un seul bloc large, lisible en 2 secondes :
- Un **statut visuel** : pastille verte/ambre/rouge + phrase courte ("Dans les clous", "Serré ce trimestre", "Dépassement projeté").
- Une **jauge horizontale** : réalisé YTD + projeté restant vs budget annuel, avec un repère "où on devrait être aujourd'hui".
- 3 mini-chiffres discrets à droite : net projeté, taux d'épargne, écart vs budget annuel (en € et %).

Règle de verdict (mock) : écart projeté ≤ 2 % → vert, ≤ 6 % → ambre, > 6 % → rouge.

### 2. L'année en continu (R2) — remplace le double bar chart
Un seul graphe **cumulé** qui raconte la marche de l'année sans rupture :
- Courbe **dépenses cumulées réalisées** (trait plein) + prolongée en **projection** (pointillé) jusqu'à décembre.
- Courbe **budget cumulé** en référence discrète.
- Bande grise = zone de tolérance ± 5 %.
- Marqueur "aujourd'hui" vertical.
- Sous le graphe, mini-strip 12 mois compacte (juste la ligne de mois, cliquable pour zoomer — on garde le MonthView existant).

Le bar chart mois par mois disparaît de l'accueil ; il reste accessible via la page Annuel.

### 3. Grosses échéances (R3) + Couverture (R4) — nouveau bloc
Timeline horizontale des **3 à 5 prochaines échéances non-mensuelles** (dérivées de `postesSeed` + `nonMonthlyBills`) :
- Chaque échéance = carte compacte : mois, label, montant, jours restants.
- **Badge de couverture** sur chaque carte : "Couverte" (vert), "Partielle" (ambre), "À combler" (rouge), calculée = provision cumulée d'ici la date vs montant.
- En pied de bloc : total à venir 6 mois + provision cumulée disponible + delta.
- Lien "Modifier la planification".

### 4. Épargne (R5 + R6) — élargit le bloc actuel des enveloppes
- Vue **transparente** : chaque enveloppe = solde actuel, contribution mensuelle, **sparkline 12 mois** (évolution du solde, pas juste un nombre).
- Total épargne en haut du bloc + delta vs mois dernier.
- Chaque carte enveloppe devient **éditable** : bouton discret "Ajuster" ouvre un petit inline editor pour corriger le solde à la main (mock state, in-memory). Toast de confirmation.
- Répond à R5 (voir clair) + R6 (ajuster soi-même).

### 5. Catégories — le "pourquoi" (R7) — nouveau bloc en bas
Grille dense de 11 mini-cartes catégorie (une par entrée de `categories`) :
- Icône + label + **barre de consommation** (actual/budget avec couleur adaptée).
- **Micro-sparkline** de tendance sur 6 mois (mock dérivé).
- Chip "prochaine échéance dans cette catégorie" quand pertinent (dérivée de `postesSeed`).
- Clic → route existante (mensuel ou détail catégorie).

## Fichiers touchés

- **`src/routes/_app.budget.vue.tsx`** — refonte de `YearView`. `MonthView` reste inchangé (déjà bon pour le zoom mois).
- **`src/lib/budget-data.ts`** — ajouts helpers **purs**, pas de refonte des seeds :
  - `annualVerdict()` — renvoie `{ status, label, deltaPct }`.
  - `cumulativeSeries()` — dépenses cumulées + budget cumulé + projection.
  - `upcomingBigBills(n)` — prochaines n échéances non-mensuelles avec couverture calculée.
  - `envelopeSeries(env)` — sparkline 12 mois dérivée déterministe.
- **Nouveaux composants** (dans `src/routes/_app.budget.vue.tsx`, section-local, pas de nouveaux fichiers) : `VerdictBanner`, `ContinuousYearChart`, `UpcomingBillsRow`, `EnvelopeCardEditable`, `CategoryMiniCard`.
- État local `useState` pour l'édition d'enveloppes (mock, in-memory — pas de persistance, conforme au brief prototype).

## Ce qui NE change PAS

- Route et navigation (`/budget/vue` reste l'accueil).
- Page Annuel, Mensuel, Planification, Transactions, Import — intactes.
- Seeds de données existants.
- `MonthView` (zoom mois) — réutilisé tel quel.

## Ce qui disparaît de l'accueil

- Les 4 KPI cards du haut → remplacées par le bandeau Verdict.
- Le double bar chart entrées/dépenses → remplacé par la courbe cumulée.
- La grille trimestre / scroll horizontal 12 tuiles → réduite à un mini-strip cliquable sous la courbe.
- Le bloc "Provision d'annualisation" isolé → fusionné dans le bloc Échéances (R3+R4) où il a du sens.

Prêt à implémenter dès validation.
