# Foyer — Idéation Brief (WIP)

> **Statut : idéation en cours.** Ce n'est pas encore un handoff Lovable. On capture le modèle au fil de la réflexion ; rien n'est verrouillé tant que ce n'est pas marqué **[LOCKED]**. Nom de domaine "Foyer" = provisoire, à valider.

> **[LOCKED] Scope = UX / UI uniquement.** Comme le mockup Budget : ce repo valide l'UX. La persistance (migration des listes todo → base de données) est actée mais **hors sujet ici** — elle se fera dans `api.masy.family`. Ne pas construire de data layer dans ce brief.

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

**Le cœur du module = un moteur d'inspiration, pas un calendrier vide à remplir.** Le calendrier est le support ; la valeur est dans la **suggestion contextualisée + anti-répétition**.

- *Réactif* : « propose-moi des idées pour la semaine » → le système pioche dans les catalogues chaud/froid, filtre par slot (midi chaud / soir froid), écarte ce qui a été servi récemment, pondère par saison / chaleur / produits de saison.
- *Proactif* : semaine pré-composée proposée, rappel « planifie la semaine prochaine », détection de lassitude (« ça fait 3 semaines de rotation identique »).

**Attributs d'un repas (pas d'ingrédients) :** nom · catégorie chaud/froid · saison(s) / période · tolérance chaleur (léger quand il fait chaud) · **dernière fois servi** (moteur anti-récurrence) · [autres à définir : effort ? favori ?].

**Signaux d'inspiration à brancher (implémentation, plus tard) :** saison = calendrier ; chaleur = météo (le domaine Énergie a peut-être déjà une source) ; produits de saison = un petit référentiel mois → produits.

**Open questions :**
- Comment l'inspiration se présente-t-elle en UI ? (un composeur de semaine avec suggestions inline · un bouton « surprends-moi » · une file de propositions à accepter/refuser façon swipe ?)
- La planification est-elle solo ou à deux (validation partagée) ?
- « Pas trop récurrent » = quelle fenêtre ? (ne pas re-servir avant N semaines)

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
