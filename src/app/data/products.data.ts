/**
 * Offres payantes du site : produits digitaux (boutique Chariow) et offres rattachées à un projet.
 *
 * Mettre à jour à chaque changement de promo sur Chariow : le JSON-LD doit correspondre au prix
 * affiché sur la boutique. Modifier `amount` / `compareAt` ET `updatedAt` (date du relevé, AAAA-MM-JJ).
 *
 * Ces données alimentent la section boutique (accueil et /boutique) ET le JSON-LD Product : un seul endroit.
 */

export interface Price {
  /** Prix actuel, en unités de la devise. */
  amount: number;
  currency: 'XAF';
  /** Prix barré (avant promo), s'il y en a un. */
  compareAt?: number;
  /** Date du dernier relevé du prix sur la boutique (AAAA-MM-JJ). */
  updatedAt: string;
}

/** Produit digital vendu sur la boutique (Chariow). */
export interface DigitalProduct {
  /** Identifiant Chariow. */
  id: string;
  name: string;
  /** Nature de l'offre, pour l'étiquette affichée sur la carte. */
  kind: 'prompts' | 'course' | 'skill';
  descriptionFr: string;
  descriptionEn: string;
  url: string;
  price: Price;
}

/** Réduction (en %) entre le prix barré et le prix actuel ; `null` sans prix barré. */
export function discountPercent(price: Price): number | null {
  if (!price.compareAt || price.compareAt <= price.amount) return null;
  return Math.round((1 - price.amount / price.compareAt) * 100);
}

/** Parité fixe officielle : 1 € = 655,957 F CFA (XAF). Les prix de la boutique restent en XAF ; l'euro est indicatif. */
export const XAF_PER_EUR = 655.957;

/**
 * « ≈ 11,43 € » (FR) / « ≈ €11.43 » (EN) : montant XAF converti en euros, 2 décimales. Écrit à la main (pas d'Intl)
 * pour un rendu identique au pré-rendu serveur.
 */
export function formatEuro(amountXaf: number, lang: 'fr' | 'en' = 'fr'): string {
  const eur = (Math.round((amountXaf / XAF_PER_EUR) * 100) / 100).toFixed(2);
  return lang === 'fr' ? `≈\u00A0${eur.replace('.', ',')}\u00A0€` : `≈\u00A0€${eur}`;
}

/**
 * « 1 500 XAF » : espace insécable comme séparateur de milliers. Écrit à la main plutôt qu'avec Intl,
 * pour que le HTML pré-rendu (Node) et le rendu navigateur soient identiques au caractère près.
 */
export function formatPrice(amount: number, currency: Price['currency'] = 'XAF'): string {
  return `${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0')}\u00A0${currency}`;
}

export const PRODUCTS: DigitalProduct[] = [
  {
    id: 'prd_1bt9cd',
    name: '10 Prompts IA pour Générer des Épreuves Académiques par Classe en 2 min',
    kind: 'prompts',
    descriptionFr: 'Prompts IA pour générer des épreuves (BEPC, Probatoire, BAC) avec leurs barèmes.',
    descriptionEn: 'AI prompts to generate exams (BEPC, Probatoire, BAC) together with their marking schemes.',
    url: 'https://store.tilstack.me/prd_1bt9cd',
    price: { amount: 1500, currency: 'XAF', compareAt: 3000, updatedAt: '2026-09-24' },
  },
  {
    id: 'prd_ehy1y5',
    name: 'Prof 2.0 — Digitaliser son enseignement avec l\'IA',
    kind: 'course',
    descriptionFr: 'Formation en ligne sur l\'IA pédagogique pour les enseignants.',
    descriptionEn: 'Online course on educational AI for teachers.',
    url: 'https://store.tilstack.me/prd_ehy1y5',
    price: { amount: 6000, currency: 'XAF', compareAt: 15000, updatedAt: '2026-09-24' },
  },
  {
    id: 'prd_t6xzuw62',
    name: 'Remotion Video Studio — le skill Claude qui fabrique tes vidéos animées',
    kind: 'skill',
    descriptionFr: "Un skill Claude qui crée des vidéos animées à partir d'une simple description : personnages, voix off et sous-titres, exportées en MP4.",
    descriptionEn: 'A Claude skill that creates animated videos from a plain description: characters, voice-over and subtitles, exported as MP4.',
    url: 'https://store.tilstack.me/prd_t6xzuw62',
    price: { amount: 7500, currency: 'XAF', compareAt: 12000, updatedAt: '2026-10-11' },
  },
];

/** Offre rattachée à un projet (abonnement, don) : n'appartient pas à la section produits. */
export interface ProjectOffer {
  id: string;
  name: string;
  kind: 'subscription' | 'donation';
  period?: 'monthly' | 'yearly';
  /** `true` : `price.amount` est un minimum (don libre à partir de…). */
  isMinimum?: boolean;
  /** TODO(israel): URL de la page d'achat / de don. */
  url?: string;
  price: Price;
}

const UPDATED = '2026-09-24';

/** Offres par slug de projet (/projects/:slug). */
export const PROJECT_OFFERS: Record<string, ProjectOffer[]> = {
  otadex: [
    { id: 'otadex-jonin-monthly', name: 'Jonin', kind: 'subscription', period: 'monthly',
      price: { amount: 2000, currency: 'XAF', updatedAt: UPDATED } },
    { id: 'otadex-kage-monthly', name: 'Kage', kind: 'subscription', period: 'monthly',
      price: { amount: 5000, currency: 'XAF', updatedAt: UPDATED } },
    { id: 'otadex-jonin-yearly', name: 'Jonin', kind: 'subscription', period: 'yearly',
      price: { amount: 21600, currency: 'XAF', updatedAt: UPDATED } },
    { id: 'otadex-kage-yearly', name: 'Kage', kind: 'subscription', period: 'yearly',
      price: { amount: 54000, currency: 'XAF', updatedAt: UPDATED } },
    // TODO(israel): URL d'achat des abonnements Otadex (champ `url` de chaque offre).
  ],
};
