# Passation — Iʿrāb FR

Dernière mise à jour : 11 août 2026  
Dernier jalon livré : coach pédagogique personnalisé  
Commit de référence : `a2e1edd`

## 1. Liens utiles

- Application publique : https://derkitoo.github.io/irab/
- Dépôt : https://github.com/Derkitoo/irab
- Branche de développement : `main`
- Branche publiée par GitHub Pages : `gh-pages`
- Projet Supabase : `pxywcrnvhejdmmlqpipq`
- Workflow de validation : `.github/workflows/pages.yml`

## 2. État livré

L’application est indépendante d’Arabiya. Elle fonctionne en français et en arabe, sur ordinateur et mobile.

- 12 modules, 25 leçons et 129 exercices ;
- QCM, choix de mots, terminaisons et construction du iʿrāb par blocs ;
- corrections expliquées et lecture audio arabe par synthèse vocale ;
- progression locale, révision ciblée et répétition espacée ;
- PWA installable et fonctionnement hors ligne ;
- export et restauration d’une sauvegarde JSON ;
- inscription, connexion et synchronisation Supabase ;
- fusion sans doublons de la progression entre appareils ;
- bilan pédagogique : maîtrise, réussite, activité sur sept jours, série et erreurs fréquentes ;
- coach personnalisé : objectif quotidien 5/10/15, priorité aux révisions, détection des thèmes faibles et recommandation de la prochaine leçon.

Le déploiement public et les tests automatiques sont verts au moment de cette passation.

## 3. Architecture

Le projet est volontairement simple : HTML, CSS et modules JavaScript natifs, sans étape de compilation.

| Fichier | Responsabilité |
| --- | --- |
| `index.html` | Coquille HTML et chargement de l’application |
| `app.js` | Curriculum principal, vues, navigation et orchestration |
| `content-advanced.js` | Modules avancés du curriculum |
| `srs.js` | Planification de la répétition espacée |
| `analytics.js` | Calcul du bilan pédagogique |
| `coach.js` | Objectif quotidien et moteur de recommandation |
| `merge.js` | Normalisation et fusion local/cloud |
| `backup.js` | Export et import de progression |
| `cloud.js` | Authentification et persistance Supabase |
| `supabase-config.js` | URL et clé publique Supabase uniquement |
| `sw.js` | Cache PWA et mise à jour hors ligne |
| `styles.css` | Design responsive |
| `supabase/schema.sql` | Table et règles RLS |

La bibliothèque Supabase est chargée à la demande depuis un CDN. Ne jamais ajouter de clé `service_role` ou de clé secrète dans le dépôt.

## 4. Données synchronisées

Une ligne `learning_progress` existe par utilisateur. Le champ JSON `progress` contient actuellement :

```json
{
  "lessons": [],
  "questions": [],
  "wrongs": {},
  "cards": {},
  "activity": [],
  "preferences": {
    "dailyGoal": 5,
    "updatedAt": "2026-08-11T12:00:00.000Z"
  }
}
```

- `lessons` : identifiants des leçons terminées ;
- `questions` : exercices déjà maîtrisés ;
- `wrongs` : erreurs encore à revoir ;
- `cards` : échéances de répétition espacée ;
- `activity` : tentatives horodatées, limitées aux 1 000 plus récentes ;
- `preferences` : objectif quotidien et date de dernière modification.

Les champs ajoutés dans le JSON ne nécessitent pas de migration SQL. `merge.js` doit néanmoins être mis à jour pour chaque nouvelle donnée synchronisée.

## 5. Supabase et sécurité

La table est protégée par RLS : un utilisateur authentifié ne peut lire et modifier que sa propre ligne. Le rôle anonyme n’a aucun droit sur la table.

Configuration attendue dans Supabase Auth :

- Site URL : `https://derkitoo.github.io/irab/`
- Redirect URL : `https://derkitoo.github.io/irab/`

Le schéma a déjà été exécuté. En cas de nouveau projet Supabase, exécuter `supabase/schema.sql`, puis renseigner uniquement l’URL et la clé publique dans `supabase-config.js`.

## 6. Développement et tests

Lancer localement :

```powershell
python -m http.server 5200 --bind 127.0.0.1
```

Puis ouvrir `http://127.0.0.1:5200/`.

Contrôles avant chaque publication :

```powershell
node --check app.js
node --check srs.js
node --check analytics.js
node --check coach.js
node --check merge.js
node --check backup.js
node --check cloud.js
node --check sw.js
node srs.test.mjs
node analytics.test.mjs
node coach.test.mjs
node merge.test.mjs
node backup.test.mjs
git diff --check
```

Après une modification d’un fichier mis en cache, augmenter la version `CACHE` dans `sw.js`. Sans cela, les appareils déjà installés peuvent conserver une ancienne version.

Publication actuelle : pousser `main`, puis publier le même commit sur `gh-pages`.

```powershell
git push origin main
git push origin main:gh-pages
```

## 7. Décisions importantes

- Le mode invité doit toujours rester utilisable si Supabase est indisponible.
- Une première connexion peut recevoir une progression distante `null` ; ce cas est testé.
- La fusion des activités repose sur un identifiant unique par tentative.
- Le choix d’objectif le plus récent gagne grâce à `preferences.updatedAt`.
- Le coach recommande dans cet ordre : révision due, thème sous 70 % après au moins deux tentatives, prochaine leçon inachevée.
- Les anciennes sauvegardes sans `activity` ou `preferences` restent compatibles.
- Le contenu utilisateur ou distant inséré dans le HTML doit passer par `escapeHtml`.

## 8. Limites connues

- Les statistiques commencent à la date d’installation du journal d’activité ; les anciennes réponses maîtrisées n’ont pas d’historique rétroactif.
- Le journal est limité à 1 000 tentatives et ne constitue pas une conservation analytique illimitée.
- Les jours et séries sont calculés en UTC ; il faudra utiliser le fuseau de l’utilisateur pour une précision parfaite autour de minuit.
- `app.js` concentre encore beaucoup de responsabilités et deviendra difficile à maintenir si le contenu grandit fortement.
- Il n’existe pas encore de test automatisé complet dans un vrai navigateur pour l’inscription et la synchronisation entre deux sessions.
- La voix arabe dépend du système et du navigateur ; la qualité varie selon l’appareil.
- La qualité grammaticale de tout le corpus doit encore être relue par un arabophone qualifié.

## 9. Roadmap restante priorisée

### P0 — Fiabilité et confiance

1. Ajouter un test de bout en bout : création de compte, première synchronisation vide, modification sur un appareil et récupération sur un second.
2. Ajouter des messages d’erreur plus explicites et un bouton de nouvelle tentative lorsque Supabase ou le réseau échoue.
3. Ajouter une page Confidentialité expliquant les données stockées et une action de suppression du compte et de sa progression.
4. Introduire une version de schéma applicatif dans `progress` et des migrations explicites pour les futures évolutions.
5. Faire relire les 25 leçons, les analyses et les 129 exercices par un enseignant d’arabe.

### P1 — Expérience pédagogique

1. Adapter la révision au type d’erreur : nature, fonction, état ou marque.
2. Ajouter un mode « session rapide » de 5 minutes construit par le coach.
3. Permettre de reprendre une leçon exactement à la question interrompue.
4. Ajouter des explications alternatives et davantage d’exemples pour chaque erreur récurrente.
5. Calculer le jour local et autoriser un horaire personnel de remise à zéro de l’objectif.
6. Ajouter des badges sobres pour les étapes réellement utiles : première analyse complète, semaine régulière, module maîtrisé.
7. Améliorer l’accessibilité : navigation clavier complète, vérification des contrastes, annonces vocales des retours et test avec lecteur d’écran.

### P2 — Contenu et produit

1. Créer une interface d’administration ou un format de contenu externe afin de ne plus modifier `app.js` pour chaque leçon.
2. Ajouter des enregistrements audio humains, avec licences documentées, en complément de la synthèse vocale.
3. Ajouter une recherche par règle, mot arabe et fonction grammaticale.
4. Produire un glossaire français–arabe relié aux leçons.
5. Ajouter un parcours de diagnostic initial pour recommander un point de départ.
6. Préparer les traductions de l’interface sans dupliquer le contenu.
7. Définir une stratégie produit avant toute monétisation : public cible, métriques pédagogiques, support et politique de conservation des données.

## 10. Proposition des trois prochains sprints

### Sprint 1 — Sécurité utilisateur

- confidentialité et suppression de compte ;
- erreurs réseau compréhensibles ;
- versionnage du format de progression ;
- test complet d’authentification et de synchronisation.

### Sprint 2 — Session intelligente

- session rapide de 5 minutes ;
- catégories d’erreurs ;
- reprise à la question interrompue ;
- fuseau local pour l’objectif quotidien.

### Sprint 3 — Qualité du contenu

- relecture grammaticale experte ;
- correction du corpus ;
- glossaire ;
- séparation du contenu et du moteur d’interface.

## 11. Définition de « terminé » pour un futur jalon

Un jalon est terminé lorsque :

- les anciens comptes et sauvegardes restent lisibles ;
- le mode invité et le mode connecté sont testés ;
- la fusion sur deux appareils ne perd ni ne duplique les données ;
- les tests Node et `git diff --check` passent ;
- l’interface est vérifiée sur ordinateur et mobile ;
- le cache PWA est renouvelé si nécessaire ;
- les workflows GitHub sont verts ;
- la version réellement servie par GitHub Pages est contrôlée.
