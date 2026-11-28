import { RenderMode, ServerRoute } from '@angular/ssr';
import { BLOG_POSTS } from './data/blog.data';
import { VISIBLE_PROJECTS } from './data/projects.data';

// Site 100 % statique (Firebase Hosting) : toutes les routes sont pré-rendues au build.
export const serverRoutes: ServerRoute[] = [
  {
    path: 'projects/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => VISIBLE_PROJECTS.map(({ slug }) => ({ slug })),
  },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => BLOG_POSTS.map(({ slug }) => ({ slug })),
  },
  // Espace admin : jamais pré-rendu (coquille client uniquement, hors sitemap).
  { path: 'admin', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
