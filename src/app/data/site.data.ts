/**
 * Liens et constantes du site — source unique.
 * Modifier ici propage la valeur partout (pages, données projets, futur SEO).
 */
export const SITE_URL = 'https://tilstack.me';
export const SITE_NAME = 'TIENTCHEU Israel (TilStack)';
export const PERSON_NAME = 'TIENTCHEU Israel';
export const PERSON_ALIAS = 'TilStack';

/** Image de partage par défaut (1200×630), utilisée quand une page n'a pas la sienne. */
// TODO(israel): remplacer public/assets/og/og-home.jpg (placeholder généré) par ta version Canva 1200×630.
export const DEFAULT_OG_IMAGE = '/assets/og/og-home.jpg';
export const DEFAULT_OG_IMAGE_ALT = 'TIENTCHEU Israel — TilStack';

export const GITHUB_URL = 'https://github.com/TilStack';
// TODO(israel): URL LinkedIn correcte ? /in/israel-tientcheu/ (valeur actuelle) ou /in/tientcheuisrael/
//   (ancien lien de la page d'accueil). Une seule constante à corriger.
export const LINKEDIN_URL = 'https://www.linkedin.com/in/israel-tientcheu/';
export const TWITTER_URL = 'https://x.com/tilstack';
export const CONTACT_EMAIL = 'israel01tientcheu@gmail.com';

export const STORE_URL = 'https://store.tilstack.me';

// TODO(israel): l'URL correcte de DevPea est devpea.tech ou devpea.com ? Une seule constante à corriger.
// (La valeur actuelle, devpea.com, est celle qui était déjà dans le code.)
export const DEVPEA_URL = 'https://devpea.com';
export const DEVPEA_LINKEDIN_URL = 'https://www.linkedin.com/company/devpea/';

/**
 * UID Firebase Auth du compte admin (connexion Google sur /admin).
 * Public par nature : la vraie protection est dans firestore.rules (isAdmin()).
 * TODO(israel): après ta première connexion sur /admin, copie ici l'UID affiché,
 *   ET dans firestore.rules (remplacer __ADMIN_UID__) avant le déploiement.
 */
export const ADMIN_UID = '';
