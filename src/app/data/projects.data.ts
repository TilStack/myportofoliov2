import { DEVPEA_LINKEDIN_URL, DEVPEA_URL, LINKEDIN_URL } from './site.data';

export interface Contributor {
  name: string;
  roleEn: string;
  roleFr: string;
  initials: string;
  variant: 'primary' | 'accent';
  videoUrl?: string;
  linkedinUrl?: string;
  /** Lien vers le portfolio du contributeur (affiché seulement s'il est renseigné). */
  portfolioUrl?: string;
  photoUrl?: string;
}

/** Catégorie d'un projet (page Projets). `school` : projets scolaires / d'enseignement. */
export type ProjectCategory = 'personal' | 'team' | 'school';

/** Clé de traduction (I18nService) du titre de chaque catégorie, dans l'ordre d'affichage. */
export const CATEGORY_KEYS: Record<ProjectCategory, string> = {
  personal: 'projects.catPersonal',
  team: 'projects.catTeam',
  school: 'projects.catSchool',
};

export interface Project {
  id: number;
  /** Catégorie d'affichage sur la page Projets. */
  category: ProjectCategory;
  /** Segment d'URL de la page détail : /projects/:slug */
  slug: string;
  name: string;
  icon: string;
  company: string;
  status: 'finished' | 'in-progress' | 'coming-soon';
  /** Début du projet, « AAAA-MM » (affiché « Depuis … » sur la carte). Absent : rien n'est affiché. */
  startedAt?: string;
  tech: string[];
  liveUrl?: string;
  youtubeUrl?: string;
  descEn: string;
  descFr: string;
  detailEn: string;
  detailFr: string;
  contributors: Contributor[];
  images?: string[];
  /** Masqué : absent de la liste, non pré-rendu, absent du sitemap. */
  hidden?: boolean;
  /** Mis en avant dans la section « Projets phares » de l'accueil. */
  featured?: boolean;
}

/** Clé de traduction (I18nService) du libellé de statut. */
export const STATUS_KEY: Record<Project['status'], string> = {
  finished: 'projects.finished',
  'in-progress': 'projects.inProgress',
  'coming-soon': 'projects.comingSoonPlay',
};

export const ISRAEL: Contributor = {
  name: 'Israel Tientcheu',
  roleEn: 'Full-Stack Developer',
  roleFr: 'Développeur Full-Stack',
  initials: 'IT',
  variant: 'primary',
  linkedinUrl: LINKEDIN_URL,
  photoUrl: 'images/profile/me_pro.webp',
};

export const DEVPEA_TEAM: Contributor = {
  name: 'Devpea Team',
  roleEn: 'Design & Project Management',
  roleFr: 'Design & Gestion de Projet',
  initials: 'DP',
  variant: 'accent',
  linkedinUrl: DEVPEA_LINKEDIN_URL,
  photoUrl: 'images/projects/devpea_logo.webp',
};

export const LEVEGI_TEAM: Contributor = {
  name: 'LEVEGI SARL Team',
  roleEn: 'Product & Design',
  roleFr: 'Produit & Design',
  initials: 'LV',
  variant: 'accent',
  photoUrl: 'images/projects/levegi_logo.webp',
};

/** Concepteur de Nuvel (projet en collaboration : Israel en est le partenaire). */
export const DANIEL: Contributor = {
  name: 'Daniel',
  roleEn: 'Creator & Designer',
  roleFr: 'Concepteur du projet',
  initials: 'D',
  variant: 'accent',
  // TODO(israel): lien du portfolio de Daniel (champ `portfolioUrl`) + son nom de famille si tu veux l'afficher.
};

// TODO(israel): projets scolaires / d'enseignement (ex. projets d'étudiants encadrés) : aucun n'est renseigné, la
// catégorie « school » reste donc masquée tant qu'elle est vide.
export const PROJECTS: Project[] = [
  {
    id: 1,
    slug: 'dofa',
    category: 'team',
    name: 'DOFA',
    icon: '🚗',
    company: 'Devpea',
    status: 'finished',
    featured: true,
    tech: ['Flutter', 'Firebase', 'Dart'],
    descEn:
      'Highway code learning platform — free, ad-free, accessible to all. Available on PlayStore and AppStore.',
    descFr:
      "Plateforme d'apprentissage du code de la route — gratuite, sans pub, accessible à tous. Disponible sur PlayStore et AppStore.",
    detailEn:
      'DOFA is an educational mobile app that makes learning the highway code accessible to everyone, regardless of financial means. Completely free and ad-free, the app is available on both Android (PlayStore) and iOS (AppStore). Developed for Devpea using Flutter for a smooth cross-platform experience and Firebase for real-time data synchronization and backend services.',
    detailFr:
      "DOFA est une application mobile éducative qui rend l'apprentissage du code de la route accessible à tous, quelle que soit leur situation financière. Entièrement gratuite et sans publicités, l'application est disponible sur Android (PlayStore) et iOS (AppStore). Développée pour Devpea avec Flutter pour une expérience mobile fluide et Firebase pour la synchronisation des données en temps réel.",
    contributors: [ISRAEL, DEVPEA_TEAM],
    images: [
      'images/projects/dofa_capture1.webp',
      'images/projects/dofa_capture2.webp',
      'images/projects/dofa_capture3.webp',
      'images/projects/dofa_capture4.webp',
    ],
  },
  {
    id: 2,
    slug: 'devpea-website',
    category: 'team',
    name: 'Devpea Website',
    icon: '🌐',
    company: 'Devpea',
    status: 'finished',
    tech: ['Angular', 'TypeScript'],
    liveUrl: DEVPEA_URL,
    descEn:
      'Showcase website presenting Devpea, a software development company based in Cameroon.',
    descFr:
      'Site vitrine présentant Devpea, une société de développement logiciel basée au Cameroun.',
    detailEn:
      "The official showcase website for Devpea, a software development company based in Cameroon. The goal was to establish a strong professional online presence, showcase the company's services and values, and attract potential clients. Built with Angular and TypeScript, the site is fast, fully responsive, and optimized for SEO.",
    detailFr:
      "Le site web officiel de Devpea, une société de développement logiciel basée au Cameroun. L'objectif était d'établir une présence en ligne professionnelle, présenter les services et les valeurs de l'entreprise, et attirer des clients potentiels. Développé avec Angular et TypeScript, le site est rapide, entièrement responsive et optimisé pour le référencement.",
    contributors: [ISRAEL, DEVPEA_TEAM],
    images: ['images/projects/devpea-1.webp'],
  },
  {
    id: 3,
    slug: 'levefly',
    category: 'team',
    name: 'LEVEFLY',
    icon: '✈️',
    company: 'LEVEGI SARL',
    status: 'in-progress',
    tech: ['Flutter', 'NestJS', 'PostgreSQL'],
    descEn:
      'Plane ticket reservation mobile app — starting with the African market.',
    descFr:
      "Application mobile de réservation de billets d'avion — pensée pour le marché africain.",
    detailEn:
      'LEVEFLY is an ambitious mobile application designed to simplify air travel in Africa. Users can search, compare, and book plane tickets directly from their smartphones. The stack includes Flutter for a smooth cross-platform mobile experience, NestJS powering a robust REST API, and PostgreSQL for reliable data persistence. The project is currently under active development.',
    detailFr:
      "LEVEFLY est une application mobile ambitieuse conçue pour simplifier les voyages aériens en Afrique. Les utilisateurs peuvent rechercher, comparer et réserver des billets d'avion directement depuis leur smartphone. La stack comprend Flutter pour une expérience mobile multiplateforme fluide, NestJS pour une API REST robuste, et PostgreSQL pour la persistance des données. Le projet est en cours de développement actif.",
    contributors: [ISRAEL, LEVEGI_TEAM],
    images: ['images/projects/levefly-1.webp'],
  },
  {
    id: 4,
    slug: 'mycagnotte',
    category: 'team',
    name: 'MYCAGNOTTE',
    icon: '💰',
    company: 'LEVEGI SARL',
    status: 'in-progress',
    tech: ['Angular', 'NestJS', 'PostgreSQL'],
    descEn:
      'Web platform for creating and managing online crowdfunding campaigns.',
    descFr:
      'Plateforme web de création et gestion de campagnes de financement participatif en ligne.',
    detailEn:
      'MYCAGNOTTE is a web crowdfunding platform that allows users to create and manage online fundraising campaigns. Simple, transparent, and accessible — it connects campaign creators with their supporters. The Angular frontend delivers a smooth user experience, the NestJS backend handles business logic and API endpoints, and PostgreSQL ensures reliable data storage. Developed for LEVEGI SARL.',
    detailFr:
      'MYCAGNOTTE est une plateforme web de financement participatif permettant aux utilisateurs de créer et gérer des campagnes de collecte de fonds en ligne. Simple, transparente et accessible — elle connecte les créateurs de campagnes avec leurs soutiens. Le frontend Angular offre une expérience fluide, le backend NestJS gère la logique métier et les endpoints API, et PostgreSQL assure la persistance des données. Développé pour LEVEGI SARL.',
    contributors: [ISRAEL, LEVEGI_TEAM],
    images: ['images/projects/cagnotte-1.webp'],
  },
  {
    id: 5,
    slug: 'otadex',
    category: 'personal',
    name: 'Otadex',
    icon: '⚡',
    company: 'Personal',
    status: 'coming-soon', // « Bientôt sur le Play Store »
    featured: true,
    tech: ['Flutter', 'Firebase', 'Claude Code'],
    liveUrl: 'https://otadex.tilstack.me',
    descEn: 'An anime encyclopedia mobile app — my first personal project building a mobile application.',
    descFr:
      "Une encyclopédie anime sur mobile — mon premier projet personnel de construction d'une application mobile.",
    // TODO(israel): valider ou réécrire cette description (tirée de l'état du projet Otadex_v1).
    detailEn:
      'Otadex is a Flutter and Firebase mobile app built as a solo project: an anime encyclopedia with character, anime and creator pages, a personal collection and rank-based plans (Genin, Jonin, Kage). Coming soon on the Play Store.',
    detailFr:
      "Otadex est une application mobile Flutter et Firebase, développée seul : une encyclopédie anime avec des fiches de personnages, d'animés et de créateurs, une collection personnelle et des formules par rang (Genin, Jonin, Kage). Bientôt sur le Play Store.",
    contributors: [
      { ...ISRAEL, roleEn: 'Solo Developer', roleFr: 'Développeur Solo' },
    ],
    images: ['images/projects/otadex-cover.svg'], // illustration en attendant les vraies captures — TODO(israel)
  },
  {
    id: 6,
    slug: 'tiltine',
    hidden: true, // TODO(israel): fournir description + capture réelle pour l'afficher
    category: 'personal',
    name: 'Tiltine',
    icon: '⚡',
    company: 'Personal',
    status: 'in-progress',
    tech: ['Angular', 'Firebase', 'Claude Code'],
    liveUrl: 'https://tiltine.tilstack.me',
    descEn: 'Angular project for a company in my own life',
    descFr: '',
    detailEn: '',
    detailFr: '',
    contributors: [
      { ...ISRAEL, roleEn: 'Solo Developer', roleFr: 'Développeur Solo' },
    ],
    images: ['images/projects/placeholder.svg'], // TODO(israel): capture réelle
  },
  {
    id: 7,
    slug: 'mypokemon',
    category: 'personal',
    name: 'MyPokemon',
    icon: '⚡',
    company: 'Personal',
    status: 'finished',
    tech: ['Angular', 'Firebase'],
    liveUrl: 'https://pok.tilstack.me',
    descEn:
      'My first Angular project — a Pokémon explorer built using the PokéAPI to learn the framework.',
    descFr:
      'Mon premier projet Angular — un explorateur Pokémon utilisant la PokéAPI pour apprendre le framework.',
    detailEn:
      "MyPokemon was my very first Angular project — a Pokémon explorer app built on top of the public PokéAPI. This personal project was the hands-on way I learned Angular's core concepts: components, services, dependency injection, routing, the HTTP client, and Firebase for authentication. A fun and rewarding experience that laid the foundation for my Angular journey.",
    detailFr:
      "MyPokemon a été mon tout premier projet Angular — une application d'exploration des Pokémon construite sur la PokéAPI publique. Ce projet personnel a été la façon concrète dont j'ai appris les concepts fondamentaux d'Angular : composants, services, injection de dépendances, routing, client HTTP, et Firebase pour l'authentification. Une expérience à la fois ludique et enrichissante qui a posé les bases de mon parcours Angular.",
    contributors: [
      { ...ISRAEL, roleEn: 'Solo Developer', roleFr: 'Développeur Solo' },
    ],
    images: ['images/projects/pokemon-1.webp'],
  },
  {
    id: 8,
    slug: 'nuvel',
    category: 'team',
    name: 'Nuvel',
    icon: '✝️',
    company: 'Collaboration',
    status: 'in-progress',
    featured: true,
    // TODO(israel): date de début (startedAt), stack technique et captures réelles.
    tech: [],
    descEn: 'A social network for Christians, designed by Daniel — currently in development, not yet released.',
    descFr: "Un réseau social chrétien conçu par Daniel — en cours de développement, pas encore sorti.",
    detailEn:
      'Nuvel is a Christian social app that brings believers together as a community network. The project was designed by Daniel; I am his partner on it and we are building it together. It is currently under development and is not yet released or online.',
    detailFr:
      "Nuvel est une application sociale chrétienne qui réunit les croyants dans un réseau communautaire. Le projet a été conçu par Daniel ; j'en suis le partenaire et nous le construisons ensemble. Il est en cours de développement et n'est pas encore sorti ni en ligne.",
    contributors: [DANIEL, { ...ISRAEL, roleEn: 'Partner', roleFr: 'Partenaire' }],
    images: ['images/projects/nuvel-cover.svg'], // illustration en attendant les vraies captures — TODO(israel)
  },
];

/** Projets affichés : liste, pages détail pré-rendues, sitemap. */
export const VISIBLE_PROJECTS: Project[] = PROJECTS.filter((p) => !p.hidden);

/** Projets phares (accueil) : marqués `featured`, jamais un projet masqué. */
export const FEATURED_PROJECTS: Project[] = VISIBLE_PROJECTS.filter((p) => p.featured);
