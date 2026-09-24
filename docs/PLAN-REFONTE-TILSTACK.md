# Plan de refonte tilstack.me — suite de l'audit Phase 0

Merci pour l'audit, il est très clair. Voici mes décisions et la suite complète du chantier.
Ce document est la référence pour tout le chantier : relis-le au début de chaque phase.

---

## Règles de travail (rappel, toujours valables)

1. **Branches** : `feat/seo-prerender` pour les Phases 1 à 5, puis `feat/creative-stack` (créée depuis la précédente) pour la Phase 6. Commits atomiques par sous-étape, messages en français et conventionnels (`feat:`, `fix:`, `chore:`, `perf:`).
2. **Arrêt obligatoire** à la fin de chaque phase : rapport court, `ng build` sans erreur, puis attente de ma validation.
3. **Aucun contenu inventé.** Une information manquante devient un `TODO(israel): ...` dans le code et figure dans le rapport de phase.
4. **Jamais de `firebase deploy`**, ni de modification des règles Firestore sans mon accord explicite. Tests en local uniquement (`npx serve` ou `firebase emulators:start --only hosting`).
5. **Garde-fou performance** : à partir de la Phase 3, aucune phase ne doit faire baisser les scores Lighthouse mobile atteints. Mesure avant/après à chaque phase, avec la commande de ton audit.

---

## Mes réponses à tes 6 décisions

1. **Langue** : français par défaut dans le HTML pré-rendu, bascule EN conservée côté client. Le HTML pré-rendu doit porter `<html lang="fr">`, et I18nService met à jour `document.documentElement.lang` lors d'une bascule (côté navigateur uniquement).
2. **/projects/:id** : on change d'approche.
   - Extrais les projets de `projects.component.ts` vers `src/app/data/projects.data.ts` (interface `Project` typée, avec un champ `slug`).
   - Remplace la route par `/projects/:slug`, alimentée uniquement par ces données locales (plus de Firestore pour les projets).
   - Pré-rends chaque page projet (via `getPrerenderParams` ou `routesFile`), chacune avec son title, sa description, son canonical et son `og:image` (placeholder + TODO).
   - Chaque carte de `/projects` pointe vers sa page détail. La modale peut rester en aperçu rapide.
   - Supprime **BAYARM** (projet inactif). Liste-moi **MyPokemon** et **Tiltine** avec leur description actuelle ; je déciderai.
3. **/contact** : branche ContactComponent comme vraie route pré-rendue et corrige le lien du footer.
4. **@angular/animations** : réaligne sur 20.x. `npm install` doit passer sans `--legacy-peer-deps`.
5. **public/index.html** (page Firebase par défaut) : supprime-le.
6. **DevPea** : l'URL correcte est `TODO(israel): devpea.tech ou devpea.com`. Centralise-la dans une constante unique pour que je n'aie qu'un endroit à corriger. Harmonise aussi GitHub en `https://github.com/TilStack`. LinkedIn et email existants : garde-les tels quels.

---

## Étape préalable — Sécurité (avant la Phase 1, lecture seule)

- Montre-moi le contenu de `firestore.rules` (et `firestore.indexes.json` s'il existe).
- Pour la collection des devis (quotes) : la **liste des noms de champs uniquement**, jamais les données. Je dois savoir si des informations clients (nom, email, téléphone, montant) sont lisibles publiquement.
- Indique si l'écriture est ouverte à tous, et avec quelles validations.
- Propose des règles corrigées, mais **ne les applique pas**.

---

## Phase 1 — Pré-rendu (SSG) + corrections SSR

Objectif : chaque route publique possède un `index.html` complet, avec du vrai texte visible.

1. `ng add @angular/ssr`, puis mode prerender uniquement (déploiement statique sur Firebase Hosting ; seul le dossier `browser/` est servi).
2. Routes à pré-rendre : `/`, `/about`, `/projects`, `/projects/:slug` (tous les slugs), `/blog`, `/quotes`, `/contact`.
3. Rends SSR-safe les services et composants identifiés par l'audit :
   - **ThemeService** : aucun accès à `localStorage`, `matchMedia` ou `document` hors navigateur (`isPlatformBrowser` / `afterNextRender`). Ajoute un **script inline dans `index.html`** qui applique le thème (localStorage, puis `prefers-color-scheme`) avant le premier rendu, pour éviter un flash de thème.
   - **I18nService** : FR par défaut côté serveur, lecture de `localStorage` / `navigator.language` uniquement côté navigateur.
   - **IntroComponent** (splash 2,8 s) : désactivé côté serveur. Ne le supprime pas encore : la décision se prend en Phase 3.
   - **ScrollAnimationService / FadeOnScrollDirective** : `IntersectionObserver` uniquement dans le navigateur.
   - **QuoteModalComponent** : `requestAnimationFrame` uniquement dans le navigateur.
4. **Contenu visible sans JS** : remplace `opacity: 0` sur `.fade-up` par une règle conditionnelle (`html.js-anim .fade-up { opacity: 0 }`), la classe `js-anim` étant ajoutée par le script inline. Le HTML pré-rendu reste ainsi lisible.
5. **Firestore** (quotes, blogPosts) : chargé uniquement côté navigateur, hors du chemin critique. Supprime les services blogPosts inutilisés.
6. `provideClientHydration(withEventReplay())`.
7. `firebase.json` :
   - `public` → le dossier `browser` du build ;
   - `cleanUrls: true`, `trailingSlash: false` ;
   - rewrite `**` → `/index.html` uniquement en repli pour les routes non pré-rendues ;
   - en-têtes : `Cache-Control: public,max-age=31536000,immutable` pour `**/*.@(js|css|woff2|webp|avif|png|jpg|svg)` et `no-cache` pour `**/*.html`.

**Critère de réussite** : `grep -il "<h1" dist/myportofoliov2/browser/**/index.html` liste toutes les routes, et le texte de chaque page est présent dans son HTML.

---

## Phase 2 — SEO et partage social

1. **SeoService** (Meta, Title, DOCUMENT), appelé par chaque route : title, description, canonical, Open Graph, Twitter Card, `og:locale` (fr_FR, alternate en_US). Il remplace les titres génériques `Home | TilPortofolio`.
2. Valeurs pour l'accueil :
   - title : `TIENTCHEU Israel (TilStack) | Développeur Fullstack Flutter & Angular · Formateur IT — Douala`
   - description : `Développeur fullstack web & mobile (Flutter, Angular, FastAPI), formateur en informatique au CEFTI et co-fondateur de DevPea. Je crée des apps et des ressources IA pour enseignants. Basé à Douala, Cameroun.`
   - og:image : `/assets/og/og-home.jpg` en 1200×630 (placeholder + `TODO(israel)`, je le produis sur Canva).
   - Une description propre à chaque route et à chaque projet.
3. **JSON-LD** :
   - `Person` : name, alternateName « TilStack », url, jobTitle, address Douala/CM, sameAs (GitHub, LinkedIn, boutique, DevPea) ;
   - `WebSite` ;
   - `Product` pour chaque produit Chariow (au départ sans prix ; depuis le 24/09/2026 les prix sont connus : `offers { price, priceCurrency: "XAF", availability: InStock, url }`, branché en Phase 4 avec la section boutique visible) ;
   - `CreativeWork` sur chaque page projet.
4. Fichiers : `robots.txt`, `sitemap.xml` (toutes les routes pré-rendues), `theme-color` #14213D, et `manifest.webmanifest`, favicon et apple-touch-icon s'ils manquent.
5. Un seul `<h1>` par page, une hiérarchie de titres propre et un `alt` descriptif sur toutes les images.

---

## Phase 3 — Performance

Cibles Lighthouse mobile : **Performance ≥ 90, SEO 100, Accessibility ≥ 95, Best Practices ≥ 95**. Point de départ : 57 / 83 / 99 / 100, avec un LCP de 16,1 s.

1. **Splash** : propose-moi deux options avec leur impact sur le LCP. (a) suppression pure ; (b) animation ≤ 600 ms non bloquante, affichée uniquement à la première visite (sessionStorage), par-dessus un contenu déjà rendu. J'ai une préférence pour (a) si le hero de la Phase 6 porte déjà l'animation d'entrée.
2. **Images** : `avatar.png` (2,1 Mo), `tiktok_avatar.png` (2,1 Mo) et `formateur.png` (1,2 Mo) → WebP/AVIF responsives, < 150 Ko chacune. `NgOptimizedImage` partout, `priority` sur l'image LCP, `width`/`height` explicites.
3. **Polices** : remplace l'`@import` Google Fonts par des fichiers woff2 auto-hébergés (subset latin, `font-display: swap`) et preload de la graisse critique. Évalue l'abandon d'Inter au profit de Poppins seule, et donne-moi le gain en Ko.
4. `@defer (on viewport)` pour les sections sous la ligne de flottaison.
5. **Budget** : repasser sous **500 kB initial**, sans augmenter le budget. Identifie les plus gros contributeurs du bundle (`--stats-json` + analyse).
6. `prefers-reduced-motion` respecté partout.

---

## Phase 4 — Contenu

Contenu centralisé dans des fichiers typés `src/app/data/*.ts`, intégré aux dictionnaires FR/EN existants de I18nService. On complète l'existant, sans rien dupliquer.

1. **Projets** : ajoute **Séla Cantique**. Mets à jour **Otadex** (lien otadex.tilstack.me conservé, statut « Bientôt sur le Play Store »). Pour Dofa, ajoute les liens stores (`TODO(israel)` s'ils manquent). Supprime BAYARM (voir décision 2).
2. **Produits digitaux** : nouvelle section (sur l'accueil et/ou une route `/boutique`). Données dans `src/app/data/products.data.ts` :
   - « 10 Prompts IA pour Générer des Épreuves Académiques par Classe en 2 min » (BEPC / Probatoire / BAC, avec barèmes) — id Chariow `prd_1bt9cd` ;
   - « Prof 2.0 — Digitaliser son enseignement avec l'IA » (formation en ligne sur l'IA pédagogique pour enseignants ; ancien nom « Prof Augmenté ») — id `prd_ehy1y5`.
   Les CTA pointent vers l'URL exacte de chaque produit : `https://store.tilstack.me/<id>`.
   **Banque de contenu — offres et prix (relevé du 24/09/2026)** :

   | Offre | URL | Prix actuel | Prix barré |
   |---|---|---|---|
   | 10 Prompts IA… (`prd_1bt9cd`) | https://store.tilstack.me/prd_1bt9cd | 1 500 XAF | 3 000 XAF |
   | Prof 2.0… (`prd_ehy1y5`) | https://store.tilstack.me/prd_ehy1y5 | 6 000 XAF | 15 000 XAF |

   Offres **rattachées aux projets** (pas à la section produits) :
   - Otadex, 4 abonnements : Jonin mensuel 2 000 XAF, Kage mensuel 5 000 XAF, Jonin annuel 21 600 XAF, Kage annuel 54 000 XAF (URL : `TODO(israel)`) ;
   - Séla Cantique : don libre à partir de 600 XAF (URL : `TODO(israel)`).

   Chaque prix a la forme `{ amount, currency: 'XAF', compareAt?, updatedAt }` ; à mettre à jour à chaque changement de promo sur Chariow, car le JSON-LD doit correspondre au prix affiché sur la boutique. Le JSON-LD Product (avec `offers`) est branché avec cette section. **À confirmer avant la Phase 4** : afficher ou non les prix sur le site (l'ancienne consigne était « pas de prix affichés »).
3. **Enseignement & Formations** : formateur au CEFTI (Douala) depuis septembre 2023, selon le programme MINESEC (informatique générale, algorithmique & programmation, systèmes d'information MERISE/UML, bases de données), encadrement de projets étudiants (ORICEFT) et création de la formation Prof 2.0. Prévois une liste « Interventions » vide, avec un composant qui se masque si elle est vide. N'invente aucune conférence.
4. **Parcours** (À propos) : CEFTI (depuis 09/2023) ; LEVEGI SARL (stage 2022, puis développeur et encadrant de stagiaires, 01/2023 – 09/2024) ; freelance en développement assisté par IA (depuis 03/2026) ; co-fondateur de DevPea. Formation : Bachelor Conception des Systèmes d'Information (3IL, IUC Logbessou, 2023) ; DEC Programmation & Application mobile (CCNB, 2022). Langues : TCF 2025 (C2/C1), IELTS Academic 2024.
5. **Compétences** en texte, par couches : Mobile (Flutter/Dart) · Web (Angular, TypeScript) · Backend (FastAPI/Python, REST ; NestJS/Node en secondaire) · Données (MongoDB, Firebase) · DevOps (Docker, Firebase Hosting) · IA (Claude Code, NotebookLM, Gemini). Multimédia en discret : Photoshop, Canva, CapCut.
6. **Blog** : conserve les articles locaux et Zerofiltre, sans modification.

---

## Phase 5 (optionnelle, demande-moi avant) — Version /en pré-rendue

Routes `/en/...` pré-rendues depuis les dictionnaires existants, `hreflang` réciproques, `og:locale:alternate`, sitemap bilingue. Donne-moi une estimation avant de commencer.

---

## Phase 6 — Direction artistique « Stack »

Branche `feat/creative-stack`. Une maquette validée existe ; je te la décris ci-dessous et je te fournirai des captures si besoin.

### Principe
Tout le site repose sur une métaphore unique : **construire / empiler des blocs isométriques** (le nom TilStack). Pas de cahier, pas de papier, pas de police manuscrite, pas de tableau de liège : c'est l'univers d'un autre portfolio de référence, et il ne faut rien lui emprunter.

### Design tokens (à conserver ou créer dans `styles/_tokens.scss`)
- Navy `#14213D` (principal) ; variantes de faces `#2B3D66` (dessus), `#14213D` (gauche), `#0B1426` (droite).
- Jaune `#FFDE59` (accent existant, on le garde) ; faces `#FFE98F`, `#FFDE59`, `#E0BC34`.
- Fond clair `#F7F7F7`, texte secondaire `#2B3550` / `#3B4A6B`. Contraste AA vérifié.
- Typo : Poppins (titres 800, corps 400–600) + JetBrains Mono pour les étiquettes techniques (auto-hébergées).
- Boutons : blocs pleins, bordure 2px navy, ombre portée décalée `6px 6px 0` (jaune sur un bouton navy, navy sur un bouton jaune), enfoncement au clic (`translate(4px,4px)`, ombre à 0).
- Fond global : grille isométrique en SVG `pattern` (losanges 56×32, trait navy à 7 % d'opacité), adaptée au thème sombre.

### Composant `IsoBlockComponent` (réutilisable)
- Bloc isométrique en SVG : losange du dessus + face gauche + face droite (viewBox 320×230, profondeur 70).
- Entrées : `label` (texte de la face gauche, `matrix(1 .5 0 1 0 80)`), `side` (texte en mono sur la face droite, `matrix(1 -.5 0 1 160 160)`), `variant` (`navy` | `gold`) et `size`.
- Accessible : `aria-hidden` sur le SVG décoratif, le texte utile étant doublé en HTML si le bloc est interactif.

### Accueil (hero)
- **Gauche** : pile de 4 IsoBlocks, du bas vers le haut : Flutter/mobile (navy), Angular/web (jaune), FastAPI/backend (navy), Formateur IA/CEFTI (jaune). Au sommet, l'**avatar 3D** détouré (`assets/hero/avatar-3d.webp`, fond transparent). En attendant, l'illustration optimisée dans un cadre en arche (bordure navy 4px, fond jaune, ombre `10px 10px 0` navy). Ombre elliptique au sol. Deux petits cubes flottants décoratifs.
- **Animation d'entrée** (navigateur uniquement) : les blocs tombent l'un après l'autre (0,7 s, rebond, décalage 140 ms), puis l'avatar apparaît (pop 0,55 s). Durée totale ≤ 1,2 s. Le HTML pré-rendu montre la pile déjà construite, sans animation bloquante.
- **Parallaxe au pointeur** : pile et avatar ±8 px, grille de fond ±6 px en sens inverse. Désactivée sur tactile et en `prefers-reduced-motion`.
- **Droite** :
  - étiquette mono `// développeur · formateur · Douala` ;
  - H1 sur deux lignes : « Je construis. » / « J'enseigne. », la seconde avec un soulignement en bloc jaune qui se construit de gauche à droite ;
  - paragraphe : « Je suis **TIENTCHEU Israel**, développeur fullstack Flutter & Angular et formateur IT. J'empile les technologies pour livrer des apps solides, et j'aide les enseignants à adopter l'IA. » ;
  - CTA « Voir mes projets » (bloc navy) et « Ma boutique » (bloc jaune) ;
  - liens mono : GitHub, LinkedIn, DevPea.
  - En bas, la phrase discrète : « Le secret ? Du code propre et des élèves qui comprennent. »
- **Navigation** : logo = mini-cube isométrique + « Til » + « Stack » sur fond jaune ; liens Accueil, À propos, Projets, Boutique, Contact ; soulignement jaune épais au survol ; sélecteur FR/EN en blocs.
- **Mobile < 768px** : la pile passe au-dessus du texte à ~60 % de sa taille, sans parallaxe, animation courte.

### À propos : « Les deux faces »
- L'illustration par-dessus, la photo N&B en dessous. Sur desktop, un masque circulaire (~180px) suit le curseur et révèle la photo (lerp dans `requestAnimationFrame`). Sur mobile, la révélation est liée au scroll. En reduced-motion ou sans JS : l'illustration seule, avec un bouton « Voir la vraie version ».
- Ensuite, `DepthPortraitComponent` : **WebGL natif, sans three.js**. Un quad unique, un fragment shader qui décale les UV de la photo selon `photo-depth.webp` × la position du pointeur (amplitude ~0,02). Gyroscope sur mobile, avec la permission iOS derrière un bouton. Fallback `<img>` statique. Rendu en pause hors viewport ou quand l'onglet est caché. Moins de 5 Ko gzip.
- Assets attendus dans `assets/hero/` : `illustration.webp`, `photo.webp`, `photo-depth.webp`, `avatar-3d.webp`. Tout fichier manquant devient un placeholder + TODO.

### Compétences
Empilement vertical de couches (Mobile → Web → Backend → Données → DevOps → IA), comme un schéma d'architecture. Chaque couche est un IsoBlock large et plat, avec ses technologies en texte.

### Projets : « La pile »
- Scène isométrique : chaque projet est un IsoBlock. Le dessus porte le nom et le logo, la face gauche le statut, la face droite la stack. La variante de couleur dépend de la catégorie (DevPea / LEVEGI / Personnel).
- Survol et focus clavier : le bloc monte (`translateY(-12px)`) et son ombre s'élargit. Clic ou Entrée → `/projects/:slug`.
- Chaque bloc est un `<a>` avec du vrai texte. Sur mobile, pile verticale de cartes-blocs, sans isométrie.

### Boutique
Les produits Chariow en **blocs jaunes** mis à part, avec un CTA vers `store.tilstack.me`.

### Livrable Phase 6
Arrête-toi après le hero pour validation (captures desktop et mobile, Lighthouse), puis À propos, puis Compétences, Projets et Boutique.

---

## Livrable final du chantier

- Récapitulatif par phase, avec les commits.
- Tableau Lighthouse : audit initial → après Phase 3 → après Phase 6.
- Liste consolidée des `TODO(israel)`.
- Commandes de test et de déploiement :
  `npm ci` → `ng build` → vérification du HTML pré-rendu → `firebase emulators:start --only hosting` → `firebase deploy --only hosting`.
- Procédure de contrôle après déploiement : Facebook Sharing Debugger, LinkedIn Post Inspector, soumission du sitemap dans Google Search Console, et `curl -s https://tilstack.me | grep -iE "<meta|<h1"`.

**Commence par l'étape Sécurité, puis la Phase 1.**
