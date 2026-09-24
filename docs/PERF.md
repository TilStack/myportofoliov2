# Performance — méthode, résultats, décisions (Phase 3)

## Mesurer

Un seul run Lighthouse varie de ±10 points : on ne rapporte que la **médiane de 5 runs** par route, sur un
build servi **avec compression** (l'émulateur Hosting sert du brotli).

```bash
npm run build
firebase emulators:exec --only hosting --project tilportofoliov2 \
  "node scripts/lighthouse-median.mjs <étiquette> 5"          # 5 routes ; ou : ... 5 / /about
```

Le script écrit `.lighthouse/<étiquette>.json` (médianes, runs individuels, **élément LCP** de chaque route).
Garde-fous automatiques du build : `npm run test:perf` (images ≤ 200 kB, polices auto-hébergées, préchargements,
dimensions des images, bundle < 500 kB, contenu du bas de page dans le HTML).

## Résultats (mobile, médiane de 5 runs)

| Route | Perf | LCP | TBT | CLS | A11y |
|---|---|---|---|---|---|
| `/` | 69 → **99** | 15,7 s → **2,0 s** | 206 → **48 ms** | 0,005 → 0 | 99 → 100 |
| `/about` | 53 → **92** | 24,6 s → **2,3 s** | 734 → **274 ms** | 0,01 → 0 | 100 → 100 |
| `/projects` | 67 → **98** | 12,8 s → **1,8 s** | 256 → **153 ms** | 0,004 → 0 | 95 → 96 |
| `/projects/dofa` | 88 → **99** | 3,4 s → **2,1 s** | 102 → **23 ms** | 0,003 → 0 | 100 → 100 |
| `/quotes` | 45 → **99** | 13,1 s → **2,0 s** | 486 → **25 ms** | 0,42 → 0 | 100 → 100 |

SEO 100 et Best Practices 100 partout. Seule cible manquée : TBT de `/about` (274 ms pour < 200 ms).

## Ce qui a changé (par effet)

1. **Images** : WebP responsives (`npm run images`), 2,1 Mo → 8 kB pour l'avatar de la mascotte (chargé sur toutes
   les pages), `priority` sur l'image LCP. La bande passante n'est plus saturée avant l'élément LCP.
2. **`index.preloadInitial: false`** : 16 `modulepreload` en moins devant le premier rendu (FCP 2,1 → 1,2 s en simulation).
3. **Splash supprimé**, `js-anim` posé après le premier écran : le contenu visible d'emblée n'est jamais à `opacity: 0`.
4. **Polices auto-hébergées** (plus de CSS bloquant ni de 2ᵉ origine), une seule précharge.
5. **`@defer (hydrate on viewport)`** + `content-visibility: auto` sous la ligne de flottaison ; photos Unsplash
   demandées à l'approche de l'écran seulement.
6. **`/quotes`** : citations locales au premier rendu, Firestore après 4 s de repos ou à la première interaction.

## Décisions ouvertes

- **Inter** : évaluée (gain mesuré : −47 kB de police, LCP −0,2 à −0,4 s). Décision du 24/09/2026 : on la garde ; le budget des polices sera réévalué en Phase 6, avec JetBrains Mono.
- **Zoneless** (`provideZonelessChangeDetection`, retrait de zone.js) : essayé, −35 kB de JS initial, gain de score
  faible (+1 à +2) ; non adopté pour l'instant (décision du 24/09/2026) car `quote-modal` et `blog` mutent des champs
  non-signal dans des timers. Tâche de fin de chantier ajoutée au plan.
- `public/hero/avatar-3d.png` (861 kB), non référencé : supprimé le 24/09/2026, le WebP (51 kB) suffit.
