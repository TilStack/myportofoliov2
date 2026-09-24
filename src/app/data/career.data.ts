/**
 * Parcours (page À propos) : expériences, formations, langues. Source unique, FR/EN.
 * Seules les informations fournies par Israel figurent ici ; ce qui manque est un TODO(israel).
 */

export interface Bilingual {
  fr: string;
  en: string;
}

export interface CareerEntry {
  id: string;
  role: Bilingual;
  organization: string;
  place?: string;
  /** Période affichée telle quelle. `undefined` : dates non fournies. */
  period?: Bilingual;
  /** En cours (pastille « en cours »). */
  current?: boolean;
  detail?: Bilingual;
}

/** Du plus récent au plus ancien ; DevPea (dates inconnues) est placé avant LEVEGI. */
export const EXPERIENCE: CareerEntry[] = [
  {
    id: 'freelance',
    role: { fr: 'Développeur freelance — développement assisté par IA', en: 'Freelance developer — AI-assisted development' },
    organization: 'Freelance',
    period: { fr: 'Depuis mars 2026', en: 'Since March 2026' },
    current: true,
  },
  {
    id: 'cefti',
    role: { fr: 'Formateur en informatique', en: 'IT trainer' },
    organization: 'CEFTI',
    place: 'Douala',
    period: { fr: 'Depuis septembre 2023', en: 'Since September 2023' },
    current: true,
  },
  {
    id: 'devpea',
    role: { fr: 'Co-fondateur', en: 'Co-founder' },
    organization: 'DevPea',
    // TODO(israel): dates de DevPea (début, et fin si l'aventure n'est plus en cours).
  },
  {
    id: 'levegi',
    role: { fr: 'Développeur et encadrant de stagiaires', en: 'Developer and intern supervisor' },
    organization: 'LEVEGI SARL',
    period: { fr: 'Stage en 2022, puis janvier 2023 – septembre 2024', en: 'Internship in 2022, then January 2023 – September 2024' },
  },
];

export interface EducationEntry {
  id: string;
  title: Bilingual;
  school: string;
  year: string;
}

export const EDUCATION: EducationEntry[] = [
  {
    id: 'bachelor-csi',
    title: { fr: 'Bachelor Conception des Systèmes d\'Information', en: 'Bachelor in Information Systems Design' },
    school: '3IL, IUC Logbessou',
    year: '2023',
  },
  {
    id: 'dec-mobile',
    title: { fr: 'DEC Programmation & Application mobile', en: 'DEC in Programming & Mobile Applications' },
    school: 'CCNB',
    year: '2022',
  },
];

export interface LanguageEntry {
  id: string;
  label: Bilingual;
}

export const LANGUAGES: LanguageEntry[] = [
  { id: 'tcf', label: { fr: 'TCF 2025 — C2 / C1', en: 'TCF 2025 — C2 / C1' } },
  // TODO(israel): score de l'IELTS Academic (le plan ne donne que l'année).
  { id: 'ielts', label: { fr: 'IELTS Academic 2024', en: 'IELTS Academic 2024' } },
];
