# Passation — Iʿrāb FR

- Dernière mise à jour : 11 août 2026
- Dernier jalon livré : sprint 2 — session intelligente
- Commit de référence : `a2e1edd` (coach), puis les correctifs de fusion du sprint 1

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
- coach personnalisé : objectif quotidien 5/10/15, priorité aux révisions, détection des thèmes faibles et recommandation de la prochaine leçon ;
- page Confidentialité, effacement des données locales et suppression définitive du compte ;
- messages d’erreur réseau explicites, avec bouton de nouvelle tentative et reprise automatique au retour du réseau ;
- format de progression versionné, migré automatiquement et protégé contre l’écrasement par une version plus ancienne ;
- session rapide de dix exercices composée par le coach ;
- catégories d’erreurs — nature, fonction, état, marque, analyse — avec révision ciblée par catégorie ;
- reprise d’une leçon à la question interrompue, synchronisée entre appareils ;
- jours, séries et objectif quotidien calculés dans le fuseau de l’appareil ;
- maîtrise révocable : un exercice raté ne compte plus comme maîtrisé.

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
| `session.js` | Composition de la session rapide |
| `question-topics.js` | Catégorie de compétence de chaque exercice |
| `mastery.js` | Définition unique de « maîtrisé » |
| `day.js` | Jour local, décalage et libellés de jours |
| `progress-schema.js` | Version du format de progression et migrations |
| `sync.js` | Orchestration pull/merge/push, indépendante du DOM |
| `cloud-errors.js` | Traduction des erreurs Supabase et réseau |
| `merge.js` | Normalisation et fusion local/cloud |
| `backup.js` | Export et import de progression |
| `cloud.js` | Authentification et persistance Supabase |
| `supabase-config.js` | URL et clé publique Supabase uniquement |
| `sw.js` | Cache PWA et mise à jour hors ligne |
| `styles.css` | Design responsive |
| `supabase/schema.sql` | Table, règles RLS et fonction `delete_own_account` |

La bibliothèque Supabase est chargée à la demande depuis un CDN. Ne jamais ajouter de clé `service_role` ou de clé secrète dans le dépôt.

## 4. Données synchronisées

Une ligne `learning_progress` existe par utilisateur. Le champ JSON `progress` contient actuellement :

```json
{
  "schemaVersion": 1,
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
- `preferences` : objectif quotidien et date de dernière modification ;
- `resume` : leçon et question quittées en cours de route, ou `null` ;
- `schemaVersion` : version du format, gérée par `progress-schema.js`.

Les champs ajoutés dans le JSON ne nécessitent pas de migration SQL. `merge.js` doit néanmoins être mis à jour pour chaque nouvelle donnée synchronisée.

### Faire évoluer le format

1. incrémenter `CURRENT_SCHEMA_VERSION` dans `progress-schema.js` ;
2. ajouter la migration correspondante dans l’objet `migrations`, indexée par la version de départ ;
3. compléter `merge.js` si la nouvelle donnée doit être fusionnée entre appareils ;
4. couvrir l’ancien format dans `progress-schema.test.mjs`.

Les champs inconnus sont conservés à l’identique et une progression distante portant une version supérieure n’est jamais fusionnée ni réécrite : la synchronisation rend l’état `blocked` et invite à actualiser l’application.

Un champ optionnel ajouté sans incrémenter la version, comme `resume`, ne bloque pas les anciennes versions ; en revanche `mergeProgress` liste ses champs explicitement, donc un ancien client qui fusionne effacera ce champ. N’incrémenter la version que lorsqu’une ancienne version interpréterait mal des données existantes.

## 5. Supabase et sécurité

La table est protégée par RLS : un utilisateur authentifié ne peut lire et modifier que sa propre ligne. Le rôle anonyme n’a aucun droit sur la table.

La fonction `delete_own_account` est `security definer` mais n’agit que sur `auth.uid()` : elle supprime la ligne de progression puis le compte lui-même. Elle n’est exécutable que par le rôle `authenticated`. C’est le seul moyen de supprimer un compte depuis le navigateur, aucune clé d’administration n’étant présente côté client. Si elle est absente du projet, l’application supprime la progression, déconnecte l’utilisateur et l’indique explicitement.

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
node --check day.js
node --check mastery.js
node --check question-topics.js
node --check session.js
node --check progress-schema.js
node --check cloud-errors.js
node --check sync.js
node --check merge.js
node --check backup.js
node --check cloud.js
node --check sw.js
node srs.test.mjs
node analytics.test.mjs
node coach.test.mjs
node merge.test.mjs
node backup.test.mjs
node progress-schema.test.mjs
node cloud-errors.test.mjs
node sync.test.mjs
node question-topics.test.mjs
node session.test.mjs
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
- Chaque carte SRS porte un horodatage `at` : c'est la réponse la plus récente qui gagne la fusion, jamais celle qui a le plus de `reps`. Sans cela, un échec était effacé par une réussite plus ancienne.
- Une erreur reste dans `wrongs` tant que la carte fusionnée n'indique pas une réussite postérieure (`reps > 0`).
- La déconnexion efface la progression locale : elle appartient au compte quitté et se retrouverait sinon fusionnée dans le compte suivant.
- Le choix d’objectif le plus récent gagne grâce à `preferences.updatedAt`.
- Le coach recommande dans cet ordre : révision due, thème sous 70 % après au moins deux tentatives, prochaine leçon inachevée.
- « Maîtrisé » se lit sur la carte de répétition espacée (`reps > 0`), pas sur `questions` : la maîtrise est révocable dès qu'un exercice est raté. `questions` reste l'historique des réussites et sert la fusion.
- La session rapide se remplit dans cet ordre : révisions dues, thèmes fragiles, suite du parcours.
- Les catégories d'exercices vivent dans `question-topics.js`, hors des fichiers de contenu ; un test échoue si un exercice est ajouté sans catégorie.
- Les jours viennent de `day.js` et suivent le fuseau de l'appareil. Les échéances SRS étaient déjà locales.
- Les anciennes sauvegardes sans `activity` ou `preferences` restent compatibles.
- Le contenu utilisateur ou distant inséré dans le HTML doit passer par `escapeHtml`.
- La logique de synchronisation vit dans `sync.js`, sans DOM : c’est ce qui la rend testable sous Node.
- Une erreur cloud n’est jamais affichée brute ; elle passe par `describeCloudError`, qui décide aussi si « Réessayer » a un sens.
- Une suppression de compte supprime d’abord la progression distante ; si la fonction serveur manque, l’utilisateur est déconnecté et prévenu plutôt que laissé dans le doute.

## 8. Limites connues

- Les statistiques commencent à la date d’installation du journal d’activité ; les anciennes réponses maîtrisées n’ont pas d’historique rétroactif.
- Le journal est limité à 1 000 tentatives et ne constitue pas une conservation analytique illimitée.
- Le découpage des exercices en cinq catégories est un choix pédagogique, à confirmer lors de la relecture du corpus par un enseignant.
- La session rapide vise cinq minutes par un nombre fixe de dix exercices, sans minuteur réel.
- L'objectif quotidien se remet à zéro à minuit local ; un horaire de bascule personnalisé reste à faire.
- Les compteurs de maîtrise ont baissé pour les comptes existants au passage à la maîtrise révocable : c'est attendu, les données ne sont pas perdues.
- Les 129 exercices sont 52 questions écrites, 52 consolidations générées automatiquement et 25 constructions par blocs.
- `app.js` concentre encore beaucoup de responsabilités et deviendra difficile à maintenir si le contenu grandit fortement.
- `sync.test.mjs` couvre le parcours complet inscription, première synchronisation vide, deux appareils, pannes réseau et isolation entre comptes, mais contre un faux Supabase : il ne remplace pas un test dans un vrai navigateur contre le vrai service.
- La suppression définitive du compte dépend de la fonction `delete_own_account` ; elle doit être déployée sur le projet Supabase existant avant que le bouton fonctionne complètement.
- La page Confidentialité décrit l’usage réel des données mais n’a pas été relue juridiquement.
- La voix arabe dépend du système et du navigateur ; la qualité varie selon l’appareil.
- La qualité grammaticale de tout le corpus doit encore être relue par un arabophone qualifié.

## 9. Roadmap restante priorisée

### P0 — Fiabilité et confiance

1. Déployer `delete_own_account` sur le projet Supabase existant, puis vérifier la suppression avec un compte de test.
2. Compléter la couverture par un test dans un vrai navigateur, contre un projet Supabase de test : inscription, confirmation e-mail et synchronisation entre deux sessions réelles.
3. Faire relire les 25 leçons, les analyses et les 129 exercices par un enseignant d’arabe.
4. Faire relire la page Confidentialité par un regard juridique avant toute diffusion large.

Terminés dans le sprint 1 : messages d’erreur explicites avec nouvelle tentative, page Confidentialité et suppression des données, versionnage du format de progression, test complet de la couche de synchronisation.

### P1 — Expérience pédagogique

1. Ajouter des explications alternatives et davantage d’exemples pour chaque erreur récurrente.
2. Autoriser un horaire personnel de remise à zéro de l’objectif quotidien.
3. Ajouter des badges sobres pour les étapes réellement utiles : première analyse complète, semaine régulière, module maîtrisé.
4. Améliorer l’accessibilité : navigation clavier complète, vérification des contrastes, annonces vocales des retours et test avec lecteur d’écran.

### P2 — Contenu et produit

1. Créer une interface d’administration ou un format de contenu externe afin de ne plus modifier `app.js` pour chaque leçon.
2. Ajouter des enregistrements audio humains, avec licences documentées, en complément de la synthèse vocale.
3. Ajouter une recherche par règle, mot arabe et fonction grammaticale.
4. Produire un glossaire français–arabe relié aux leçons.
5. Ajouter un parcours de diagnostic initial pour recommander un point de départ.
6. Préparer les traductions de l’interface sans dupliquer le contenu.
7. Définir une stratégie produit avant toute monétisation : public cible, métriques pédagogiques, support et politique de conservation des données.

## 10. Proposition des trois prochains sprints

### Sprint 1 — Sécurité utilisateur (livré)

- confidentialité et suppression de compte ;
- erreurs réseau compréhensibles ;
- versionnage du format de progression ;
- test complet de la couche de synchronisation.

### Sprint 2 — Session intelligente (livré)

- session rapide de dix exercices ;
- catégories d’erreurs et révision ciblée par catégorie ;
- reprise à la question interrompue ;
- fuseau local pour les jours, les séries et l’objectif.

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
