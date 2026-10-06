# Phase 6 — Finitions et direction « Stack »

À placer dans `docs/PHASE-6-FINITIONS.md`. Ce document **complète** la Phase 6 de `docs/PLAN-REFONTE-TILSTACK.md` et lui est **prioritaire** en cas de conflit.

Source : audit visuel des pages Accueil et À propos (captures desktop du 06/10/2026) et comparaison avec un portfolio de référence.

---

## Règles (inchangées)

- Branche `feat/creative-stack` depuis `master`. Commits atomiques, en français, sans trailer.
- Garde-fou : la médiane Lighthouse mobile ne descend pas sous **Performance 90, SEO 100, A11y 95** sur `/`, `/about`, `/projects`, `/boutique`, `/quotes`.
- **Aucun contenu inventé.** Tout manque devient `TODO(israel)`.
- Arrêt et captures (desktop 1440 et mobile 390) à la fin de chaque étape.

---

## Étape 6.0 — Bugs et cohérence (avant tout travail créatif)

### Bugs visibles

1. **Images manquantes** :
   - le grand bloc gauche de « Cameroon, My Home » (accueil) est un rectangle vide ;
   - la première image du carrousel « Cameroon » (À propos) est une carte grise vide.

   Cause probable : `@defer`, `content-visibility` ou lazy loading dans un carrousel ou une grille. Corrige-le et ajoute un test e2e qui vérifie que chaque `<img>` visible de ces sections a `naturalWidth > 0` après défilement.
2. **Icônes de guillemets cassées** sur les cartes de citations (accueil et `/quotes`) : elles s'affichent comme deux carrés jaune pâle. Remplace-les par un SVG inline.
3. **Espaces vides anormaux** entre les sections d'À propos : environ 200 px après « Where to Find Me » et après « Tools & Gear ». Ce sont probablement des placeholders `@defer` surdimensionnés. Harmonise l'espacement vertical avec un seul token (par exemple `--section-gap`).
4. **Hero d'accueil** : environ 250 px de vide au-dessus du titre. Le contenu doit être centré visuellement dans la première vue, au-dessus de « Scroll down ».
5. **Textes tronqués** dans « Tools & Gear » (`Dell Latitude 5490 — i5-8350…`, `JBL Flip …`) : autorise 2 lignes, sans troncature.
6. **Éléments flottants empilés** en bas à droite (mascotte et bouton retour en haut) : ils se superposent au contenu. Garde uniquement le bouton retour en haut ; la mascotte disparaît (l'avatar 3D du hero la remplace).

### Cohérence du contenu

7. **« a thousand hills »** (« mille collines ») est le surnom du Rwanda. Remplace-le par la formule consacrée pour le Cameroun : « l'Afrique en miniature » / « Africa in miniature ».
8. **Photos de la section Cameroun** : le crédit dit « Photos by Israel Tientcheu », mais certaines images (savane à acacia, Coccinelle orange, plongée sous-marine) semblent provenir d'une banque d'images. Liste-moi le chemin et l'origine de chaque image de ces deux sections. Je remplacerai celles qui ne sont pas de moi, ou on retirera le crédit. Corrige aussi « & son Téléphone » (mélange de langues).
9. **Citations** : la carte « What Inspires Me » dit « Words from great minds », alors que toutes les citations sont de moi. Nouveau texte : « Mes propres maximes, nées de l'expérience » / « My own maxims, born from experience ».
10. **Pile technique** : la carte « What I Build » cite NestJS dans son extrait de code, et « Tools & Gear » cite « ChatGPT & Claude AI ». Aligne-les sur la stack officielle : Flutter, Angular, FastAPI ; outils IA : Claude Code, NotebookLM, Gemini.
11. **« The Educator Role »** : supprime les stats faibles (« 2+ articles », « 3+ books », « ∞ »). Fusionne cette section avec « Teaching & Training » en une seule section, qui garde : CEFTI (matières), Prof 2.0, articles Zerofiltre, et la galerie « Teaching Moments » (ce sont de vraies photos, c'est le meilleur atout de la page).
12. **Langue des libellés** : en EN, aucun libellé ne doit rester en français (badge « FORMATEUR », « son Téléphone »), et inversement en FR. Seuls les noms des produits restent en français dans les deux langues. Leur description suit la langue active.
13. **Ordre du nom** : utilise partout « TIENTCHEU Israel » (footer et copyright compris).
14. **Carte « Who I Am »** : le recadrage actuel ne montre que le haut de la tête. Cadre sur le visage (`object-position`) ou utilise une autre photo.

### Ce qui manque

15. **Projets phares sur l'accueil** : c'est le plus gros manque pour un portfolio de développeur. Ajoute une section « Projets phares » juste après le hero, avec 3 projets de `projects.data.ts` marqués `featured: true` : Dofa, Otadex et Séla Cantique. Chaque projet affiche sa capture, son statut, sa stack et un lien vers sa page.
16. **Contact dans la navbar** (pas seulement dans le footer).
17. **Footer** : icônes sociales (GitHub, LinkedIn, X, TikTok), email (mailto), lien boutique, lien DevPea.
18. **« Where to Find Me »** : ajoute DevPea et la boutique ; remplace l'avatar de la carte TikTok par l'icône TikTok, comme pour les autres cartes.
19. **Sélecteur de langue** : un segment `FR | EN` avec l'état actif visible, au lieu d'un « FR » seul ambigu.

### Icônes

20. Remplace **tous les emojis utilisés comme icônes** (My Stack, Tools & Gear, Other Hats) par un jeu d'icônes SVG au trait cohérent (inline ou sprite, sans librairie lourde), avec `aria-hidden`.

---

## Étape 6.1 — Écran de chargement « Stack » (nouveau)

Le portfolio de référence a un écran de chargement de marque : son logo s'assemble bloc par bloc. On fait la nôtre, cohérente avec la métaphore, **sans sacrifier la performance**.

- **Animation** : le logo TilStack s'assemble. 3 blocs isométriques tombent et s'empilent (navy, jaune, navy), puis le mot « Til**Stack** » apparaît lettre par lettre en dessous. Blocs en SVG, animation en CSS uniquement.
- **Durée** : 900 ms maximum, puis fondu de 200 ms.
- **Première visite uniquement** (`sessionStorage`). Aucun écran de chargement sur une navigation interne ni sur un rechargement dans la même session.
- **Jamais pour** `prefers-reduced-motion`, les robots, ni sans JavaScript : le HTML pré-rendu ne contient pas l'overlay. Il est injecté par le script inline de `index.html`, avant le premier rendu, uniquement si les conditions sont remplies.
- **Ne retarde jamais le contenu** : la page se rend normalement sous l'overlay. L'overlay se retire à `max(900 ms, DOMContentLoaded)`, plafonné à 1,2 s même si le réseau est lent.
- **Accessibilité** : `aria-hidden="true"` sur l'overlay, `aria-busy` sur `<main>` pendant l'animation, focus jamais piégé.
- **Mesure** : Lighthouse avant/après avec et sans `sessionStorage`. Si la Performance médiane passe sous 90, propose une réduction (600 ms) plutôt que de supprimer l'écran.

---

## Étape 6.2 — Hero « Stack » (accueil)

Selon la Phase 6 du plan, avec ces précisions :

- **Gauche** : pile de 4 IsoBlocks (Flutter/mobile, Angular/web, FastAPI/backend, Formateur IA/CEFTI) et `avatar-3d.webp` debout sur le losange supérieur (≈ 410 px desktop, sans cadre), avec une ombre elliptique sous les pieds.
- **Droite** :
  - étiquette mono `// développeur · formateur · Douala` ;
  - H1 en deux lignes, « Je construis. » / « J'enseigne. », avec le soulignement jaune qui se construit sous la seconde ;
  - paragraphe avec le nom **TIENTCHEU Israel** et l'alias TilStack ;
  - CTA « Voir mes projets » et « Ma boutique » ;
  - lien secondaire « Télécharger mon CV » (le fichier CV actuel est conservé).
- **Animations** : l'empilement démarre **après** la fin de l'écran de chargement (événement partagé), ou immédiatement s'il n'y en a pas. Parallaxe au pointeur sur desktop uniquement.
- **Mobile** : la pile est au-dessus du texte, à environ 60 % de sa taille.
- La photo DevFest actuelle du hero passe dans la galerie « Teaching Moments » ou dans À propos, au choix, avec une capture pour que je valide.

## Étape 6.3 — À propos

- Le hero « Developer. Educator. Explorer. » est conservé. La pile de photos « Click to cycle » est remplacée par **« Les deux faces »** (illustration → photo N&B au survol ou au scroll), puis par le **DepthPortraitComponent** (WebGL natif, < 5 Ko gzip), selon le plan.
- Assets dans `public/hero/` : `illustration.webp`, `photo.webp`, `photo-depth.webp`. Si l'un manque, garde la pile de photos actuelle pour cette partie et mets un TODO.
- La section Compétences devient un **empilement de couches isométriques** (Mobile → Web → Backend → Données → DevOps → IA), en remplacement des cartes à emojis.

## Étape 6.4 — Projets « La pile » et Boutique

- Selon le plan : IsoBlocks cliquables sur `/projects`, et pile verticale de cartes sur mobile.
- **Boutique** : ajoute l'image de couverture de chaque produit (`public/assets/products/prd_1bt9cd.jpg` et `prd_ehy1y5.jpg`, TODO si absentes), affichée dans la carte **et** déclarée dans le JSON-LD `image`.

## Étape 6.5 — Polices et nettoyage

- Réévalue le budget des polices (Inter + Poppins + JetBrains Mono) avec captures avant/après. Objectif : 3 fichiers woff2 au maximum en préchargement total.
- Supprime `@angular/animations` si plus aucun code ne l'utilise.
- Tâche de fin de chantier (déjà au plan) : migration zoneless.

---

## Livrable par étape

Captures desktop et mobile, Lighthouse médian (5 runs) avant/après, liste des TODO restants. **Attends ma validation entre chaque étape.**
