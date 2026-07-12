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

**≥ 4 ans de repas déjà consignés dans Google Calendar.** C'est **la matière première du moteur** : la saisonnalité, la cadence de chaque plat, la variété se **déduisent de l'historique réel** (quand un plat revient, à quelle fréquence, en corrélation saison / temps). → La saisonnalité est **data-driven**, pas un tag manuel.
**⚠️ Data sale :** saisie humaine, **beaucoup de variations autour des mêmes plats** (« bolo », « spaghetti bolognaise »…). Une couche de **normalisation / dédoublonnage** est nécessaire avant exploitation. Extraction + nettoyage = **côté data / back, pas dans l'UX Lovable, plus tard.**

### Règles [confirmées]

- **Chaud midi / froid soir = principe par défaut, pas une loi.** Modulé par les événements du calendrier (invités, sorties, week-end). **La météo peut inverser la nature du repas** : en canicule, le « repas chaud » du midi devient de fait une **salade froide**. Le système propose selon le principe mais laisse dévier librement.
- **Contrainte semaine ≠ week-end.** Les midis **de semaine** doivent être **emportables + réchauffables au bureau** (lunchbox). Le **week-end** est plus souple (fait maison, pas de transport) — mais parfois un **repas rapide** est quand même nécessaire. Donc la contrainte « emportable » et « rapide » dépend du jour + du slot.
- **Cadence par repas, à double sens.** Certains plats se **refont en rafale sur une fenêtre courte** (écouler des produits, cohérent avec le batch emporté au bureau), d'autres s'**espacent** pour la variété. Pas de règle « N semaines » globale. **Cadence = attribut (méta) du plat** [confirmé], pas une déduction à la volée.
- **Planification à deux, ensemble.** Acte de couple, même moment, même écran — pas d'approbation asynchrone. L'outil sert la **décision commune**.

### Modes d'usage [confirmés]

- **Planifier par suggestion, jamais par menu pré-établi.** Le système **propose**, l'humain compose. Une suggestion est une **proposition déplaçable** : « chouette, mais pas samedi → mets-la mardi ». Accepter une idée ≠ figer son jour.
- **Mode dépannage (réactif, impromptu).** Le plan d'un jour tombe (« samedi, ça ne fonctionne pas »), ou il y a un **reste à écouler** (reste de BBQ : viandes, accompagnements). Besoin : demander **« qu'est-ce qu'on fait avec ça »** et recevoir des suggestions qui **vont avec le reste**, adaptées à la saison. Le **modèle modulaire ci-dessous** est le mécanisme naturel de ce mode.

### Modèle de plat — modulaire hybride [proposition, validée par la data]

La liste réelle (~95 plats, Google Tasks, source `~/Downloads/…Agenda - Tasks.pdf`) tranche : **la majorité des plats sont déjà des assemblages `[protéine] + [féculent] + [légume/sauce]`** — « Saumon riz épinards », « Rôti haricots croquettes », « Poulet moutarde haricot gratin dauphinois », « Poisson épinards riz curcuma ». La famille **pense déjà ses repas en parties**.

Mais une partie ne se décompose pas : **plats uniques / one-pot** — Potée (le cas cité), Lasagne, Chili, Raclette, Pizza, Quiche, Curry, Poke Bowl, Soupe repas. Entités entières.

→ **Deux types de plats, coexistants :**
- **Assiette composée** = assemblage de **composants typés par rôle** : `protéine · féculent · légume · sauce` (+ éventuel crudité/garniture). Suggestions **par rôle** ; il existe des **associations préférables** (graphe des combinaisons qui reviennent, appris de l'historique).
- **Plat unique** = une entité au catalogue, suggérée telle quelle (le « type potée »).

**Pourquoi le modulaire plutôt que de simples tags — triple emploi :**
1. **Inspiration** — la combinatoire par rôle génère des centaines d'assiettes cohérentes à partir de peu de composants. Le vrai antidote au « manque d'idées » (mieux qu'une liste figée).
2. **Dépannage** — « reste de BBQ » = j'ai la [protéine], le système propose [féculent]+[légume] qui vont avec. La modularité **est** le mécanisme de dépannage.
3. **Normalisation de la data sale** — les ~15 variantes « poisson épinards X » se réduisent à `[poisson]+[épinards]+[féculent variable]`. Le modulaire absorbe les variations de l'historique.

**Garde-fou :** ne pas tout forcer en modulaire. Un plat « signature » toujours fait pareil (Hachis Parmentier) peut rester un plat unique. Le type est un choix par plat.

**Observations data à garder en tête :** la liste s'appelle **« Repas du soir »** (alors qu'Alex parlait du midi → un seul pool ou deux listes ? à trancher) ; elle mélange chaud cuisiné et salades froides ; certains items portent une **attribution** (« julie leloup », « pinterest ») et un **état de stock** (« Quiche courgettes au congélateur »).

**Attributs d'un plat (méta — pas d'ingrédients) :** nom · **type** (assiette composée / plat unique) · **composants par rôle** (si composée) · catégorie chaud/froid (overridable météo) · **emportable / réchauffable** (oui/non) · **rapide** (oui/non) · **cadence** (rafale-court vs espacé) · dernière fois servi · [saison & fréquence : déduites de l'historique] · [attribution / source : optionnel].

**Signaux d'inspiration à brancher (back, plus tard) :** historique 4 ans normalisé (socle) ; météo/canicule (le domaine Énergie a peut-être déjà une source) ; produits de saison (référentiel mois → produits).

### Frontière Lovable vs back [à confirmer]

- **Lovable produit l'UX réactive** : planifier une semaine à partir de **suggestions (mockées)**, placer/déplacer, filtrer par contexte (semaine→emportable, week-end→souple/rapide), mode dépannage-reste, fiches plats. Sur données **mock** comme le mockup Budget.
- **Hors périmètre Lovable (back, plus tard)** : extraction + normalisation Google Calendar, vrai moteur d'apprentissage, météo, **rappel proactif du mardi 18h via Discord**.

**Questions besoin restantes :**
- **Valider le modèle modulaire hybride** et la liste des rôles : `protéine · féculent · légume · sauce` suffisent, ou il en manque (crudité, garniture) ?
- **Nommer le « type potée »** : plat unique ? plat complet ? one-pot ? (terme à figer)
- **Un seul catalogue tagué chaud/froid, ou deux listes midi/soir ?** (la liste fournie = « Repas du soir » mais tu parlais du midi)
- **Emportable & rapide** = deux booléens distincts sur le plat, confirmé ?

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
