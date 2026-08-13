# Iʿrāb FR

Apprendre la grammaire arabe et le iʿrāb en français : reconnaître la nature d’un mot, sa fonction, l’état que cette fonction impose et la marque qui le rend visible.

**→ [Essayer l’application](https://derkitoo.github.io/irab/)**

12 modules, 25 leçons et 133 exercices, du « ce mot est-il un nom, un verbe ou une particule ? » jusqu’à l’analyse complète d’une phrase. Utilisable sans compte, hors ligne, et installable comme application.

## Ce qu’on y trouve

**Des exercices qui expliquent.** QCM, sélection de mots, terminaisons, et construction du iʿrāb en assemblant des blocs. Chaque correction justifie la réponse ; quand le même exercice est raté une seconde fois, une explication différente prend un autre angle et ajoute souvent un exemple analysé. L’arabe se fait lire à voix haute par le navigateur.

**Un parcours qui s’adapte.** Test de positionnement facultatif pour démarrer au bon module. Répétition espacée, révision ciblée des erreurs, y compris par type — nature, fonction, état, marque, analyse. Coach avec objectif quotidien réglable, session rapide de dix exercices, reprise à la question quittée. Bilan détaillé et six jalons pour les étapes qui comptent.

**De quoi chercher.** Glossaire de 59 termes de grammaire, chacun relié aux leçons qui l’emploient. Recherche sur tout le contenu, en français, en translittération ou en arabe — vocalisé ou non.

**Une progression qui reste.** Sauvegardée dans le navigateur, exportable en JSON, et synchronisable entre appareils avec un compte Supabase optionnel. Page Confidentialité, effacement local et suppression définitive du compte.

**Accessible.** Navigation clavier complète, annonces pour lecteur d’écran, arabe balisé pour être prononcé correctement, contrastes conformes AA, mouvement réduit respecté.

## Lancer et vérifier

Aucune dépendance à installer : HTML, CSS et modules JavaScript natifs, sans étape de compilation.

```powershell
python -m http.server 5200 --bind 127.0.0.1
```

Puis ouvrir `http://127.0.0.1:5200/`.

Avant de pousser :

```powershell
Get-ChildItem *.js -Exclude *.test.mjs | ForEach-Object { node --check $_.Name }
Get-ChildItem *.test.mjs | ForEach-Object { node $_.Name }
node tools/build-review.mjs --check
git diff --check
```

Les 19 suites de tests couvrent la répétition espacée, la fusion entre appareils, les migrations de format, le corpus lui-même et la cohérence du dépôt. `.github/workflows/pages.yml` rejoue tout à chaque poussée, et un test échoue si un module ou une suite y manque.

Après toute modification d’un fichier mis en cache, incrémenter `CACHE` dans `sw.js`, sinon les appareils déjà installés gardent l’ancienne version.

## Modifier le contenu

Les leçons vivent dans `content-core.js` et `content-advanced.js`, hors du moteur d’interface. `curriculum.js` en dérive les passes de consolidation et les constructions par blocs. Les catégories d’exercices sont dans `question-topics.js`, les secondes explications dans `explanations.js`, le glossaire dans `glossary.js`.

Le contenu attend la validation d’un enseignant d’arabe. Le dossier de relecture réunit tout ce qui doit être vérifié, avec un repère citable par élément :

**→ [Dossier de relecture](https://derkitoo.github.io/irab/revue.html)**

Il est **généré** par `node tools/build-review.mjs` : les corrections se reportent dans les fichiers de contenu, jamais dans `revue.html`.

## Activer les comptes Supabase

1. Créer un projet Supabase.
2. Exécuter `supabase/schema.sql` dans son éditeur SQL — il crée la table, ses règles RLS et la fonction `delete_own_account`.
3. Renseigner l’URL du projet et la clé publique dans `supabase-config.js`.
4. Déclarer `https://derkitoo.github.io/irab/` comme Site URL et Redirect URL dans Supabase Auth.

La clé `service_role` ne doit jamais entrer dans ce dépôt. La progression locale est fusionnée avec la progression distante à la connexion, sans doublon ni perte.

## Aller plus loin

[`HANDOFF.md`](./HANDOFF.md) décrit l’architecture fichier par fichier, les données synchronisées et leurs règles de fusion, les décisions qu’il vaut mieux ne pas défaire et pourquoi, les limites connues et ce qui reste à faire.
