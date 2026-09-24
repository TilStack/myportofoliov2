import { STORE_URL } from './site.data';

/** Produit digital vendu sur la boutique (Chariow). Aucun prix affiché ni publié. */
export interface DigitalProduct {
  /** Identifiant Chariow. */
  id: string;
  name: string;
  descriptionFr: string;
  /** Page du produit. TODO(israel): URL exacte de chaque produit (à défaut, la boutique). */
  url: string;
}

export const PRODUCTS: DigitalProduct[] = [
  {
    id: 'prd_1bt9cd',
    name: '10 Prompts IA — Génération d\'épreuves',
    descriptionFr: 'Prompts IA pour générer des épreuves (BEPC, Probatoire, BAC) avec leurs barèmes.',
    url: STORE_URL, // TODO(israel): URL exacte du produit Chariow
  },
  {
    id: 'prd_ehy1y5',
    name: 'Prof Augmenté',
    descriptionFr: 'Formation en ligne sur l\'IA pédagogique pour les enseignants.',
    url: STORE_URL, // TODO(israel): URL exacte du produit Chariow
  },
];
