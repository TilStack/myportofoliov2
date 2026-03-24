import { Component, HostListener, inject, signal } from '@angular/core';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';
import { I18nService } from '../../core/services/i18n.service';

export interface Contributor {
  name: string;
  roleEn: string;
  roleFr: string;
  initials: string;
  variant: 'primary' | 'accent';
  videoUrl?: string;
}

export interface Project {
  id: number;
  name: string;
  icon: string;
  company: string;
  status: 'finished' | 'in-progress';
  tech: string[];
  liveUrl?: string;
  youtubeUrl?: string;
  descEn: string;
  descFr: string;
  detailEn: string;
  detailFr: string;
  contributors: Contributor[];
  images?: string[];
}

const ISRAEL: Contributor = {
  name: 'Israel Tientcheu',
  roleEn: 'Full-Stack Developer',
  roleFr: 'Développeur Full-Stack',
  initials: 'IT',
  variant: 'primary',
};

const DEVPEA_TEAM: Contributor = {
  name: 'Devpea Team',
  roleEn: 'Design & Project Management',
  roleFr: 'Design & Gestion de Projet',
  initials: 'DP',
  variant: 'accent',
};

const LEVEGI_TEAM: Contributor = {
  name: 'LEVEGI SARL Team',
  roleEn: 'Product & Design',
  roleFr: 'Produit & Design',
  initials: 'LV',
  variant: 'accent',
};

const PROJECTS: Project[] = [
  {
    id: 1,
    name: 'DOFA',
    icon: '🚗',
    company: 'Devpea',
    status: 'finished',
    tech: ['Flutter', 'Firebase', 'Dart'],
    descEn:
      'Highway code learning platform — free, ad-free, accessible to all. Available on PlayStore and AppStore.',
    descFr:
      'Plateforme d\'apprentissage du code de la route — gratuite, sans pub, accessible à tous. Disponible sur PlayStore et AppStore.',
    detailEn:
      'DOFA is an educational mobile app that makes learning the highway code accessible to everyone, regardless of financial means. Completely free and ad-free, the app is available on both Android (PlayStore) and iOS (AppStore). Developed for Devpea using Flutter for a smooth cross-platform experience and Firebase for real-time data synchronization and backend services.',
    detailFr:
      'DOFA est une application mobile éducative qui rend l\'apprentissage du code de la route accessible à tous, quelle que soit leur situation financière. Entièrement gratuite et sans publicités, l\'application est disponible sur Android (PlayStore) et iOS (AppStore). Développée pour Devpea avec Flutter pour une expérience mobile fluide et Firebase pour la synchronisation des données en temps réel.',
    contributors: [ISRAEL, DEVPEA_TEAM],
  },
  {
    id: 2,
    name: 'Devpea Website',
    icon: '🌐',
    company: 'Devpea',
    status: 'finished',
    tech: ['Angular', 'TypeScript'],
    descEn:
      'Showcase website presenting Devpea, a software development company based in Cameroon.',
    descFr:
      'Site vitrine présentant Devpea, une société de développement logiciel basée au Cameroun.',
    detailEn:
      'The official showcase website for Devpea, a software development company based in Cameroon. The goal was to establish a strong professional online presence, showcase the company\'s services and values, and attract potential clients. Built with Angular and TypeScript, the site is fast, fully responsive, and optimized for SEO.',
    detailFr:
      'Le site web officiel de Devpea, une société de développement logiciel basée au Cameroun. L\'objectif était d\'établir une présence en ligne professionnelle, présenter les services et les valeurs de l\'entreprise, et attirer des clients potentiels. Développé avec Angular et TypeScript, le site est rapide, entièrement responsive et optimisé pour le référencement.',
    contributors: [ISRAEL, DEVPEA_TEAM],
  },
  {
    id: 3,
    name: 'LEVEFLY',
    icon: '✈️',
    company: 'LEVEGI SARL',
    status: 'in-progress',
    tech: ['Flutter', 'NestJS', 'PostgreSQL'],
    descEn:
      'Plane ticket reservation mobile app — starting with the African market.',
    descFr:
      'Application mobile de réservation de billets d\'avion — pensée pour le marché africain.',
    detailEn:
      'LEVEFLY is an ambitious mobile application designed to simplify air travel in Africa. Users can search, compare, and book plane tickets directly from their smartphones. The stack includes Flutter for a smooth cross-platform mobile experience, NestJS powering a robust REST API, and PostgreSQL for reliable data persistence. The project is currently under active development.',
    detailFr:
      'LEVEFLY est une application mobile ambitieuse conçue pour simplifier les voyages aériens en Afrique. Les utilisateurs peuvent rechercher, comparer et réserver des billets d\'avion directement depuis leur smartphone. La stack comprend Flutter pour une expérience mobile multiplateforme fluide, NestJS pour une API REST robuste, et PostgreSQL pour la persistance des données. Le projet est en cours de développement actif.',
    contributors: [ISRAEL, LEVEGI_TEAM],
  },
  {
    id: 4,
    name: 'BAYARM',
    icon: '🌾',
    company: 'Devpea',
    status: 'in-progress',
    tech: ['Flutter', 'Firebase', 'Dart'],
    descEn:
      'Agricultural marketplace connecting producers directly to consumers — no intermediaries.',
    descFr:
      'Marketplace agricole connectant producteurs et consommateurs directement, sans intermédiaires.',
    detailEn:
      'BAYARM is a mobile marketplace that allows agricultural producers to list and sell their products directly to consumers, improving farmer revenues and reducing food waste. Buyers get access to fresh products at fair prices. Built with Flutter for a cross-platform mobile experience and Firebase for real-time data and authentication, developed for Devpea.',
    detailFr:
      'BAYARM est un marketplace mobile permettant aux producteurs agricoles de lister et vendre leurs produits directement aux consommateurs, améliorant ainsi les revenus des agriculteurs et réduisant le gaspillage alimentaire. Les acheteurs accèdent à des produits frais à des prix équitables. Développé avec Flutter pour le mobile et Firebase pour les données en temps réel, pour Devpea.',
    contributors: [ISRAEL, DEVPEA_TEAM],
  },
  {
    id: 5,
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
  },
  {
    id: 6,
    name: 'MyPokemon',
    icon: '⚡',
    company: 'Personal',
    status: 'finished',
    tech: ['Angular', 'Firebase'],
    descEn:
      'My first Angular project — a Pokémon explorer built using the PokéAPI to learn the framework.',
    descFr:
      'Mon premier projet Angular — un explorateur Pokémon utilisant la PokéAPI pour apprendre le framework.',
    detailEn:
      'MyPokemon was my very first Angular project — a Pokémon explorer app built on top of the public PokéAPI. This personal project was the hands-on way I learned Angular\'s core concepts: components, services, dependency injection, routing, the HTTP client, and Firebase for authentication. A fun and rewarding experience that laid the foundation for my Angular journey.',
    detailFr:
      'MyPokemon a été mon tout premier projet Angular — une application d\'exploration des Pokémon construite sur la PokéAPI publique. Ce projet personnel a été la façon concrète dont j\'ai appris les concepts fondamentaux d\'Angular : composants, services, injection de dépendances, routing, client HTTP, et Firebase pour l\'authentification. Une expérience à la fois ludique et enrichissante qui a posé les bases de mon parcours Angular.',
    contributors: [{ ...ISRAEL, roleEn: 'Solo Developer', roleFr: 'Développeur Solo' }],
  },
];

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [FadeOnScrollDirective],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  readonly i18n = inject(I18nService);
  readonly projects = PROJECTS;

  selected = signal<Project | null>(null);

  activeGalleryIdx = signal(0);

  setGalleryIdx(i: number): void { this.activeGalleryIdx.set(i); }

  openModal(p: Project): void {
    this.selected.set(p);
    this.activeGalleryIdx.set(0);
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.selected.set(null);
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.closeModal(); }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('pmodal__backdrop')) {
      this.closeModal();
    }
  }

  desc(p: Project): string {
    return this.i18n.lang() === 'fr' ? p.descFr : p.descEn;
  }

  detail(p: Project): string {
    return this.i18n.lang() === 'fr' ? p.detailFr : p.detailEn;
  }

  role(c: Contributor): string {
    return this.i18n.lang() === 'fr' ? c.roleFr : c.roleEn;
  }
}
