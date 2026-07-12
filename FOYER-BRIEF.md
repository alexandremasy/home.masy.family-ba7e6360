# Foyer — Idéation Brief (WIP)

> **Statut : idéation en cours.** Ce n'est pas encore un handoff Lovable. On capture le modèle au fil de la réflexion ; rien n'est verrouillé tant que ce n'est pas marqué **[LOCKED]**. Nom de domaine "Foyer" = provisoire, à valider.

> **[LOCKED] Nature de ce document = cahier des besoins (PM spec).** Il définit **le quoi et les règles métier**, pas les écrans. Répartition des rôles :
> - **Ce brief** — besoins fonctionnels + règles + comportement réactif/proactif attendu (ce doc).
> - **Lovable** — conçoit l'UX / UI à partir de ces besoins.
> - **`api.masy.family`** — la persistance (migration des listes todo → base de données), actée mais **hors sujet ici**.
>
> Ne pas prescrire d'écrans ni de composants dans ce doc — décrire le comportement attendu, laisser Lovable trouver la forme.

Un nouveau domaine du cockpit, à côté de Budget / Énergie / Réseau / Sécurité / Tesla. Il couvre les **routines récurrentes du foyer** : ce qui revient chaque semaine (repas, courses) et chaque année (anniversaires). Aucun code n'existe encore pour ce domaine.

---

## Le fil conducteur — réactif ET proactif

Le liant des trois modules, nommé par Alex. Chaque routine se lit sur deux modes :

- **Réactif** — je fais l'action (planifier la semaine, mettre à jour la liste, écrire le mot d'anniv) et le système **assiste la saisie** : compose sous contraintes, dérive, dé-duplique, pré-remplit.
- **Proactif** — le système **anticipe** : rappelle que c'est l'heure, propose un menu pré-composé, connaît les récurrences, signale les déséquilibres, prépare un brouillon avant qu'on le demande.

L'enjeu produit est le **curseur d'autonomie** : copilote (propose → tu valides) vs autopilote (agit seul). Il n'est pas le même selon la réversibilité de l'action — voir décisions cachées ci-dessous.

### Décisions cachées à trancher tôt (one-way / structurantes)

1. **Curseur d'autonomie par action.** Composer un menu = réversible → autopilote OK. **Envoyer** un message d'anniversaire = externe, one-way → validation humaine obligatoire par défaut. À acter module par module.
2. **[LOCKED] Modélisation des repas — PAS d'ingrédients.** Un repas = un nom + des attributs (catégorie chaud/froid, saison, tolérance à la chaleur, « servi la dernière fois le… »), mais **pas de liste d'ingrédients**. Conséquence directe : la liste de courses **ne se dérive pas** des repas par les ingrédients → le module Courses reste semi-manuel, assisté par la récurrence (voir Module 2, décision ouverte sur le lien léger repas → items).
3. **Socle de données.** Les trois modules reposent sur des catalogues persistés (répertoire de repas chaud/froid, staples courses, répertoire de personnes + relations). Comme pour le budget : mockup UX ici, data layer à construire (probablement `api.masy.family`).

---

## Module 1 — Repas (le plus riche)

**Capturé d'Alex :**
- Planification hebdomadaire dans un **calendrier**.
- Deux slots par jour : **midi = chaud**, **soir = froid / léger**.
- On dispose de **listes de repas chaud** et **repas froid** (aujourd'hui dans une app de todo).
- **Le vrai problème = trouver des idées.** Pas la logistique ni la négociation. Des idées **pas trop récurrentes**, adaptées à la **chaleur du moment**, à la **période de l'année** et aux **produits de saison**.

**Le besoin central = un moteur d'inspiration.** La valeur n'est pas le calendrier (support), c'est **suggérer des idées contextualisées + gérer la répétition**.

### Pilier — le moteur apprend de l'historique [confirmé]

**≥ 4 ans de repas déjà consignés dans un calendrier.** Ce n'est pas un détail : c'est **la matière première du moteur**. La saisonnalité, la cadence de chaque plat, la variété ne sont pas (que) déclarées à la main — elles se **déduisent de l'historique réel** : quand un plat revient dans l'année, à quelle fréquence, en corrélation avec la saison / le temps. → La saisonnalité (question 2 initiale) est **data-driven**, pas un tag manuel. Cet historique doit pouvoir être exploité par le moteur (source, format, import : à cadrer côté data).

### Règles [confirmées]

- **Chaud midi / froid soir = principe par défaut, pas une loi.** Modulé par le calendrier et ses événements (invités, sorties, week-end, canicule). Le système propose selon le principe mais laisse dévier librement.
- **Cadence par repas, à double sens.** Certains plats doivent être **refaits en rafale sur une fenêtre courte** (pour écouler des produits), d'autres s'**espacent** pour la variété. La règle anti-récurrence n'est donc PAS un « pas avant N semaines » global — c'est une propriété par plat (probablement déductible de l'historique). Distinguer répétition **voulue** (écoulement produits) de répétition **subie** (manque d'idées).
- **Planification à deux, ensemble.** Acte de couple, même moment, même écran — pas de workflow d'approbation asynchrone. L'outil sert la **décision commune** (concilier envies des deux + produits + saison).
- **Rappel proactif : mardi ~18h** pour planifier la semaine à venir.

**Attributs d'un repas (pas d'ingrédients) :** nom · catégorie chaud/froid · [saison & cadence : plutôt déduites de l'historique que saisies] · **dernière fois servi** · [autres à définir].

**Signaux d'inspiration à brancher (implémentation) :** historique 4 ans (socle) ; chaleur = météo (le domaine Énergie a peut-être déjà une source) ; produits de saison = référentiel mois → produits, en appui de l'historique.

**Questions besoin restantes :**
- **Historique 4 ans — où vit-il, quel format ?** (Google Agenda, app todo, tableur…) — conditionne si le moteur peut vraiment s'en nourrir.
- **Répétition voulue vs subie — comment le système la distingue ?** L'humain marque un plat « à refaire cette semaine (écouler les produits) » au moment de planifier, ou le moteur déduit la cadence naturelle de chaque plat depuis l'historique ?
- **Canal du rappel du mardi 18h ?** (notif du cockpit, mail, autre)

---

## Module 2 — Courses (dérivé des repas)

**Capturé d'Alex :**
- Une fois le calendrier repas établi → **mettre à jour la liste de courses**.
- Ce sont **souvent les mêmes choses qui reviennent**.
- Sur base des repas choisis, **aider la mise à jour** pour **optimiser l'encodage**.

**Tension à résoudre :** pas d'ingrédients sur les repas (décision #2) → l'aide « sur base des repas choisis » ne peut PAS venir des ingrédients. Deux façons de tenir la promesse d'Alex (« optimiser l'encodage ») :

- **Option A — Courses autonome, aide par récurrence.** La liste ne connaît pas les repas. Le système apprend ce qui **revient chaque semaine** (staples), le pré-coche, détecte les cadences de rachat. Simple, robuste, indépendant du module Repas.
- **Option B — Lien léger repas → items.** Un repas peut porter 2-3 **items de courses** associés (pas une recette : juste « pour ce plat, penser à racheter X »). Choisir le repas pré-remplit ces items. Plus d'aide, un peu plus de saisie en amont sur les fiches repas.

Non exclusives : B peut se poser par-dessus A. À trancher.

**Open questions :**
- L'optimisation visée = moins de frappe, moins d'oublis, ou les deux ?
- Y a-t-il une notion de **stock / placard**, ou la liste part de zéro chaque semaine ?

---

## Module 3 — Anniversaires (calendrier + messages)

**Capturé d'Alex :**
- Un **calendrier des anniversaires**.
- Une **loop existante** qui crée des messages personnalisés selon le **type de relation**.
- Alex pense qu'on peut faire **mieux que la loop en place**.

**Pistes (à débattre) :**
- *Réactif* : à la date, générer un mot contextualisé (relation + historique + événement récent).
- *Proactif* : rappel J-N, brouillon pré-généré, choix du canal, apprentissage du ton.
- « Mieux que la loop » = moins générique, plus contextuel, et un curseur d'autonomie explicite (l'envoi reste validé — décision cachée #1).

**Open questions :**
- Que fait la loop actuelle exactement, et qu'est-ce qui cloche ? (trop générique ? mauvais timing ? pas de validation ?)
- Où tourne-t-elle (n8n ?) et où sont stockées les relations ?
- Objectif : le message final, ou juste un très bon brouillon à finir soi-même ?
