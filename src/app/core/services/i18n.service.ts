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
    role:      'Full-Stack Developer · Mobile & Web',
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
    title:        'Projects',
    eyebrow:      'My Work',
    subtitle:     'A selection of apps and websites I\'ve built — from mobile platforms to web applications, for clients and for learning.',
    viewAll:      'View all',
    viewDemo:     'Live demo',
    viewCode:     'Source code',
    viewSite:     'View site',
    watchVideo:   'Watch on YouTube',
    finished:     'Finished',
    inProgress:   'In progress',
    techStack:    'Tech stack',
    contributors: 'Contributors',
    links:        'Links',
    closeModal:   'Close',
    private:      'Private project',
    profileVideo: 'Profile preview',
  },
  blog: {
    title:            'Blog',
    eyebrow:          'Writing',
    subtitle:         'Technical articles, tutorials, and notes on web & mobile development.',
    filterAll:        'All articles',
    filterMine:       'By me',
    filterZerofiltre: 'On Zerofiltre',
    writeBtn:         'Write an article',
    readMore:         'Read more →',
    readOn:           'Read on Zerofiltre →',
    minRead:          'min read',
    featured:         'Featured',
    external:         'Zerofiltre',
    likes:            'likes',
    comments:         'comments',
    newsletter:       'Stay in the loop',
    newsletterSub:    'Get new articles straight to your inbox. No spam, ever.',
    subscribe:        'Subscribe',
    subscribeOk:      'You\'re subscribed! Thanks.',
    emailHolder:      'your@email.com',
    emailError:       'Please enter a valid email.',
    contributeTitle:  'Propose an article',
    contributeSub:    'Share your knowledge with the community. All articles are reviewed and published exclusively by TilStack.',
    yourName:         'Your name',
    yourEmail:        'Your email',
    articleTitle:     'Article title',
    shortDesc:        'Short description',
    yourContent:      'Your draft or main ideas',
    submitBtn:        'Submit for review',
    submitOk:         'Article submitted! We\'ll review it soon. 🎉',
    close:            'Close',
    passwordTitle:    'Write an article',
    passwordSub:      'This section is reserved. Enter the password to continue.',
    passwordPlaceholder: 'Password',
    passwordError:    'Incorrect password. Please try again.',
    passwordAccess:   'Access',
    tagsLabel:        'Tags',
    tagsHolder:       'Angular, TypeScript, …',
    articleBy:        'By TilStack',
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
    role:      'Développeur Full-Stack · Mobile & Web',
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
    title:        'Projets',
    eyebrow:      'Mon Travail',
    subtitle:     'Une sélection d\'applications et de sites web que j\'ai construits — du mobile au web, pour des clients ou pour apprendre.',
    viewAll:      'Voir tout',
    viewDemo:     'Démo live',
    viewCode:     'Code source',
    viewSite:     'Voir le site',
    watchVideo:   'Voir sur YouTube',
    finished:     'Terminé',
    inProgress:   'En cours',
    techStack:    'Stack technique',
    contributors: 'Contributeurs',
    links:        'Liens',
    closeModal:   'Fermer',
    private:      'Projet privé',
    profileVideo: 'Aperçu profil',
  },
  blog: {
    title:            'Blog',
    eyebrow:          'Écriture',
    subtitle:         'Articles techniques, tutoriels et notes sur le développement web & mobile.',
    filterAll:        'Tous les articles',
    filterMine:       'Par moi',
    filterZerofiltre: 'Sur Zerofiltre',
    writeBtn:         'Écrire un article',
    readMore:         'Lire la suite →',
    readOn:           'Lire sur Zerofiltre →',
    minRead:          'min de lecture',
    featured:         'À la une',
    external:         'Zerofiltre',
    likes:            'likes',
    comments:         'commentaires',
    newsletter:       'Restez informé',
    newsletterSub:    'Recevez les nouveaux articles dans votre boîte mail. Jamais de spam.',
    subscribe:        'S\'abonner',
    subscribeOk:      'Vous êtes abonné ! Merci.',
    emailHolder:      'votre@email.com',
    emailError:       'Veuillez entrer un email valide.',
    contributeTitle:  'Proposer un article',
    contributeSub:    'Partagez vos connaissances. Tous les articles sont relus et publiés exclusivement par TilStack.',
    yourName:         'Votre nom',
    yourEmail:        'Votre email',
    articleTitle:     'Titre de l\'article',
    shortDesc:        'Description courte',
    yourContent:      'Votre brouillon ou idées principales',
    submitBtn:        'Soumettre pour révision',
    submitOk:         'Article soumis ! Nous le réviserons bientôt. 🎉',
    close:            'Fermer',
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
