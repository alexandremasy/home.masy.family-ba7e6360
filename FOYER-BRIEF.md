# Foyer — Idéation Brief (WIP)

> **Statut : idéation en cours.** Ce n'est pas encore un handoff Lovable. On capture le modèle au fil de la réflexion ; rien n'est verrouillé tant que ce n'est pas marqué **[LOCKED]**. Nom de domaine "Foyer" = provisoire, à valider.

Un nouveau domaine du cockpit, à côté de Budget / Énergie / Réseau / Sécurité / Tesla. Il couvre les **routines récurrentes du foyer** : ce qui revient chaque semaine (repas, courses) et chaque année (anniversaires). Aucun code n'existe encore pour ce domaine.

---

## Le fil conducteur — réactif ET proactif

Le liant des trois modules, nommé par Alex. Chaque routine se lit sur deux modes :

- **Réactif** — je fais l'action (planifier la semaine, mettre à jour la liste, écrire le mot d'anniv) et le système **assiste la saisie** : compose sous contraintes, dérive, dé-duplique, pré-remplit.
- **Proactif** — le système **anticipe** : rappelle que c'est l'heure, propose un menu pré-composé, connaît les récurrences, signale les déséquilibres, prépare un brouillon avant qu'on le demande.

L'enjeu produit est le **curseur d'autonomie** : copilote (propose → tu valides) vs autopilote (agit seul). Il n'est pas le même selon la réversibilité de l'action — voir décisions cachées ci-dessous.

### Décisions cachées à trancher tôt (one-way / structurantes)

1. **Curseur d'autonomie par action.** Composer un menu = réversible → autopilote OK. **Envoyer** un message d'anniversaire = externe, one-way → validation humaine obligatoire par défaut. À acter module par module.
2. **Modélisation des repas.** Un repas porte-t-il ses ingrédients (→ dérivation automatique de la liste de courses) ou la liste reste-t-elle semi-manuelle assistée par récurrence ? C'est le point dur qui décide de tout le module Courses.
3. **Socle de données.** Les trois modules reposent sur des catalogues persistés (répertoire de repas chaud/froid, staples courses, répertoire de personnes + relations). Comme pour le budget : mockup UX ici, data layer à construire (probablement `api.masy.family`).

---

## Module 1 — Repas (le plus riche)

**Capturé d'Alex :**
- Planification hebdomadaire dans un **calendrier**.
- Deux slots par jour : **midi = chaud**, **soir = froid / léger**.
- On dispose de **listes de repas chaud** et **repas froid** (catalogues existants côté famille).
- Le problème réel : **concilier l'ensemble** n'est pas facile. C'est le point qui « mixe logique, UX et intelligence ».

**Pistes (à débattre) :**
- *Réactif* : composeur de semaine — piocher dans les catalogues, contraint par slot (chaud/froid), variété (pas 3× pâtes), effort (jour chargé → repas simple), saison, stock.
- *Proactif* : semaine pré-remplie proposée, rappel « planifie la semaine prochaine », apprentissage des rotations habituelles, alerte déséquilibre.
- L'intelligence = un moteur de **suggestion sous contraintes**. Quelles sont les vraies contraintes à modéliser ? [à définir]

**Open questions :**
- Qu'est-ce qui rend la conciliation dure aujourd'hui, concrètement ? (variété ? charge mentale ? négociation à deux ? restes ?)
- Le calendrier repas existe déjà où ? (format, outil actuel)
- Un repas = juste un nom, ou une fiche (ingrédients, effort, saison, dernière fois servi) ?

---

## Module 2 — Courses (dérivé des repas)

**Capturé d'Alex :**
- Une fois le calendrier repas établi → **mettre à jour la liste de courses**.
- Ce sont **souvent les mêmes choses qui reviennent**.
- Sur base des repas choisis, **aider la mise à jour** pour **optimiser l'encodage**.

**Pistes (à débattre) :**
- *Réactif* : à partir du menu validé, générer/agréger les ingrédients ; dé-dupliquer.
- *Proactif* : pré-cocher les staples récurrents, détecter les cadences de rachat, connaître le stock du placard.
- Dépend entièrement de la **décision cachée #2** (repas → ingrédients ou pas).

**Open questions :**
- La liste vit où aujourd'hui ? (app dédiée, papier, notes)
- L'optimisation visée = moins de frappe, ou moins d'oublis, ou les deux ?

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
