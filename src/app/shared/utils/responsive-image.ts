import { ImageLoaderConfig } from '@angular/common';
import { IMAGE_MANIFEST } from '../../data/image-manifest';

/** Attributs à passer à `NgOptimizedImage` (`ngSrc`, `width`, `height`, `ngSrcset`). */
export interface ResponsiveImage {
  src: string;
  width: number;
  height: number;
  /** Descripteurs de largeur pour `ngSrcset` (« 320w, 640w »), résolus en URL par `imageLoader`. Vide : une seule variante. */
  srcset: string;
  /** Même srcset en URL complètes, pour un `<img>` classique. Vide : une seule variante. */
  srcsetUrls: string;
}

/** Dimensions de repli pour une image hors manifeste (SVG…) : le CSS fixe la taille réelle. */
const FALLBACK = { w: 800, h: 450 };

const normalize = (src: string) => src.replace(/^\/+/, '');

/** URL de la variante `width` d'une image du manifeste (`<nom>-<largeur>.webp`, la plus grande sans suffixe). */
function variantUrl(key: string, width: number, max: number): string {
  return width === max ? key : key.replace(/\.webp$/, `-${width}.webp`);
}

/**
 * Loader de `NgOptimizedImage` (fourni via `IMAGE_LOADER`) : les variantes sont générées à l'avance par
 * `npm run images`. Sans largeur demandée, ou pour une image hors manifeste, l'URL est inchangée.
 */
export function imageLoader({ src, width }: ImageLoaderConfig): string {
  const key = normalize(src);
  const info = IMAGE_MANIFEST[key];
  if (!info || !width) return key;
  const best = info.widths.find(w => w >= width) ?? info.w;
  return variantUrl(key, best, info.w);
}

/**
 * Attributs responsives d'une image générée par `npm run images`.
 * `src` est le chemin de la plus grande variante (ex. `images/formateur.webp`).
 * Un chemin absent du manifeste garde des dimensions nominales et aucune variante.
 */
export function responsiveImage(src: string): ResponsiveImage {
  const key = normalize(src);
  const info = IMAGE_MANIFEST[key];
  if (!info) return { src: key, width: FALLBACK.w, height: FALLBACK.h, srcset: '', srcsetUrls: '' };
  const multiple = info.widths.length > 1;
  return {
    src: key,
    width: info.w,
    height: info.h,
    srcset: multiple ? info.widths.map(w => `${w}w`).join(', ') : '',
    srcsetUrls: multiple ? info.widths.map(w => `${variantUrl(key, w, info.w)} ${w}w`).join(', ') : '',
  };
}
