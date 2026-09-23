import { RenderMode, ServerRoute } from '@angular/ssr';
import { PROJECTS } from './data/projects.data';

// Site 100 % statique (Firebase Hosting) : toutes les routes sont pré-rendues au build.
export const serverRoutes: ServerRoute[] = [
  {
    path: 'projects/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => PROJECTS.map(({ slug }) => ({ slug })),
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
