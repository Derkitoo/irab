# Iʿrāb FR

Application indépendante d’apprentissage de la grammaire arabe et du iʿrāb pour francophones.

La passation complète, les décisions techniques et la roadmap restante sont disponibles dans [`HANDOFF.md`](./HANDOFF.md).

## Contenu actuel

- 12 modules progressifs
- 25 leçons bilingues français–arabe
- 133 exercices avec correction expliquée et consolidation
- construction du iʿrāb par blocs ordonnables
- sélection directe de mots et exercices de terminaisons
- tableau de maîtrise par compétence
- révision ciblée des erreurs
- répétition espacée avec échéances adaptatives
- moteur de répétition testé automatiquement
- lecture audio arabe par synthèse vocale du navigateur
- progression sauvegardée dans le navigateur
- interface responsive mobile et ordinateur
- application PWA installable
- fonctionnement hors ligne
- export et restauration de la progression entre appareils
- mode invité et interface de compte
- synchronisation Supabase active
- bilan pédagogique : réussite, activité sur sept jours, série active, maîtrise par thème et erreurs fréquentes
- coach pédagogique avec objectif quotidien réglable et recommandation adaptée aux lacunes
- page Confidentialité, effacement local et suppression définitive du compte
- messages d’erreur réseau explicites avec bouton de nouvelle tentative
- format de progression versionné et migré automatiquement
- session rapide de dix exercices composée par le coach
- catégories d’erreurs et révision ciblée par nature, fonction, état, marque ou analyse
- reprise d’une leçon à la question interrompue
- jours, séries et objectif quotidien dans le fuseau de l’appareil
- glossaire français–arabe de 59 termes, chacun relié aux leçons qui l’emploient
- contenu des leçons séparé du moteur d’interface
- navigation clavier, annonces pour lecteur d’écran et contrastes AA
- heure personnelle de remise à zéro de l’objectif quotidien
- seconde explication et exemple supplémentaire quand la même erreur revient
- recherche sur les leçons, les exercices et le glossaire, en français comme en arabe

## Activer les comptes Supabase

1. Créer un projet Supabase.
2. Exécuter `supabase/schema.sql` dans l’éditeur SQL du projet.
3. Copier l’URL du projet et la clé publique dans `supabase-config.js`.
4. Ajouter `https://derkitoo.github.io/irab/` aux URL de redirection autorisées dans Supabase Auth.

La progression locale est fusionnée avec la progression distante lors de la connexion. La clé `service_role` ne doit jamais être ajoutée au projet web.

Le script SQL crée aussi la fonction `delete_own_account`, seul chemin autorisé pour qu’un utilisateur supprime lui-même son compte depuis le navigateur. Sans elle, la page Confidentialité supprime la progression synchronisée et déconnecte l’utilisateur, puis signale que le compte lui-même n’a pas pu être supprimé.

## Lancer localement

Depuis ce dossier :

```powershell
python -m http.server 5200 --bind 127.0.0.1
```

Puis ouvrir `http://127.0.0.1:5200/`.

Le projet est volontairement autonome : HTML, CSS et JavaScript natifs, sans dépendance à Arabiya.
