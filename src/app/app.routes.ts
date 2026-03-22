import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Home | Portfolio',
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about.component').then(m => m.AboutComponent),
    title: 'About | Portfolio',
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./features/projects/projects.component').then(m => m.ProjectsComponent),
    title: 'Projects | Portfolio',
  },
  {
    path: 'projects/:id',
    loadComponent: () =>
      import('./features/projects/project-detail/project-detail.component')
        .then(m => m.ProjectDetailComponent),
    title: 'Project | Portfolio',
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./features/blog/blog.component').then(m => m.BlogComponent),
    title: 'Blog | Portfolio',
  },
  {
    path: 'quotes',
    loadComponent: () =>
      import('./features/quotes/quotes.component').then(m => m.QuotesComponent),
    title: 'Quotes | Portfolio',
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact | Portfolio',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
