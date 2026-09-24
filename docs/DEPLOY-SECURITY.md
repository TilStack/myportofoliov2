# Déploiement de la sécurité Firestore

Objectif : passer d'une base ouverte (lecture/écriture publiques, « admin » protégé seulement
par un mot de passe dans le code) à des règles strictes + une vraie connexion admin (Google).

**Rien de ce document n'est exécuté automatiquement.** Chaque commande est lancée par toi.

## Ce qui change

| Avant | Après |
|---|---|
| Tout le monde lit et écrit tout | Public : lit uniquement les citations `approved` |
| Mot de passe admin dans le TypeScript | Connexion Google sur `/admin`, UID vérifié par les règles |
| Email des visiteurs stocké dans `quotes` (lisible par tous) | Coordonnées dans `quoteSubmissions` (lecture réservée à l'admin) |
| Visiteur pouvait tout modifier / supprimer | Visiteur : proposer (pending), liker (±1). Rien d'autre |

Le mot de passe a été retiré du code, mais il **reste dans l'historique git** (dépôt public).
Considère-le comme compromis : ne l'utilise plus nulle part, et change-le si tu l'as réutilisé.

## 0. Prérequis (console Firebase, une seule fois)

1. **Authentication → Méthode de connexion** : activer **Google** (renseigner l'email d'assistance).
2. **Authentication → Paramètres → Domaines autorisés** : `tilstack.me` et `localhost` présents.
3. **Paramètres du projet → Comptes de service → Générer une nouvelle clé privée**.
   Enregistre le fichier **hors du dépôt** (ex. `~/secrets/tilportofoliov2-sa.json`).
   Les motifs `*service-account*.json`, `*serviceAccount*.json` et `*-firebase-adminsdk-*.json`
   sont dans `.gitignore`, mais ne compte pas dessus : garde la clé hors du dossier du projet.
4. **Sauvegarde les règles actuelles** : console → Firestore → Règles → copie le texte dans un
   fichier local (pour pouvoir revenir en arrière).

## 1. Récupérer ton UID admin

```bash
npm start            # http://localhost:4200/admin
```

Connecte-toi avec ton compte Google. Tant que `ADMIN_UID` est vide, la page affiche
« Première connexion » et ton **UID**. Copie-le à **deux** endroits :

1. `src/app/data/site.data.ts` → `export const ADMIN_UID = '<ton uid>';`
2. `firestore.rules` → dans `isAdmin()`, remplace le marqueur (`request.auth.uid == '…'`) par
   ton UID.

Vérifie qu'il ne reste plus de marqueur :

```bash
grep -c "__ADMIN_UID__" firestore.rules      # doit afficher 0
```

> Tant que le marqueur est présent, personne n'est admin : c'est sans danger, mais tu ne pourrais
> plus modérer.

## 2. Vérifier localement (émulateurs, sans toucher à la production)

```bash
npm ci
npm run build
npm run test:security        # règles (72) + migration (12) + parcours navigateur (14)
```

## 3. Migrer les données (Admin SDK)

Ordre important : **avant** de déployer, car le nouveau site ne lit que `status == 'approved'`.

Le script lit le chemin de la clé dans la variable d'environnement `GOOGLE_APPLICATION_CREDENTIALS`
(pas d'argument en ligne de commande, pour que le chemin ne reste pas dans l'historique du shell
avec des options). La clé doit être **hors du dossier du projet** : le script refuse un fichier situé
dans le dépôt.

```bash
export GOOGLE_APPLICATION_CREDENTIALS=~/secrets/tilportofoliov2-sa.json   # chemin absolu, hors dépôt

# a) Simulation : affiche des comptes uniquement, n'écrit rien
node scripts/migrate-quotes.mjs --dry-run

# b) Si les comptes te semblent justes (le script n'affiche ni textes ni emails) :
node scripts/migrate-quotes.mjs --apply
```

Le script :
- donne `status: 'approved'` aux citations sans status ;
- déplace `submitterEmail`, `submitterRole`, `submitterLinkedin` vers `quoteSubmissions`
  (document `migrated-<idCitation>`, avec `quoteId`) puis les supprime de `quotes` ;
- est relançable sans risque (idempotent) et se vérifie lui-même à la fin.

Après la migration, l'ancien site continue de fonctionner (les citations ont un `status`).

## 4. Déployer, en une seule commande

```bash
npm run build
firebase deploy --only firestore:rules,hosting
```

Règles et site doivent partir ensemble : le nouveau site n'est compatible qu'avec les nouvelles règles.

## 5. Vérifications après déploiement

Depuis un terminal, **sans être connecté** (ces requêtes anonymes doivent être refusées) :

```bash
API_KEY=$(grep -oP "apiKey: '\K[^']+" src/environments/environment.ts)
DB="https://firestore.googleapis.com/v1/projects/tilportofoliov2/databases/(default)/documents"

# 1. Coordonnées des visiteurs : lecture refusée            → attendu : 403
curl -s -o /dev/null -w "quoteSubmissions   : %{http_code}\n" "$DB/quoteSubmissions?key=$API_KEY"

# 2. Liste non filtrée de quotes : refusée                  → attendu : 403
curl -s -o /dev/null -w "quotes non filtrées : %{http_code}\n" "$DB/quotes?key=$API_KEY"

# 3. Suppression anonyme : refusée                          → attendu : 403
curl -s -o /dev/null -w "suppression        : %{http_code}\n" -X DELETE "$DB/quotes/inexistant?key=$API_KEY"

# 4. Liste filtrée sur les approuvées : autorisée           → attendu : 200
curl -s -o /dev/null -w "quotes approuvées  : %{http_code}\n" -X POST \
  "https://firestore.googleapis.com/v1/projects/tilportofoliov2/databases/(default)/documents:runQuery?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"structuredQuery":{"from":[{"collectionId":"quotes"}],"where":{"fieldFilter":{"field":{"fieldPath":"status"},"op":"EQUAL","value":{"stringValue":"approved"}}},"limit":1}}'
```

Puis dans le navigateur :

- [ ] `/quotes` : les citations approuvées s'affichent ; aucun bouton d'édition ni de modération.
- [ ] Proposer une citation : elle n'apparaît pas publiquement ; elle apparaît dans la modération.
- [ ] `/admin` : connexion Google OK, message « Accès admin actif ».
- [ ] `/quotes` connecté : boutons ajouter / modérer / éditer / supprimer visibles ; approuver une
      proposition la publie et l'email du visiteur est visible **dans la modération seulement**.
- [ ] Un autre compte Google est refusé sur `/admin` (« Ce compte n'est pas autorisé »).

## Retour arrière

- **Règles** : console Firestore → Règles → coller la sauvegarde du §0.4 → Publier.
- **Site** : console Hosting → Historique des versions → Restaurer la version précédente.

Les données migrées restent compatibles avec l'ancien site (le `status` est simplement en plus).

## 6. App Check (après le déploiement)

Protège les requêtes Firestore contre les scripts hors de ton site. Le code est prêt, désactivé.

1. Console Firebase → **App Check** → enregistrer l'app Web avec **reCAPTCHA v3** → copier la clé de site.
2. `src/app/core/config/app-check.config.ts` : `enabled: true` et `siteKey: '<clé>'`.
3. Redéployer le site. **Observe d'abord** les métriques App Check (mode non appliqué) pendant
   quelques jours avant de cliquer sur « Appliquer » pour Firestore.

## Limites connues

- Un visiteur peut encore augmenter/diminuer les likes (±1 par requête) ; App Check limite l'abus.
- Un visiteur peut soumettre du spam (propositions `pending`) : il est modéré, jamais publié.
- Les citations approuvées qui contiendraient encore des champs `submitter*` restent lisibles tant
  que la migration n'a pas été appliquée : c'est pourquoi elle passe avant le déploiement.
