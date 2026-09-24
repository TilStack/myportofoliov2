# Déploiement standard (Firebase Hosting)

Site statique : seul `dist/myportofoliov2/browser/` est publié. Les règles Firestore ont leur propre
procédure (`docs/DEPLOY-SECURITY.md`) ; cette commande ne les touche pas.

**Un déploiement se fait toujours depuis `master`**, arbre propre, à jour avec `origin/master`.
Jamais depuis une branche `feat/*` : ce qui est en ligne doit toujours correspondre à `master`.

```bash
git switch master && git pull --ff-only
git status --short          # doit n'afficher aucune ligne
```

## 1. Installer

```bash
npm ci
```

## 2. Construire — avec `npm run build`, pas `ng build`

`npm run build` lance `ng build`, puis le hook `postbuild` : il déplace la page 404 en `404.html`
et génère `sitemap.xml`. Un simple `ng build` ne produit ni l'un ni l'autre.

```bash
npm run build
```

Aucun warning ne doit s'afficher (le bundle initial reste sous 500 kB).

## 3. Vérifier les 3 fichiers

```bash
B=dist/myportofoliov2/browser
test -f $B/404.html    && echo "404.html OK"    || echo "404.html MANQUANT"
test -f $B/robots.txt  && echo "robots.txt OK"  || echo "robots.txt MANQUANT"
test -f $B/sitemap.xml && echo "sitemap.xml OK" || echo "sitemap.xml MANQUANT"
grep -c "<loc>" $B/sitemap.xml      # nombre d'URL : 12 aujourd'hui (une de plus par nouvelle page publique)
```

Puis les tests du build (émulateur Hosting, sans toucher à la production) :

```bash
npm run test:seo            # meta, JSON-LD, sitemap, robots, admin, projets masqués, 404
npm run test:security       # seulement si les règles, l'auth ou Firestore ont changé
```

## 4. Canal preview

Publie une copie temporaire sur une URL de prévisualisation, sans toucher au site en production :

```bash
firebase hosting:channel:deploy preview --expires 1d
```

Ouvre l'URL affichée et vérifie : accueil, une page projet, `/quotes`, `/admin` (connexion Google) et
une URL inexistante (page 404).

## 5. Production

```bash
firebase deploy --only hosting
```

## 6. Contrôles après déploiement

```bash
curl -I https://tilstack.me/sitemap.xml     # attendu : 200, content-type xml
curl -I https://tilstack.me/robots.txt      # attendu : 200, content-type text/plain
curl -I https://tilstack.me/cette-page-nexiste-pas   # attendu : 404 (page 404.html)
curl -I https://tilstack.me/admin | grep -i x-robots-tag   # attendu : noindex, nofollow
```

## Retour arrière

Console Firebase → Hosting → Historique des versions → restaurer la version précédente.
