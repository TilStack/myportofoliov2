import { PRODUCTS } from './products.data';
import { Project } from './projects.data';
import {
  DEVPEA_URL, GITHUB_URL, LINKEDIN_URL, PERSON_ALIAS, PERSON_NAME, SITE_NAME, SITE_URL, STORE_URL,
} from './site.data';

/** Objet JSON-LD (schema.org). */
export type JsonLd = Record<string, unknown>;

/** URL absolue à partir d'un chemin du site (avec ou sans « / » initial) ; une URL absolue reste inchangée. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}/${path.replace(/^\/+/, '')}`;
}

const PERSON_ID = `${SITE_URL}/#person`;

/** Référence légère à la personne, pour les nœuds qui la citent (auteur, éditeur, marque). */
const personRef = (): JsonLd => ({
  '@type': 'Person', '@id': PERSON_ID, name: PERSON_NAME, url: SITE_URL,
});

export function personSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: PERSON_NAME,
    alternateName: PERSON_ALIAS,
    url: SITE_URL,
    image: absoluteUrl('images/profile/me_pro.jpg'),
    jobTitle: 'Développeur Fullstack Flutter & Angular · Formateur IT',
    address: { '@type': 'PostalAddress', addressLocality: 'Douala', addressCountry: 'CM' },
    sameAs: [GITHUB_URL, LINKEDIN_URL, STORE_URL, DEVPEA_URL],
  };
}

export function websiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'fr-FR',
    publisher: personRef(),
  };
}

/**
 * Un Product par produit Chariow, avec son `offers` (prix actuel en XAF, en stock).
 * Non branché : à ajouter au JSON-LD de la page qui affichera la section boutique (Phase 4).
 * Google exige que le balisage corresponde à du contenu visible, et le prix à celui de la boutique
 * (à tenir à jour dans products.data.ts).
 */
export function productSchemas(): JsonLd[] {
  return PRODUCTS.map(p => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/#product-${p.id}`,
    name: p.name,
    description: p.descriptionFr,
    url: p.url,
    brand: { '@type': 'Brand', name: PERSON_ALIAS },
    offers: {
      '@type': 'Offer',
      price: String(p.price.amount),
      priceCurrency: p.price.currency,
      availability: 'https://schema.org/InStock',
      url: p.url,
    },
  }));
}

/** Page projet : CreativeWork. Ne doit jamais recevoir un projet masqué (`hidden`). */
export function projectSchema(project: Project, image: string): JsonLd {
  const url = absoluteUrl(`projects/${project.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${url}#work`,
    name: project.name,
    description: project.descFr,
    url,
    image,
    inLanguage: 'fr-FR',
    keywords: project.tech.join(', '),
    creator: personRef(),
    ...(project.liveUrl ? { sameAs: project.liveUrl } : {}),
  };
}
