/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  IMAGES CONFIG  —  source unique pour toutes les images du site
 * ══════════════════════════════════════════════════════════════════════════════
 *
 *  COMMENT AJOUTER UNE IMAGE :
 *   1. Dépose ton fichier image dans le sous-dossier correspondant (voir ci-dessous)
 *   2. Modifie le nom du fichier dans cette config
 *      → L'image s'affiche automatiquement partout sur le site
 *
 *  DOSSIERS  (tous dans  public/images/) :
 *   ┌─────────────┬────────────────────────────────────────────────────────┐
 *   │  montage/   │  Page Home — grille de 5 photos du Cameroun            │
 *   │  travel/    │  Page About — carrousel de voyage (3 photos)           │
 *   │  profile/   │  Page About — carte profil empilée (3 photos)          │
 *   │  blog/      │  Blog — couvertures des articles locaux                │
 *   └─────────────┴────────────────────────────────────────────────────────┘
 *
 *  CONSEIL : utilise le script scripts/resize-image.mjs pour redimensionner
 *  automatiquement tes photos aux bonnes dimensions.
 * ══════════════════════════════════════════════════════════════════════════════
 */

// ── Page Home — Grille photos Cameroun (5 photos) ─────────────────────────────
// Dossier  : public/images/montage/
// Taille   : ≥ 900 × 600 px  |  Format : JPG / WebP  |  < 300 Ko chacune
//
// Laisse la valeur vide ('') pour garder la photo Unsplash actuelle.
export const MONTAGE_PHOTOS = [
  { file: '',  caption: 'Yaoundé' },   // P1 — grande colonne gauche
  { file: '',  caption: 'Bansoa'  },   // P2 — haut milieu
  { file: '',  caption: 'Douala'  },   // P3 — haut droite
  { file: '',  caption: 'Kribi'   },   // P4 — bas milieu
  { file: '',  caption: 'Lagdo'   },   // P5 — grande colonne droite
];
// Exemple une fois les photos ajoutées :
//   { file: 'images/montage/photo-1.jpg', caption: 'Yaoundé' },

// ── Page About — Carrousel de voyage (3 photos) ────────────────────────────────
// Dossier  : public/images/travel/
// Taille   : 900 × 500 px  |  Format : JPG / WebP  |  < 300 Ko
//
// Laisse src vide ('') pour garder la photo Unsplash actuelle.
export const TRAVEL_PHOTOS: { src: string; alt: string; caption: string }[] = [
  { src: '', alt: 'Hauts plateaux du Cameroun',  caption: 'The highlands of Cameroon' },
  { src: '', alt: 'Vie de rue à Douala',          caption: 'Douala — Street Life'      },
  { src: '', alt: 'Quotidien à Kribi',            caption: 'Kribi, South Cameroon'     },
];
// Exemple une fois les photos ajoutées :
//   { src: 'images/travel/photo-1.jpg', alt: '...', caption: '...' },

// ── Page About — Carte profil (3 photos optionnelles) ─────────────────────────
// Dossier  : public/images/profile/
// Taille   : 400 × 400 px  |  Format : JPG / WebP  |  < 150 Ko
//
// Laisse src vide ('') pour conserver le placeholder gradient/emoji actuel.
export const PROFILE_PHOTOS: { src: string; label: string }[] = [
  { src: 'images/profile/me_pro.jpg',      label: 'Israel T.'     },   // Carte 1 — photo pro
  { src: 'images/profile/me.jpg',          label: 'Full-Stack Dev' },  // Carte 2 — photo générale
  { src: 'images/profile/me_charisme.jpg', label: 'Explorer'      },   // Carte 3 — photo charisme
];
// Exemple une fois les photos ajoutées :
//   { src: 'images/profile/photo-1.jpg', label: 'Israel T.' },

// ── Blog — Couvertures des articles locaux ────────────────────────────────────
// Dossier  : public/images/blog/
// Taille   : 1200 × 630 px (ratio 16:9)  |  Format : JPG / WebP  |  < 400 Ko
//
// Laisse la valeur vide ('') pour garder le dégradé de couleur actuel.
export const BLOG_COVERS: Record<string, string> = {
  'angular-signals-guide':        '',   // → 'images/blog/angular-signals.jpg'
  'nestjs-postgresql-api':        '',   // → 'images/blog/nestjs-postgresql.jpg'
  'flutter-vs-react-native-2025': '',   // → 'images/blog/flutter-vs-rn.jpg'
};
