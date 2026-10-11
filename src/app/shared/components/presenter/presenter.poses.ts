/**
 * Poses de l'avatar 3D « présentateur » (fond transparent, mêmes proportions que l'avatar du héros).
 * Pour donner une pose dédiée à une section (ex. la main tendue vers le stack) : déposer l'image dans
 * public/hero/ et remplacer le `src` de la clé correspondante ; tant qu'aucune n'existe, la pose par défaut sert.
 */
export type PresenterPose = 'default' | 'stack' | 'projects' | 'contact';

export interface PresenterImage {
  src: string;
  width: number;
  height: number;
}

const DEFAULT: PresenterImage = { src: 'hero/avatar-3d.webp', width: 336, height: 900 };

export const PRESENTER_POSES: Record<PresenterPose, PresenterImage> = {
  default: DEFAULT,
  // TODO(israel): poses dédiées (main tendue vers le stack, vers les projets, salut pour le contact…).
  stack: DEFAULT,
  projects: DEFAULT,
  contact: DEFAULT,
};
