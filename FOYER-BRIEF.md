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

- **Un seul catalogue, deux axes de tag [confirmé].** Pas de listes séparées midi/soir — un pool unique de plats, tagués sur **deux axes indépendants** :
  - **Densité : complet ↔ léger** — c'est l'axe qui oriente le slot. **Léger → soir**, complet → midi (nourrissant, emporté).
  - **Température : chaud / froid** — contrainte pratique (emporté réchauffé vs froid), corrélée mais distincte (une salade repas peut être froide *et* complète).
  - Ces préférences sont **des défauts, pas des lois** : modulés par les événements du calendrier (invités, week-end) et par la **météo** (canicule → le midi bascule léger/froid).
- **Contrainte semaine ≠ week-end.** Les midis **de semaine** doivent être **emportables + réchauffables au bureau** (lunchbox). Le **week-end** est plus souple (fait maison, pas de transport) — mais parfois un **repas rapide** est quand même nécessaire. Donc la contrainte « emportable » et « rapide » dépend du jour + du slot.
- **Cadence par repas, à double sens.** Certains plats se **refont en rafale sur une fenêtre courte** (écouler des produits, cohérent avec le batch emporté au bureau), d'autres s'**espacent** pour la variété. Pas de règle « N semaines » globale. **Cadence = attribut (méta) du plat** [confirmé], pas une déduction à la volée.
- **Planification à deux, ensemble.** Acte de couple, même moment, même écran — pas d'approbation asynchrone. L'outil sert la **décision commune**.
- **Horizon glissant, PAS la semaine civile [confirmé].** Planif le **mardi ~18h** ; la fenêtre couvre du **lendemain (mercredi) au vendredi de la semaine suivante** (~10 jours). Fenêtre **glissante**, re-jouée chaque mardi ; les fenêtres se chevauchent → la **cohérence s'évalue sur ~2 semaines glissantes**, pas sur une semaine isolée. (≠ Budget, qui est calendaire strict.)

### Modes d'usage [confirmés]

- **Planifier par suggestion, jamais par menu pré-établi.** Le système **propose**, l'humain compose. Une suggestion est une **proposition déplaçable** : « chouette, mais pas samedi → mets-la mardi ». Accepter une idée ≠ figer son jour.
- **Mode dépannage (réactif, impromptu).** Le plan d'un jour tombe (« samedi, ça ne fonctionne pas »), ou il y a un **reste à écouler** (reste de BBQ : viandes, accompagnements). Besoin : demander **« qu'est-ce qu'on fait avec ça »** et recevoir des suggestions qui **vont avec le reste**, adaptées à la saison. Le **modèle modulaire ci-dessous** est le mécanisme naturel de ce mode.

### Modèle de plat — base + modifiers [validé sur la data]

La liste réelle (~95 plats, Google Tasks, source `~/Downloads/…Agenda - Tasks.pdf`) montre que la famille **pense déjà ses repas en parties** : « Saumon riz épinards », « Rôti haricots croquettes », « Poulet moutarde haricot gratin dauphinois ».

**Insight clé (Alex) :** même les « plats uniques » ne sont pas monolithiques — ils ont une composition variable. « Quiche saumon épinards / quiche lardon / quiche poulet poivron », « pizza margherita / pizza poulet oignon ». → **un seul modèle unifié**, pas deux types disjoints :

**Un plat = une BASE (signature) + des MODIFIERS (composants typés par rôle).**
- **Base / signature** — le squelette : `assiette` (neutre), `pâtes`, `bowl / riz`, `salade`, `quiche`, `pizza`, `gratin`, `soupe`, `wrap`, `tarte`, ou un one-pot nommé (`chili`, `curry`, `raclette`, `potée`…). La base porte la forme et une partie des contraintes (emportable ? chaud/froid ?).
- **Modifiers** — le vocabulaire partagé : `protéine · légume · féculent · sauce · garniture`. **Les mêmes quelle que soit la base** — c'est ce qui unifie composé et one-pot.

**« Assiette composée » vs « plat unique » n'est plus un type binaire — c'est le degré d'ouverture de la base :**
- Base **ouverte** (assiette, pâtes, quiche, pizza, bowl) → beaucoup de modifiers libres → combinatoire d'inspiration maximale.
- Base **fermée** (chili, raclette, potée) → modifiers figés ou nuls → suggérée quasi telle quelle.

Le « type » est porté par l'**ouverture de la base**, pas par un flag sur le plat.

**Triple emploi (préservé et étendu) :**
1. **Inspiration** — la combinatoire base × modifiers génère des centaines de repas cohérents à partir de peu d'éléments. Antidote réel au « manque d'idées ».
2. **Dépannage** — « reste de saumon » replace le modifier `saumon` dans **plusieurs bases** (assiette, quiche, pâtes) → éventail de suggestions. La modularité **est** le mécanisme de secours.
3. **Normalisation de la data sale** — « Quiche saumon épinards / Quiche courgette poulet / Quiche poulet poivron » se replient sur `base(quiche) + {modifiers}`. Le modèle absorbe les variations de l'historique.

**Associations préférables à deux niveaux :** `base × modifier` (la quiche aime saumon+épinards) et `modifier × modifier` (le poisson aime les épinards) — apprises de l'historique 4 ans.

**Garde-fou :** ne pas sur-décomposer. Un plat « signature » toujours fait pareil (Hachis Parmentier) = une base fermée sans modifiers ; on ne le force pas en assemblage.

### Cohérence multi-jour — le vrai cœur du moteur [confirmé]

C'est la réponse directe au problème initial d'Alex : **« concilier l'ensemble »**. La cohérence ne se calcule pas plat par plat mais **sur toute la fenêtre glissante (~2 semaines)**, et — c'est ici que le modèle base+modifiers paie — **au niveau des composants, pas seulement des plats.** Deux forces opposées qui coexistent :

- **Répéter (voulu)** — refaire un plat 2× (grosse quantité cuisinée d'un coup / batch emporté au bureau), ou **réutiliser un composant** acheté en gros (« écouler le chou »). Le système doit **favoriser** la réapparition ciblée.
- **Varier (anti-lassitude)** — au **niveau modifier** : pas de `protéine=poulet` tous les jours, pas de `légume=tomate` partout. Répartir les protéines et les légumes sur la fenêtre.

**La clé qui réconcilie les deux :** répéter/varier ne s'appliquent pas aux mêmes composants. On **répète le composant à écouler** (le chou), on **varie tous les autres** (les protéines, les autres légumes). Le moteur = un **équilibrage par rôle sur la fenêtre**, avec des composants « épinglés » à réutiliser et les autres à disperser. Sans le split base+modifiers, ce raisonnement est impossible — c'est la justification n°1 du modèle.

### Saisie rapide — contrainte directrice [LOCKED]

Objectif du planning = faire la liste de la semaine **vite**. **Pas** cliquer dans 50 boîtes et sections. → **Le modèle base + modifiers vit SOUS LE CAPOT** (moteur de suggestion, dépannage, normalisation de l'historique) — ce n'est **pas** le mode de saisie par défaut.

Règle : **un repas = un geste** (piocher un plat entier, suggéré ou cherché). L'assemblage par composants n'apparaît **que si l'utilisateur le demande** : créer un nouveau plat, explorer/varier, ou dépanner. Lovable optimise pour la **vitesse de composition**, jamais pour l'exhaustivité du modèle.

**Mécanique alias [confirmé].** Un plat nommé = un **alias** d'une composition figée : `Saumon riz épinards` **est** `base(assiette) + protéine(saumon) + féculent(riz) + légume(épinards)`. La DB stocke le split (pour le moteur) ; l'UI présente le **plat entier en premier** dans la liste/suggestions. Choisir un alias = un tap. Le **mode « custom »** (à la demande) permet de partir d'un alias et de **swapper un composant** (« comme ça, mais boulgour au lieu du riz ») ou de composer de zéro. → Question ouverte : un custom crée-t-il un **nouvel alias** au catalogue (réutilisable), ou reste-t-il une variation jetable ?

**Observations data à garder en tête :** **un seul catalogue [confirmé]** (la liste « Repas du soir » sert de pool commun) mêlant complet et léger ; certains items portent une **attribution** (« julie leloup », « pinterest ») et un **état de stock** (« Quiche courgettes au congélateur »).

**Attributs d'un plat (méta — pas d'ingrédients) :** nom · **base / signature** · **modifiers** (protéine · légume · féculent · sauce · garniture) · **densité** (complet/léger) · **température** (chaud/froid) · **emportable / réchauffable** (oui/non) · **rapide** (oui/non) · **cadence** (rafale-court vs espacé) · dernière fois servi · [saison & fréquence : déduites de l'historique] · [attribution / source : optionnel].
> Note : une partie des tags (emportable, température) peut être **portée par la base** plutôt que re-saisie par plat — à arbitrer.

**Signaux d'inspiration à brancher (back, plus tard) :** historique 4 ans normalisé (socle) ; météo/canicule (le domaine Énergie a peut-être déjà une source) ; produits de saison (référentiel mois → produits).

### Frontière Lovable vs back [à confirmer]

- **Lovable produit l'UX réactive** : planifier une semaine à partir de **suggestions (mockées)**, placer/déplacer, filtrer par contexte (semaine→emportable, week-end→souple/rapide), mode dépannage-reste, fiches plats. Sur données **mock** comme le mockup Budget.
- **Hors périmètre Lovable (back, plus tard)** : extraction + normalisation Google Calendar, vrai moteur d'apprentissage, météo, **rappel proactif du mardi 18h via Discord**.

**Questions besoin restantes :**
- **Vocabulaire des bases** — à dériver de la data (assiette, pâtes, salade, bowl, quiche, pizza, gratin, soupe, wrap, tarte, + one-pots nommés). Liste à figer.
- **Ouverture des bases** — déclare-t-on quels rôles chaque base accepte (quiche → protéine+légume), ou modifiers libres partout ?
- **Un seul catalogue tagué chaud/froid, ou deux listes midi/soir ?** (la liste fournie = « Repas du soir » mais tu parlais du midi)
- **Emportable / rapide** — portés par la base ou par le plat ?

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
