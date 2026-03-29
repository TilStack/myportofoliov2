import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'Home | TilPortofolio',
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about.component').then((m) => m.AboutComponent),
    title: 'About | TilPortofolio',
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./features/projects/projects.component').then(
        (m) => m.ProjectsComponent,
      ),
    title: 'Projects | TilPortofolio',
  },
  {
    path: 'projects/:id',
    loadComponent: () =>
      import('./features/projects/project-detail/project-detail.component').then(
        (m) => m.ProjectDetailComponent,
      ),
    title: 'Project | TilPortofolio',
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./features/blog/blog.component').then((m) => m.BlogComponent),
    title: 'Blog | TilPortofolio',
  },
  {
    path: 'quotes',
    loadComponent: () =>
      import('./features/quotes/quotes.component').then(
        (m) => m.QuotesComponent,
      ),
    title: 'Quotes | TilPortofolio',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
