# Iʿrāb FR

Application indépendante d’apprentissage de la grammaire arabe et du iʿrāb pour francophones.

## Contenu actuel

- 12 modules progressifs
- 25 leçons bilingues français–arabe
- 129 exercices avec correction expliquée et consolidation
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
- synchronisation Supabase prête à configurer

## Activer les comptes Supabase

1. Créer un projet Supabase.
2. Exécuter `supabase/schema.sql` dans l’éditeur SQL du projet.
3. Copier l’URL du projet et la clé publique dans `supabase-config.js`.
4. Ajouter `https://derkitoo.github.io/irab/` aux URL de redirection autorisées dans Supabase Auth.

La progression locale est fusionnée avec la progression distante lors de la connexion. La clé `service_role` ne doit jamais être ajoutée au projet web.

## Lancer localement

Depuis ce dossier :

```powershell
python -m http.server 5200 --bind 127.0.0.1
```

Puis ouvrir `http://127.0.0.1:5200/`.

Le projet est volontairement autonome : HTML, CSS et JavaScript natifs, sans dépendance à Arabiya.
