import { Injectable, signal } from '@angular/core';

export type Lang = 'en' | 'fr';

export interface Translations {
  [key: string]: string | Translations;
}

const EN: Translations = {
  nav: {
    home: 'Home', about: 'About', projects: 'Projects',
    blog: 'Blog', quotes: 'Quotes', contact: 'Contact',
  },
  hero: {
    greeting:  "Hello, I'm",
    role:      'Full-Stack Developer & Educator',
    cta:       'Download CV',
    scroll:    'Scroll down',
  },
  about: {
    title:     'About me',
    subtitle:  'A developer passionate about building meaningful things.',
    setup:     'My Setup',
    educator:  'Educator',
    cameroon:  'Cameroon',
  },
  projects: {
    title:    'Projects',
    subtitle: 'A selection of things I built.',
    viewAll:  'View all',
    viewDemo: 'Live demo',
    viewCode: 'Source code',
  },
  blog: {
    title:    'Blog',
    subtitle: 'Thoughts, notes & tutorials.',
    readMore: 'Read more',
    likes:    'likes',
    comments: 'comments',
    newsletter:'Subscribe to newsletter',
    subscribe: 'Subscribe',
  },
  quotes: {
    title:    'Quotes',
    subtitle: 'Words that resonate.',
  },
  contact: {
    title:    'Contact',
    subtitle: 'Let\'s build something together.',
    name:     'Your name',
    email:    'Your email',
    message:  'Your message',
    send:     'Send message',
  },
  common: {
    loading:  'Loading…',
    error:    'Something went wrong.',
    darkMode: 'Dark mode',
    lightMode:'Light mode',
    backToTop:'Back to top',
  },
};

const FR: Translations = {
  nav: {
    home: 'Accueil', about: 'À propos', projects: 'Projets',
    blog: 'Blog', quotes: 'Citations', contact: 'Contact',
  },
  hero: {
    greeting:  'Bonjour, je suis',
    role:      'Développeur Full-Stack & Formateur',
    cta:       'Télécharger le CV',
    scroll:    'Défiler vers le bas',
  },
  about: {
    title:     'À propos de moi',
    subtitle:  'Un développeur passionné par la création de choses utiles.',
    setup:     'Mon Setup',
    educator:  'Formateur',
    cameroon:  'Cameroun',
  },
  projects: {
    title:    'Projets',
    subtitle: 'Une sélection de ce que j\'ai construit.',
    viewAll:  'Voir tout',
    viewDemo: 'Démo live',
    viewCode: 'Code source',
  },
  blog: {
    title:    'Blog',
    subtitle: 'Réflexions, notes & tutoriels.',
    readMore: 'Lire la suite',
    likes:    'likes',
    comments: 'commentaires',
    newsletter:'S\'abonner à la newsletter',
    subscribe: 'S\'abonner',
  },
  quotes: {
    title:    'Citations',
    subtitle: 'Des mots qui résonnent.',
  },
  contact: {
    title:    'Contact',
    subtitle: 'Construisons quelque chose ensemble.',
    name:     'Votre nom',
    email:    'Votre email',
    message:  'Votre message',
    send:     'Envoyer le message',
  },
  common: {
    loading:  'Chargement…',
    error:    'Une erreur est survenue.',
    darkMode: 'Mode sombre',
    lightMode:'Mode clair',
    backToTop:'Retour en haut',
  },
};

const DICTS: Record<Lang, Translations> = { en: EN, fr: FR };

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(this.getInitialLang());

  t(key: string): string {
    const dict = DICTS[this.lang()];
    const parts = key.split('.');
    let node: Translations | string = dict;
    for (const part of parts) {
      if (typeof node !== 'object') return key;
      node = node[part];
    }
    return typeof node === 'string' ? node : key;
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
    localStorage.setItem('portfolio-lang', lang);
    document.documentElement.setAttribute('lang', lang);
  }

  toggleLang(): void {
    this.setLang(this.lang() === 'en' ? 'fr' : 'en');
  }

  private getInitialLang(): Lang {
    const stored = localStorage.getItem('portfolio-lang') as Lang | null;
    if (stored) return stored;
    return navigator.language.startsWith('fr') ? 'fr' : 'en';
  }
}
