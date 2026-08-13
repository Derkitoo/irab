# Passation — Iʿrāb FR

- Dernière mise à jour : 12 août 2026
- État : application publiée et fonctionnelle, neuf sprints livrés puis consolidation
- Ce qui bloque la suite n’est plus du code : c’est la relecture du corpus par un enseignant d’arabe

Ce document décrit l’état du projet, pas son histoire. Le détail des changements est dans `git log`, dont les messages expliquent chaque décision.

## 1. Liens

| | |
| --- | --- |
| Application | https://derkitoo.github.io/irab/ |
| Dossier de relecture | https://derkitoo.github.io/irab/revue.html |
| Dépôt | https://github.com/Derkitoo/irab |
| Branches | `main` pour le développement, `gh-pages` pour la publication |
| Projet Supabase | `pxywcrnvhejdmmlqpipq` |
| Validation | `.github/workflows/pages.yml` |

## 2. Ce que fait l’application

Un parcours de grammaire arabe pour francophones : 12 modules, 25 leçons, 133 exercices, en français et en arabe, sur ordinateur et mobile. Indépendante d’Arabiya.

**Apprendre.** QCM, choix de mots, terminaisons et construction du iʿrāb par blocs. Chaque correction explique la réponse ; au deuxième échec sur un même exercice, une seconde explication prend un autre angle et ajoute souvent un exemple analysé. Lecture audio de l’arabe par la synthèse vocale du navigateur. Glossaire de 59 termes, relié aux leçons qui les emploient. Recherche sur tout le contenu, en français, en translittération ou en arabe.

**Être guidé.** Test de positionnement facultatif au premier lancement, une sonde par module. Répétition espacée avec révision ciblée, y compris par type d’erreur : nature, fonction, état, marque, analyse complète. Coach avec objectif quotidien réglable, session rapide de dix exercices, reprise à la question quittée. Bilan : maîtrise, réussite, activité sur sept jours, série, erreurs fréquentes, types d’erreurs, et six jalons.

**Garder sa progression.** Sauvegarde locale, PWA installable, fonctionnement hors ligne. Export et import JSON. Compte Supabase optionnel avec fusion sans doublon entre appareils. Page Confidentialité, effacement local et suppression définitive du compte.

**Rester utilisable.** Navigation clavier complète avec conservation du focus, annonces pour lecteur d’écran, arabe balisé `lang="ar"`, contrastes AA, `prefers-reduced-motion` respecté.

Le déploiement public et les 19 suites de tests sont verts au moment de cette passation.

## 3. Architecture

HTML, CSS et modules JavaScript natifs. Aucune étape de compilation, aucune dépendance installée. La bibliothèque Supabase est le seul code tiers, chargé à la demande depuis un CDN et seulement si un compte est utilisé.

**Contenu** — se modifie sans toucher au moteur.

| Fichier | Responsabilité |
| --- | --- |
| `content-core.js` | Modules 1 à 4 |
| `content-advanced.js` | Modules 5 à 12 |
| `content-helpers.js` | Constructeurs de leçon et d’exercice |
| `curriculum.js` | Assemble le programme et dérive consolidations et constructions |
| `explanations.js` | Seconde explication de chaque exercice |
| `glossary.js` | Les 59 termes |
| `question-topics.js` | Catégorie de compétence de chaque exercice |

**Pédagogie** — logique pure, testable sous Node, sans DOM.

| Fichier | Responsabilité |
| --- | --- |
| `srs.js` | Planification de la répétition espacée |
| `mastery.js` | Définition unique de « maîtrisé » |
| `analytics.js` | Calcul du bilan |
| `coach.js` | Objectif quotidien et recommandation |
| `session.js` | Composition de la session rapide |
| `diagnostic.js` | Sondes de positionnement et placement |
| `badges.js` | Jalons, dérivés de l’historique |
| `day.js` | Jour local, décalage, journée d’objectif |

**Données et synchronisation**

| Fichier | Responsabilité |
| --- | --- |
| `progress-schema.js` | Version du format et migrations |
| `merge.js` | Fusion local/cloud |
| `sync.js` | Orchestration pull/merge/push, sans DOM |
| `cloud.js` | Authentification et persistance Supabase |
| `cloud-errors.js` | Traduction des erreurs Supabase et réseau |
| `backup.js` | Export et import |
| `supabase-config.js` | URL et clé publique uniquement |
| `supabase/schema.sql` | Table, RLS et `delete_own_account` |

**Interface et outils**

| Fichier | Responsabilité |
| --- | --- |
| `index.html` | Coquille, lien d’évitement, zone d’annonce |
| `app.js` | Vues, navigation, orchestration |
| `styles.css` | Design responsive |
| `sw.js` | Cache PWA |
| `normalize.js` | Normalisation unique du texte français et arabe |
| `glossary-index.js` | Rattache un terme aux leçons par son texte arabe |
| `search.js` | Index et recherche |
| `tools/build-review.mjs` | Génère `revue.html` |
| `tools/review-flags.js` | Points signalés à l’enseignant |
| `revue.html` | **Fichier généré**, ne jamais éditer à la main |

## 4. Données synchronisées

Une ligne `learning_progress` par utilisateur, protégée par RLS.

```json
{
  "schemaVersion": 1,
  "lessons": [],
  "questions": [],
  "wrongs": {},
  "cards": {},
  "activity": [],
  "preferences": { "dailyGoal": 5, "resetHour": 0, "updatedAt": "2026-08-11T12:00:00.000Z" },
  "resume": null,
  "diagnostic": null
}
```

| Champ | Contenu | Règle de fusion |
| --- | --- | --- |
| `lessons` | leçons terminées | union |
| `questions` | exercices réussis **au moins une fois** — historique, pas maîtrise | union |
| `wrongs` | erreurs encore à revoir | conservée tant que la carte fusionnée n’indique pas de réussite postérieure |
| `cards` | échéances de répétition espacée, horodatées par `at` | la réponse la plus récente gagne |
| `activity` | tentatives horodatées, 1 000 plus récentes | union par identifiant de tentative |
| `preferences` | objectif quotidien, heure de bascule | le plus récent `updatedAt` gagne |
| `resume` | leçon et question quittées | le plus récent `at` gagne |
| `diagnostic` | trace du positionnement | le plus récent `at` gagne |
| `schemaVersion` | version du format | la plus élevée des deux |

### Faire évoluer le format

Ajouter un champ optionnel ne demande ni migration SQL ni incrément de version : les champs inconnus sont conservés. Mais `mergeProgress` liste ses champs explicitement, donc un ancien client qui fusionne effacera un champ qu’il ne connaît pas — acceptable pour `resume`, pas pour une donnée précieuse.

N’incrémenter `CURRENT_SCHEMA_VERSION` que lorsqu’une ancienne version interpréterait **mal** des données existantes. Dans ce cas :

1. incrémenter la constante dans `progress-schema.js` ;
2. ajouter la migration dans `migrations`, indexée par la version de départ ;
3. compléter `merge.js` si la donnée doit voyager entre appareils ;
4. couvrir l’ancien format dans `progress-schema.test.mjs`.

Une progression distante portant une version supérieure n’est jamais fusionnée ni réécrite : la synchronisation rend l’état `blocked` et invite à actualiser l’application.

## 5. Supabase et sécurité

RLS : un utilisateur authentifié ne lit et ne modifie que sa propre ligne. Le rôle anonyme n’a aucun droit.

`delete_own_account` est `security definer` mais n’agit que sur `auth.uid()` : elle supprime la ligne de progression puis le compte. Seul le rôle `authenticated` peut l’exécuter. C’est le seul chemin de suppression depuis le navigateur, aucune clé d’administration n’existant côté client. La fonction est déployée et la suppression a été vérifiée par le mainteneur le 12 août 2026. Si elle manquait sur un nouveau projet, l’application supprimerait la progression, déconnecterait l’utilisateur et le lui dirait.

Configuration Supabase Auth attendue — Site URL et Redirect URL : `https://derkitoo.github.io/irab/`.

Sur un nouveau projet : exécuter `supabase/schema.sql`, puis renseigner **uniquement** l’URL et la clé publique dans `supabase-config.js`. Jamais de clé `service_role` ni de secret dans le dépôt.

## 6. Développer, valider, publier

```powershell
python -m http.server 5200 --bind 127.0.0.1
```

Puis `http://127.0.0.1:5200/`.

La liste exhaustive des contrôles est dans `.github/workflows/pages.yml`, et `project.test.mjs` échoue si un module ou une suite y manque : il n’y a donc plus de liste à tenir à jour ici. En local, avant de pousser :

```powershell
Get-ChildItem *.js -Exclude *.test.mjs | ForEach-Object { node --check $_.Name }
Get-ChildItem *.test.mjs | ForEach-Object { node $_.Name }
node tools/build-review.mjs --check
git diff --check
```

Après toute modification d’un fichier mis en cache, **incrémenter `CACHE` dans `sw.js`** — actuellement `irab-fr-v14`. Sans cela, les appareils déjà installés gardent l’ancienne version.

Publier :

```powershell
git push origin main
git push origin main:gh-pages
```

Puis vérifier la version réellement servie, et non seulement le succès du push :

```powershell
curl.exe -s "https://derkitoo.github.io/irab/sw.js" | Select-Object -First 1
```

## 7. Décisions à ne pas défaire

Ces choix ont chacun corrigé un défaut réel. Les annuler le ramènerait.

**Synchronisation**

- Le mode invité reste utilisable si Supabase est indisponible.
- Une première connexion peut recevoir une progression distante `null` ; ce cas est testé.
- Chaque carte porte un horodatage `at` : la réponse la plus récente gagne la fusion, jamais celle qui a le plus de `reps`. Sans cela un échec était effacé par une réussite plus ancienne.
- Une erreur reste dans `wrongs` tant que la carte fusionnée n’indique pas une réussite postérieure.
- La déconnexion efface la progression locale : elle appartient au compte quitté et se retrouvait sinon fusionnée dans le compte suivant.
- `sync.js` n’a aucun accès au DOM : c’est ce qui rend l’échange testable sous Node.
- Une erreur cloud n’est jamais affichée brute ; `describeCloudError` la traduit et décide si « Réessayer » a un sens.
- Une suppression de compte retire d’abord la progression distante ; si la fonction serveur manque, l’utilisateur est déconnecté et prévenu plutôt que laissé dans le doute.

**Pédagogie**

- « Maîtrisé » se lit sur la carte (`reps > 0`), pas sur `questions` : la maîtrise est révocable dès qu’un exercice est raté. `questions` reste l’historique des réussites, et sert la fusion et les jalons.
- Le coach recommande dans cet ordre : révision due, thème sous 70 % après au moins deux tentatives, prochaine leçon inachevée.
- La session rapide se remplit ainsi : révisions dues, thèmes fragiles, suite du parcours.
- La seconde explication n’apparaît qu’au deuxième échec : au premier, l’apprenant n’a pas encore eu l’occasion de se servir de la première.
- Les sondes du positionnement sont des exercices existants, et leurs réponses n’alimentent ni le journal ni la répétition espacée — sinon un débutant en sortirait avec une dizaine de cartes en retard sur des leçons jamais ouvertes.
- Le positionnement ne commande le départ que tant qu’aucune leçon n’est terminée.
- Les jalons sont calculés, jamais stockés, et ne portent que sur l’historique : un jalon obtenu ne se reprend jamais.
- Les jours viennent de `day.js` et suivent le fuseau de l’appareil, avec une heure de bascule réglable.

**Contenu**

- Le contenu ne vit plus dans `app.js`. Une leçon s’ajoute dans `content-core.js` ou `content-advanced.js` ; `curriculum.js` dérive le reste.
- Le champ `analysis` d’une leçon s’affiche dans un panneau droite-à-gauche : il doit être en arabe, et un test le vérifie.
- Les catégories vivent dans `question-topics.js`, hors des fichiers de contenu. Un test échoue si un exercice est ajouté sans catégorie.
- Les liens du glossaire vers les leçons sont calculés depuis le texte arabe, jamais saisis : une leçon renommée ne peut pas laisser de lien mort.
- Tout terme du glossaire doit être employé en arabe quelque part dans le parcours ; un test l’exige. Pour en ajouter un, le nommer dans la règle de la leçon qui l’enseigne.
- Tout ce qui a été rédigé après la relecture assistée est réuni dans `explanations.js`, pour que la relecture ait un point d’entrée unique.
- `revue.html` est généré : le corriger à la main serait écrasé, et la CI refuse un fichier périmé. Les corrections vont dans les fichiers de contenu.

**Interface**

- L’application se redessine entièrement à chaque interaction, donc `render` retient l’élément focalisé et le retrouve après coup. Tout nouvel élément interactif doit porter un attribut listé dans `FOCUS_KEYS`, ou un `id`.
- La zone d’annonce vit dans `index.html`, hors de `#app` : à l’intérieur elle serait effacée à chaque rendu. Elle met les messages en file, car deux annonces peuvent tomber dans la même action.
- `choiceGroup` rend tous les groupes de propositions, exercices comme sondes : en double, une correction d’accessibilité n’en touchait qu’un.
- Les couleurs de texte passent par `--gold-text` et `--muted`, calibrées AA. `--gold` est réservé au graphique, et `--gold-light` est le seul doré lisible sur fond vert.
- Le contenu utilisateur ou distant inséré dans le HTML passe par `escapeHtml`.

**Outillage**

- `normalize.js` est l’unique normaliseur de texte, `day.js` l’unique calcul de jour. L’ordre des opérations dans `normalize.js` n’est pas indifférent : décomposer, retirer les seules marques latines, recomposer, puis traiter l’arabe. Tout retirer d’un coup casse ئ et ؤ, et « نائب » devient « نايب ».
- `project.test.mjs` garde le cache de `sw.js`, les contrôles du workflow et l’unicité de ces deux implémentations. Ces trois listes étaient tenues à la main, et leurs oublis sont silencieux.

## 8. Limites connues

**Contenu — la dette principale.**

- Le corpus a reçu une relecture assistée, pas la validation d’un arabophone qualifié. Sept corrections nettes ont été appliquées ; l’exactitude d’ensemble n’est pas garantie, et les vocalisations n’ont pas été vérifiées caractère par caractère.
- Les 54 secondes explications et leurs exemples n’ont jamais été relus : c’est la plus grande surface de contenu non validée.
- Les 59 définitions du glossaire emploient la terminologie classique mais n’ont pas été relues.
- Le classement des 54 exercices en cinq catégories est un choix pédagogique non validé.
- Les 133 exercices sont 54 questions écrites, 54 consolidations générées et 25 constructions par blocs : le contenu original est plus mince que le total ne le suggère.

**Mesure et heuristiques.**

- Les statistiques commencent à l’installation du journal d’activité : pas d’historique rétroactif.
- Le journal est plafonné à 1 000 tentatives. Un historique très ancien peut donc en sortir et, en théorie, faire disparaître les jalons « Semaine régulière » ou « Retour tenu ».
- Le placement au premier module raté est une heuristique simple : elle suppose un parcours strictement progressif.
- La session rapide vise cinq minutes par un nombre fixe de dix exercices, sans minuteur.
- Les compteurs de maîtrise ont baissé pour les comptes existants au passage à la maîtrise révocable. C’est attendu ; aucune donnée n’est perdue.

**Vérifications qui manquent.**

- `sync.test.mjs` couvre inscription, première synchronisation vide, deux appareils, pannes réseau et isolation entre comptes — mais contre un faux Supabase. Rien ne remplace un test dans un vrai navigateur contre le vrai service.
- L’accessibilité a été vérifiée au clavier et par contrôle programmatique des contrastes et des noms accessibles, jamais avec un vrai lecteur d’écran ni par une personne concernée.
- La page Confidentialité décrit l’usage réel des données mais n’a pas été relue juridiquement.

**Technique.**

- `app.js` concentre encore les vues, la navigation et l’orchestration. Le contenu en est sorti, le reste non.
- La voix arabe dépend du système et du navigateur ; la qualité varie beaucoup selon l’appareil.

## 9. Ce qui reste à faire

Rien de ce qui suit ne peut être fait par un agent seul : chaque point demande une personne, un compte ou une décision.

**D’abord.**

1. **Faire relire le corpus par un enseignant d’arabe.** Le dossier est prêt : envoyer https://derkitoo.github.io/irab/revue.html ou sa version imprimée. Il couvre les 25 leçons, les 54 exercices, les 54 secondes explications, les 59 définitions et le classement, avec 23 points déjà signalés comme incertains et un repère citable par élément. Reporter les corrections dans les fichiers de contenu, puis régénérer.
2. **Faire relire la page Confidentialité** par un regard juridique avant toute diffusion large.
3. **Faire tester avec un vrai lecteur d’écran**, idéalement par quelqu’un qui en utilise un au quotidien.

**Ensuite.**

4. Tester la synchronisation dans un vrai navigateur contre un projet Supabase de test : inscription, confirmation e-mail, deux sessions réelles. Suppose d’accepter une dépendance à Playwright, donc la fin du « zéro dépendance ».
5. Enregistrements audio humains, avec licences documentées, en complément de la synthèse vocale.
6. Préparer les traductions de l’interface sans dupliquer le contenu. Gros remaniement mécanique de `app.js`, sans bénéfice tant qu’aucune deuxième langue n’existe.
7. Format de contenu externe ou interface d’administration, si le corpus grandit beaucoup.
8. Définir une stratégie produit avant toute monétisation : public visé, métriques pédagogiques, support, conservation des données.

## 10. Définition de « terminé »

Un jalon n’est terminé que lorsque :

- les anciens comptes et sauvegardes restent lisibles ;
- le mode invité et le mode connecté sont tous deux testés ;
- la fusion sur deux appareils ne perd ni ne duplique rien ;
- les 19 suites de tests et `git diff --check` passent ;
- l’interface est vérifiée sur ordinateur **et** à 360 px de large ;
- le cache PWA est renouvelé si un fichier caché a changé ;
- les deux workflows GitHub sont verts ;
- la version réellement servie par GitHub Pages est contrôlée, et pas seulement le succès du push.
