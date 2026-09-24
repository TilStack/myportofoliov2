import { Routes } from '@angular/router';
import { SEO } from './data/seo.data';
import { personSchema, productSchemas, websiteSchema } from './data/structured-data';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
    data: { seo: SEO.home, jsonLd: [personSchema(), websiteSchema(), ...productSchemas()] },
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about.component').then((m) => m.AboutComponent),
    data: { seo: SEO.about, jsonLd: [personSchema()] },
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./features/projects/projects.component').then(
        (m) => m.ProjectsComponent,
      ),
    data: { seo: SEO.projects },
  },
  {
    path: 'projects/:slug',
    loadComponent: () =>
      import('./features/projects/project-detail/project-detail.component').then(
        (m) => m.ProjectDetailComponent,
      ),
  },
  {
    path: 'boutique',
    loadComponent: () =>
      import('./features/boutique/boutique.component').then((m) => m.BoutiqueComponent),
    data: { seo: SEO.boutique, jsonLd: [...productSchemas()] },
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./features/blog/blog.component').then((m) => m.BlogComponent),
    data: { seo: SEO.blog },
  },
  {
    path: 'quotes',
    loadComponent: () =>
      import('./features/quotes/quotes.component').then(
        (m) => m.QuotesComponent,
      ),
    data: { seo: SEO.quotes },
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/contact/contact.component').then(
        (m) => m.ContactComponent,
      ),
    data: { seo: SEO.contact },
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin.component').then((m) => m.AdminComponent),
    data: { seo: SEO.admin },
  },
  {
    // Pré-rendue (/404), puis déplacée en 404.html par scripts/prepare-404.mjs : Firebase Hosting
    // sert ce fichier avec un statut 404 pour toute URL inconnue. Le CLI Angular ne le fait pas seul.
    path: '404',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
    data: { seo: SEO.notFound },
  },
  {
    // Même page si la navigation se fait côté client vers une URL inconnue.
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
    data: { seo: SEO.notFound },
  },
];
