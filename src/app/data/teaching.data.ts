import { Bilingual } from './career.data';

/** Enseignement & Formations (page À propos). Aucune information au-delà de celles fournies par Israel. */

export interface TeachingRole {
  organization: string;
  place: string;
  since: Bilingual;
  /** Programme officiel suivi. */
  programme: string;
  subjects: Bilingual[];
  /** Encadrement de projets étudiants. */
  supervision: { label: Bilingual; scheme: string };
  /** Formation créée : l'id du produit (products.data.ts) donne le lien vers la boutique. */
  createdCourse: { name: string; productId: string };
}

export const TEACHING: TeachingRole = {
  organization: 'CEFTI',
  place: 'Douala',
  since: { fr: 'Depuis septembre 2023', en: 'Since September 2023' },
  programme: 'MINESEC',
  subjects: [
    { fr: 'Informatique générale', en: 'General computer science' },
    { fr: 'Algorithmique & programmation', en: 'Algorithmics & programming' },
    { fr: 'Systèmes d\'information (MERISE, UML)', en: 'Information systems (MERISE, UML)' },
    { fr: 'Bases de données', en: 'Databases' },
  ],
  supervision: { label: { fr: 'Encadrement de projets étudiants', en: 'Supervision of student projects' }, scheme: 'ORICEFT' },
  createdCourse: { name: 'Prof 2.0', productId: 'prd_ehy1y5' },
};

export interface Intervention {
  id: string;
  title: Bilingual;
  event: string;
  /** AAAA-MM-JJ */
  date: string;
  url?: string;
}

/**
 * Conférences, ateliers, interventions. Vide tant qu'Israel n'en a pas fourni : le composant se masque.
 * TODO(israel): ajouter tes interventions réelles (titre, événement, date, lien). N'en invente aucune.
 */
export const INTERVENTIONS: Intervention[] = [];
