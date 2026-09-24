import { SeoConfig } from '../core/services/seo.service';
import { Project } from './projects.data';
import { SITE_NAME } from './site.data';
import { absoluteUrl } from './structured-data';

/** Titre de page : « Section | TIENTCHEU Israel (TilStack) ». */
const titled = (section: string) => `${section} | ${SITE_NAME}`;

export const SEO = {
  home: {
    title: 'TIENTCHEU Israel (TilStack) | Développeur Fullstack Flutter & Angular · Formateur IT — Douala',
    description:
      'Développeur fullstack web & mobile (Flutter, Angular, FastAPI), formateur en informatique au CEFTI et co-fondateur de DevPea. Je crée des apps et des ressources IA pour enseignants. Basé à Douala, Cameroun.',
    path: '/',
  },
  about: {
    title: titled('À propos'),
    description:
      'Développeur full-stack originaire du Cameroun, passionné par les applications mobiles et web, et formateur en informatique : mon parcours, mon stack et mon setup.',
    path: '/about',
  },
  projects: {
    title: titled('Projets'),
    description:
      'Une sélection d\'applications et de sites web construits par TIENTCHEU Israel, du mobile au web (Flutter, Angular, Firebase, NestJS), pour des clients ou pour apprendre.',
    path: '/projects',
  },
  blog: {
    title: titled('Blog'),
    description:
      'Articles techniques, tutoriels et notes sur le développement web et mobile (Flutter, Angular) par TIENTCHEU Israel.',
    path: '/blog',
  },
  quotes: {
    title: titled('Citations'),
    description:
      'Des citations qui m\'inspirent, avec leur explication. Proposez la vôtre : elle est publiée après modération.',
    path: '/quotes',
  },
  contact: {
    title: titled('Contact'),
    description:
      'Un projet, une collaboration ou une question ? Contactez TIENTCHEU Israel par email, GitHub ou LinkedIn.',
    path: '/contact',
  },
  admin: {
    title: 'Espace admin | TilStack',
    description: 'Espace réservé au propriétaire du site.',
    path: '/admin',
    noindex: true,
  },
  notFound: {
    title: titled('Page introuvable'),
    description: 'Cette page n\'existe pas ou a été déplacée.',
    path: '/404',
    noindex: true,
  },
} satisfies Record<string, SeoConfig>;

/** Image de partage raster d'un projet (Facebook/LinkedIn n'affichent pas les SVG), sinon `undefined` = image par défaut. */
export function projectImage(project: Project): string | undefined {
  const raster = project.images?.find(src => /\.(jpe?g|png|webp)$/i.test(src));
  return raster ? absoluteUrl(raster) : undefined;
}

export function projectSeo(project: Project): SeoConfig {
  return {
    title: `${project.name} — Projet | ${SITE_NAME}`,
    description: project.descFr,
    path: `/projects/${project.slug}`,
    image: projectImage(project),
    imageAlt: `${project.name} — capture du projet`,
  };
}
