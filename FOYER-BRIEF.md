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
  - **Un rôle est multi-valué** [confirmé] : un plat peut porter **plusieurs légumes** (petit pois + maïs). C'est une **composition** (les composants qui comptent), **pas** une liste d'ingrédients exhaustive (ni huile ni sel).
  - **Chaque composant porte une quantité** (avocat ×2) — nécessaire au cumul des courses (voir Module 2). Unité simple (pièces) ; poids/volume à arbitrer.

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

C'est la réponse directe au problème initial d'Alex : **« concilier l'ensemble »**. La cohérence ne se calcule pas plat par plat mais **sur toute la fenêtre glissante (~2 semaines)**, et — c'est ici que le modèle base+modifiers paie — **au niveau des composants, pas seulement des plats.** Trois forces à concilier :

- **Répéter (voulu)** — deux mécaniques distinctes :
  - **Batch de plat** [confirmé] : un **gros plat cuisiné 1× en portion familiale** (lasagne…) → à deux, il **couvre 2 repas**. Ce n'est PAS « re-cuisiner 2× » : c'est **cuisiner une fois, occuper N slots**. Décidé **à la planification** (« c'est un gros plat, on en a pour 2 fois »), pré-suggéré par un attribut de rendement du plat, ajustable.
  - **Écoulement de composant** : réutiliser un composant acheté en gros (« écouler le chou ») → réapparition ciblée du modifier sur la fenêtre.
- **Varier (anti-lassitude)** — au **niveau modifier** : pas de `protéine=poulet` tous les jours, pas de `légume=tomate` partout. Répartir protéines et légumes sur la fenêtre.

**La clé qui réconcilie répéter/varier :** ça ne s'applique pas aux mêmes composants. On **répète le composant à écouler** (le chou), on **varie tous les autres**. Équilibrage **par rôle** sur la fenêtre, composants « épinglés » à réutiliser vs les autres à disperser. Impossible sans le split base+modifiers — justification n°1 du modèle.

### Production week-end — la contrainte cachée [confirmé]

**Le week-end, on cuisine les plats de la semaine** (batch cooking). Ça explique en aval tout ce qu'on avait posé : midi de semaine = **emporté/réchauffé** parce que **cuisiné le week-end**. Conséquence forte sur la planification :

- **La faisabilité de production est une contrainte du moteur**, au même titre que la variété. On optimise les repas de la semaine sur la **facilité / le temps de cuisine** — éviter d'aligner 5 plats longs à préparer le même week-end.
- → Attribut de plat : **effort de préparation** (rapide ↔ long). Le moteur garde la **charge de cuisine cumulée du week-end** raisonnable.
- Le batch de plat (ci-dessus) sert aussi cette optimisation : un gros plat couvrant 2 repas = 1 seule cuisson pour 2 slots.

### Saisie rapide — contrainte directrice [LOCKED]

Objectif du planning = faire la liste de la semaine **vite**. **Pas** cliquer dans 50 boîtes et sections. → **Le modèle base + modifiers vit SOUS LE CAPOT** (moteur de suggestion, dépannage, normalisation de l'historique) — ce n'est **pas** le mode de saisie par défaut.

Règle : **un repas = un geste** (piocher un plat entier, suggéré ou cherché). L'assemblage par composants n'apparaît **que si l'utilisateur le demande** : créer un nouveau plat, explorer/varier, ou dépanner. Lovable optimise pour la **vitesse de composition**, jamais pour l'exhaustivité du modèle.

**Mécanique alias [confirmé].** Un plat nommé = un **alias** d'une composition figée : `Saumon riz épinards` **est** `base(assiette) + protéine(saumon) + féculent(riz) + légume(épinards)`. La DB stocke le split (pour le moteur) ; l'UI présente le **plat entier en premier** dans la liste/suggestions. Choisir un alias = un tap. Le **mode « custom »** (à la demande) permet de partir d'un alias et de **swapper un composant** (« comme ça, mais boulgour au lieu du riz ») ou de composer de zéro. → Question ouverte : un custom crée-t-il un **nouvel alias** au catalogue (réutilisable), ou reste-t-il une variation jetable ?

**Observations data à garder en tête :** **un seul catalogue [confirmé]** (la liste « Repas du soir » sert de pool commun) mêlant complet et léger ; certains items portent une **attribution** (« julie leloup », « pinterest ») et un **état de stock** (« Quiche courgettes au congélateur »).

**Attributs d'un plat (méta — pas d'ingrédients) :** nom · **base / signature** · **modifiers** (multi-valués + quantité, par rôle : protéine · légume · féculent · sauce · garniture) · **densité** (complet/léger) · **température** (chaud/froid) · **emportable / réchauffable** (oui/non) · **effort de préparation** (rapide ↔ long) · **rendement / portions** (→ nb de slots couverts pour un couple) · **cadence** (espacement de variété entre fenêtres) · dernière fois servi · [saison & fréquence : déduites de l'historique] · [attribution / source : optionnel].
> Note : une partie des tags (emportable, température) peut être **portée par la base** plutôt que re-saisie par plat — à arbitrer.

**Signaux d'inspiration à brancher (back, plus tard) :** historique 4 ans normalisé (socle) ; météo/canicule (le domaine Énergie a peut-être déjà une source) ; produits de saison (référentiel mois → produits).

### Frontière Lovable vs back [à confirmer]

- **Lovable produit l'UX réactive** : planifier une semaine à partir de **suggestions (mockées)**, placer/déplacer, filtrer par contexte (semaine→emportable, week-end→souple/rapide), mode dépannage-reste, fiches plats. Sur données **mock** comme le mockup Budget.
- **Hors périmètre Lovable (back, plus tard)** : extraction + normalisation Google Calendar, vrai moteur d'apprentissage, météo, **rappel proactif du mardi 18h via Discord**.

**Arbitrages fins restants (non bloquants — à fermer plus tard) :**
- **Vocabulaire des bases** — à dériver de la data (assiette, pâtes, salade, bowl, quiche, pizza, gratin, soupe, wrap, tarte, + one-pots nommés). Liste à figer.
- **Ouverture des bases** — déclare-t-on quels rôles chaque base accepte (quiche → protéine+légume), ou modifiers libres partout ?
- **Tags portés par la base ou par le plat** (emportable, température) ?
- **Custom → alias** — un plat recomposé devient-il un alias réutilisable au catalogue, ou une variation jetable ?

---

## Module 2 — Courses (dérivé des repas)

**Capturé d'Alex :**
- Une fois le calendrier repas établi → **mettre à jour la liste de courses**.
- Ce sont **souvent les mêmes choses qui reviennent**.
- Sur base des repas choisis, **aider la mise à jour** pour **optimiser l'encodage**.

### La tension A/B est dissoute par le modèle repas [insight]

On avait hésité entre dériver des ingrédients (impossible — pas d'ingrédients) et la récurrence pure. **Le modèle base+modifiers dissout la question** : les modifiers (`saumon · épinards · riz · courgette`…) **sont déjà une liste grossière des composants principaux**. Une fenêtre de repas planifiée se décompose donc **automatiquement** en composants à acheter — sans modéliser la moindre recette. L'Option B, **gratuite**, offerte par le moteur repas.

### La liste = 3 sources

1. **Composants des repas planifiés** — modifiers agrégés + dédupliqués sur la fenêtre. **Zéro saisie** (dérivés).
2. **Staples récurrents** — pain, lait, café… ce qui revient à chaque fois. Appris de l'historique, **pré-cochés**.
3. **Ajouts manuels** — l'exceptionnel.

→ « **Optimiser l'encodage** » = tu ne re-tapes ni les composants (ils viennent des repas) ni les staples (ils reviennent) ; tu n'ajoutes que l'exception.

### Le pont d'écoulement (boucle avec les repas)

Ce que tu achètes en gros (le chou) **épingle un composant à réutiliser** côté repas (cf. cohérence multi-jour). Les deux modules se bouclent : **courses ← repas** (dérivation) et **repas ← courses** (écoulement du stock acheté).

**Quantités = dérivées par cumul [confirmé].** Chaque composant d'un plat porte une quantité ; la liste **somme ces quantités sur toute la fenêtre** — 3 plats qui utilisent l'avocat (1+2+2) → « **5 avocats** ». Le cumul multi-repas fait la valeur (sans lui, on sous-compte).

**L'unité est une propriété du composant [confirmé], pas globale :**
- Légumes → **pièce** (avocat ×5, courgette ×3).
- Protéines → **pièce** (5 blancs de poulet) **ou poids** (500 g de saumon), selon le composant.
- Chaque composant du référentiel porte son **unité native** ; le cumul additionne dans cette unité, **sans conversion** (reste léger). Pas d'ingrédient fin (ni huile ni sel).

**Le stock n'est PAS géré par un tracking de placard [confirmé].** La logique « on en a assez / pour 2 fois » se pose **à la planification des repas** (le batch de plat, cf. Module 1), pas via un inventaire à tenir à jour. → cohérent avec « pas de couches ».

**La liste est vivante, pas un output figé [confirmé].** Le moteur pré-remplit (repas dérivés + staples), mais l'**édition doit être ultra-fluide** : ajout / retrait d'un item et **changement de quantité** en un geste. Les staples = des items pré-suggérés parmi d'autres, éditables comme le reste. Le moteur fait 80 %, l'humain ajuste les 20 % vite. C'est le vrai sens d'« optimiser l'encodage ».

**Question besoin restante :**
- **Où vit la liste en UX ?** Dans le cockpit (mock) ici — un écran à part, ou attaché au planning repas (une seule surface planif → courses) ?

---

## Module 3 — Anniversaires (studio de message assisté)

**Existant :**
- Une **loop** génère un message par **type de relation**. Le **déclencheur va bien** : jour J → **notification Discord**. À garder.
- Ce qui cloche : le message est **trop générique, pas assez personnel** (même si la logique de customisation actuelle a du bon).

**Ce que veut Alex — un studio de rédaction, pas une loop [confirmé].** Trois briques :
1. **Suggestion basée sur les méta de la personne** (pas juste un « type » figé — voir le nœud ci-dessous).
2. **Curseurs de style, façon branding** — régler le registre par axes (comme les niveaux d'une identité de marque). **Proposition d'axes [à valider ensemble]**, choisis orthogonaux + actionnables :
   - **Registre** : pudique ↔ complice *(jamais froid/formel — on n'écrit qu'à des gens aimés)*
   - **Chaleur** : sobre ↔ tendre
   - **Humour** : sincère ↔ taquin
   - **Longueur** : bref ↔ développé
   - *(candidat)* **Densité de références perso** : allusif ↔ truffé de souvenirs — ou piloté directement par les méta plutôt qu'un curseur (à trancher).
3. **Relance par commentaire** — écrire un feedback en langage naturel (« plus court », « ajoute une allusion à X ») → **régénère** sur cette base. Boucle de raffinement dirigée.

**Socle non négociable — sincère, du cœur, JAMAIS bateau [confirmé].** On n'écrit qu'aux **gens qu'on apprécie vraiment** → le sentiment est **toujours chaud et vrai**. Ce n'est pas un curseur : **aucun réglage ne descend vers le générique / la formule** (« plein de bonheur pour cette nouvelle année »). Le socle est le vrai cahier des charges de la génération — les curseurs modulent au-dessus, jamais en dessous. C'est précisément le défaut de la loop actuelle qu'on élimine.

**Décisions cadres [confirmées] :**
- **100 % local, aucun envoi au destinataire.** Le système **produit un texte**, l'humain le copie et l'envoie lui-même. → la décision cachée #1 tombe du côté safe : zéro automatisation d'envoi, zéro irréversible. Le « canal » (WhatsApp) n'est **pas** une intégration.
- **Format cible = message instantané type WhatsApp** : court, direct, ton perso (pas une lettre). Un paramètre de longueur/registre par défaut, pas un connecteur.
- **Trigger jour J = notif Discord** (déjà en place, back).

**Le nœud — la personnalisation par méta [à définir, cœur du module].** Alex déplace le curseur de « type de relation » (catégorie rigide) vers des **méta riches par personne** qui nourrissent la génération. Le type de relation devient **un** attribut parmi d'autres. **Comme tout le monde est aimé (socle), les méta qui comptent sont le SPÉCIFIQUE de la personne, pas son statut relationnel** : ce qui la rend unique, votre histoire commune — plutôt que « ami vs collègue ». Pistes candidates (à valider/élaguer) : souvenirs / private jokes · ce qu'on aime chez elle · événement de vie récent · centres d'intérêt · cap d'âge (30/40/50) · langue · ton habituel avec elle · historique des messages passés (ne pas répéter d'une année sur l'autre). **C'est ici que se joue « plus personnel ».**

**Frontière Lovable vs back :**
- **Lovable (UX, mock)** : calendrier des anniversaires · fiche personne + ses méta · les **curseurs de style** · zone message avec **régénérer** + champ **commentaire de relance**. Génération **mockée**.
- **Back (plus tard)** : la vraie génération LLM (méta + curseurs + commentaire → message), la notif Discord jour J, le stockage des personnes/méta.

**Questions besoin restantes :**
- **Les méta de personne** — lesquelles retenir (le nœud) ? À creuser au prochain tour.
- **Les axes de curseurs de style** — quels 3-5 axes ? (dérivables de ta logique branding).
- **Historique des messages** — le système garde-t-il les messages des années passées pour éviter la répétition ?
