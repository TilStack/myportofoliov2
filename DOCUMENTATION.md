# TilStack Portfolio v2 — Documentation for Beginners

> This document explains every part of the project in simple terms.
> You don't need to be an expert to understand it — just read it step by step.

---

## Table of Contents

1. [What is this project?](#1-what-is-this-project)
2. [How to run the project](#2-how-to-run-the-project)
3. [Project folder structure](#3-project-folder-structure)
4. [How Angular works (quick primer)](#4-how-angular-works-quick-primer)
5. [Entry points — where everything starts](#5-entry-points--where-everything-starts)
6. [Routing — how pages work](#6-routing--how-pages-work)
7. [Layout components — the shell](#7-layout-components--the-shell)
8. [Feature pages](#8-feature-pages)
9. [Shared components](#9-shared-components)
10. [Core services — the brain](#10-core-services--the-brain)
11. [Data models — the shapes of data](#11-data-models--the-shapes-of-data)
12. [The design system (styles)](#12-the-design-system-styles)
13. [Firebase — the database](#13-firebase--the-database)
14. [Internationalization — two languages](#14-internationalization--two-languages)
15. [Theme system — light and dark mode](#15-theme-system--light-and-dark-mode)
16. [Animations — making things move](#16-animations--making-things-move)
17. [Glossary](#17-glossary)

---

## 1. What is this project?

This is a **personal portfolio website** for Israel Tientcheu (TilStack).

It is built with **Angular 20**, a JavaScript framework made by Google that helps you build complex web applications in an organized way.

The portfolio has these pages:
- **Home** — hero greeting, quote preview
- **About** — biography, skills, setup, education section, Cameroon gallery
- **Projects** — list of programming projects
- **Blog** — technical articles
- **Quotes** — inspirational quotes
- **Contact** — contact form + social links

The website supports:
- **Two languages**: English and French (switchable in the navbar)
- **Two themes**: Light mode and Dark mode (toggle button in navbar)
- **Mobile and desktop**: Fully responsive layout

---

## 2. How to run the project

You need **Node.js** (v18 or higher) installed on your computer.

```bash
# 1. Install all dependencies
npm install

# 2. Start the development server
npm start

# 3. Open your browser at:
# http://localhost:4200
```

To build for production (final output that you deploy online):
```bash
npm run build
# Output goes to: dist/myportofoliov2/browser/
```

---

## 3. Project folder structure

```
myportofoliov2/
│
├── src/                        ← All source code lives here
│   ├── main.ts                 ← Entry point: starts Angular
│   ├── index.html              ← The one HTML page (Angular is a SPA)
│   ├── styles.scss             ← Global CSS styles
│   │
│   ├── app/                    ← All Angular components and logic
│   │   ├── app.ts              ← Root component (the "container" of everything)
│   │   ├── app.config.ts       ← App configuration (plugins, firebase, router)
│   │   ├── app.routes.ts       ← URL → Component mapping
│   │   │
│   │   ├── core/               ← Services and models used everywhere
│   │   │   ├── guards/         ← Route protection (only logged-in users)
│   │   │   ├── models/         ← TypeScript data shapes (interfaces)
│   │   │   └── services/       ← Logic shared across components
│   │   │
│   │   ├── features/           ← One folder per page
│   │   │   ├── home/
│   │   │   ├── about/
│   │   │   ├── projects/
│   │   │   ├── blog/
│   │   │   ├── quotes/
│   │   │   └── contact/
│   │   │
│   │   ├── layout/             ← Persistent UI (shown on every page)
│   │   │   ├── navbar/         ← Top navigation bar
│   │   │   └── footer/         ← Bottom footer
│   │   │
│   │   └── shared/             ← Reusable pieces
│   │       ├── components/     ← Button, Skeleton, BackToTop
│   │       ├── directives/     ← FadeOnScroll animation directive
│   │       └── pipes/          ← Data transformation utilities
│   │
│   ├── assets/
│   │   └── styles/             ← Design system files
│   │       ├── _variables.scss ← Colors, fonts, spacing tokens
│   │       ├── _mixins.scss    ← Reusable SCSS helpers
│   │       ├── _reset.scss     ← CSS baseline reset
│   │       └── _animations.scss← Keyframe animations
│   │
│   └── environments/           ← Config per environment
│       ├── environment.ts      ← Development (Firebase config, debug flags)
│       └── environment.prod.ts ← Production config
│
├── public/                     ← Static files served as-is
│   └── favicon.svg             ← Browser tab icon
│
├── angular.json                ← Angular CLI configuration
├── package.json                ← Dependencies and npm scripts
└── tsconfig.json               ← TypeScript configuration
```

---

## 4. How Angular works (quick primer)

Angular organizes your UI into **components**. Each component is made of 3 files:

| File | Role |
|------|------|
| `*.component.ts` | The logic (what the component does) |
| `*.component.html` | The template (what the user sees) |
| `*.component.scss` | The styles (how it looks) |

**Example — the Navbar:**
- `navbar.component.ts` — handles scroll detection, open/close menu, theme toggle
- `navbar.component.html` — the HTML structure of the bar (logo, links, buttons)
- `navbar.component.scss` — the CSS that makes it look good

### Angular Signals

This project uses **Signals** — a modern Angular feature for reactive state.

```typescript
// Create a signal
const menuOpen = signal(false);

// Read it
menuOpen()          // → false

// Update it
menuOpen.set(true); // → true
```

When a signal changes, Angular automatically updates the HTML that uses it. No manual refresh needed.

### Angular Control Flow

Instead of `*ngIf` and `*ngFor` (old Angular syntax), this project uses the new built-in syntax:

```html
<!-- Show something conditionally -->
@if (isLoading()) {
  <p>Loading…</p>
} @else {
  <p>Content loaded!</p>
}

<!-- Loop over a list -->
@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}
```

---

## 5. Entry points — where everything starts

### `src/main.ts`

This is the **very first file** Angular reads when the browser loads the page.

```typescript
bootstrapApplication(App, appConfig);
```

It says: *"Start the Angular application using the `App` root component and the `appConfig` configuration."*

### `src/index.html`

The **only HTML file** in the project. It contains a single tag:

```html
<app-root></app-root>
```

Angular replaces this tag with the entire application (navbar, page content, footer, etc.).

### `src/app/app.ts`

The **root component** — the outermost container. Its template looks like this:

```html
<app-navbar></app-navbar>
<main>
  <router-outlet></router-outlet>   <!-- Current page renders here -->
</main>
<app-footer></app-footer>
<app-back-to-top></app-back-to-top>
```

`<router-outlet>` is a placeholder — Angular automatically swaps it out with the correct page component based on the URL.

### `src/app/app.config.ts`

Configures all the **plugins** the app needs:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),  // Routing with page transition animations
    provideAnimationsAsync(),                       // Angular animations loaded asynchronously
    provideFirebaseApp(() => initializeApp(env)),   // Firebase connection
    provideFirestore(() => getFirestore()),          // Firestore database
    provideAuth(() => getAuth()),                   // Firebase authentication
  ]
};
```

Think of this file as the **plugin list** for the app.

---

## 6. Routing — how pages work

### `src/app/app.routes.ts`

This file maps **URLs to components**. When you visit `/about`, Angular loads the `AboutComponent`.

```typescript
export const routes: Routes = [
  { path: '',         loadComponent: () => import('./features/home/home.component') },
  { path: 'about',   loadComponent: () => import('./features/about/about.component') },
  { path: 'projects',loadComponent: () => import('./features/projects/projects.component') },
  { path: 'blog',    loadComponent: () => import('./features/blog/blog.component') },
  { path: 'quotes',  loadComponent: () => import('./features/quotes/quotes.component') },
  { path: 'contact', loadComponent: () => import('./features/contact/contact.component') },
  { path: '**',      redirectTo: '' },   // Unknown URL → go to home
];
```

`loadComponent` uses **lazy loading**: the code for each page is only downloaded when the user visits that page. This makes the initial load faster.

---

## 7. Layout components — the shell

### Navbar (`src/app/layout/navbar/`)

The navigation bar fixed at the top of every page.

**navbar.component.ts** — Logic:
- `scrolled` signal: becomes `true` when user scrolls down (adds shadow + background blur)
- `menuOpen` signal: toggles the mobile hamburger menu
- `links` array: all nav items (Home, About, Projects, Blog, Quotes, Contact)
- Uses `i18n.t('nav.home')` to display link labels in the right language

**navbar.component.html** — Structure:
1. **Logo** — animated "TilStack" wordmark (yellow dot + text)
2. **Desktop links** — hidden on mobile, shown on large screens
3. **Actions** — Language toggle (EN/FR), Theme toggle (☀/🌙), Burger button
4. **Mobile menu** — slides open/closed below the bar

**navbar.component.scss** — Styles:
- The `.navbar.scrolled` class adds a blurred background when scrolled
- The `.navbar__burger.open` class animates the 3 lines into an X shape
- The logo dot uses CSS `@keyframes logoDot` to rotate in on page load

---

### Footer (`src/app/layout/footer/`)

Simple bottom section with copyright and social links (GitHub, LinkedIn, Twitter).

---

## 8. Feature pages

### Home (`src/app/features/home/`)

The landing page. Composed of two sections:

**Hero section:**
- Large greeting "Hello, I'm" → full name "TIENTCHEU ISRAEL"
- Alias line "But you can call me **TilStack**"
- Role subtitle: "Full-Stack Developer · Mobile & Web"
- Two buttons: Download CV, View Projects
- Decorative card on the right (desktop only)

**Moodboard section:**
- Previews 6 quotes fetched from Firestore
- Each card expands on click to show explanation
- "See all quotes" link goes to the Quotes page

---

### About (`src/app/features/about/`)

Personal biography page with 4 sections:

1. **Hero** — Name, role tags ("Developer. Educator. Explorer."), short bio
2. **Skills** — Grid of technology tags (Angular, Flutter, NestJS, etc.)
3. **My Setup** — Cards showing laptop, phone, OS, tools used daily
4. **Educator** — Teaching and writing activities with stat counters
5. **Cameroon Gallery** — Auto-rotating image carousel (every 5 seconds)

**about.component.ts** has:
```typescript
skills = ['Angular', 'TypeScript', 'Flutter', ...];

setupItems = [
  { icon: '💻', label: 'Laptop', value: 'Dell Latitude 5490…' },
  ...
];

activeImageIndex = signal(0); // Tracks current slide
```

---

### Projects (`src/app/features/projects/`)

Grid of programming projects fetched from Firestore.

- Filter buttons auto-generated from the tech stacks of all projects
- Click a filter → only matching projects shown
- Click a project → navigates to `/projects/:id` (detail page)

**project-detail component** shows:
- Full project description
- Image gallery
- Tech stack pills
- Links to GitHub + Live Demo

---

### Blog (`src/app/features/blog/`)

List of technical articles. Fetched from Firestore's `blogPosts` collection.

Features:
- Like button (only works when logged in via Firebase Auth)
- Newsletter subscription form
- "Read more" link per article

---

### Quotes (`src/app/features/quotes/`)

A gallery of inspirational quotes written by Israel Tientcheu.

**quotes.data.ts** — Hardcoded list of quotes (not from Firestore). Each quote has:
```typescript
{
  id: 1,
  text: "A developer who doesn't read documentation...",
  author: 'Israel Tientcheu',
  explanation: 'Why this matters...',
  date: '2024-01-15',
  tags: ['learning', 'documentation'],
  likes: 42,
  category: 'Learning',
}
```

**Filter bar** — Click a category button to filter the displayed quotes.

**Quote modal** — Click a quote card to open a larger modal view with full explanation.

---

### Contact (`src/app/features/contact/`)

A contact form + social links.

**Form fields:**
- Name (required)
- Email (required, must be valid email format)
- Message (required)

When submitted:
- Shows a success message ("Message sent!")
- Resets the form
- (Backend email sending can be wired to Firebase Functions or EmailJS)

**Social links:**
- GitHub: `github.com/tilstack`
- LinkedIn: `linkedin.com/in/israel-tientcheu`
- Twitter: `x.com/tilstack`
- Email: `israel01tientcheu@gmail.com`

---

## 9. Shared components

### Button (`src/app/shared/components/button/`)

A reusable styled button. Used instead of raw `<button>` tags for consistency.

```html
<app-button variant="accent" size="lg">Download CV</app-button>
```

**Inputs:**
- `variant`: `primary` | `secondary` | `ghost` | `accent`
- `size`: `sm` | `md` | `lg`
- `loading`: shows a spinner inside the button
- `disabled`: disables the button
- `fullWidth`: makes the button stretch 100%

---

### Skeleton (`src/app/shared/components/skeleton/`)

A shimmering grey placeholder shown while data is loading.

```html
<app-skeleton height="8rem" width="100%"></app-skeleton>
```

It looks like a loading animation bar. Once data arrives, it's replaced by the real content.

---

### BackToTop (`src/app/shared/components/back-to-top/`)

A floating button (bottom-right corner) that appears when you scroll down more than 400px.

Clicking it smoothly scrolls back to the top of the page.

---

### FadeOnScroll Directive (`src/app/shared/directives/fade-on-scroll.directive.ts`)

A **directive** is a special Angular feature that adds behavior to an HTML element.

`appFadeOnScroll` watches elements as they scroll into view and adds the CSS class `visible`, which triggers a fade-in animation.

```html
<div class="fade-up" appFadeOnScroll [delay]="200">
  This will fade in when scrolled into view, with a 200ms delay.
</div>
```

**How it works internally:**
1. Uses `IntersectionObserver` API (browser API that detects when elements become visible)
2. When the element is 12% visible → adds class `visible`
3. The `delay` input adds a `transition-delay` for staggered animations

---

## 10. Core services — the brain

Services are TypeScript classes that hold **reusable logic**. They are injected into components automatically by Angular.

### `firebase.service.ts`

The low-level **database wrapper**. It talks directly to Firebase Firestore.

```typescript
// Read all documents from a collection
getAll<T>(collection: string): Observable<T[]>

// Read a single document
getById<T>(collection: string, id: string): Observable<T>

// Create a new document
add<T>(collection: string, data: T): Promise<DocumentReference>

// Update a document
update(collection: string, id: string, data: Partial<T>): Promise<void>

// Delete a document
delete(collection: string, id: string): Promise<void>
```

### `project.service.ts` / `blog.service.ts` / `quote.service.ts`

These are **domain services** that wrap `firebase.service`. They provide cleaner APIs for each data type:

```typescript
// Instead of: firebase.getAll<Project>('projects')
// You call:   projectService.getAll()
```

### `i18n.service.ts`

Handles **language switching** between English and French.

```typescript
// Get a translated string
i18n.t('nav.home')      // → "Home" (EN) or "Accueil" (FR)
i18n.t('hero.greeting') // → "Hello, I'm" (EN) or "Bonjour, je suis" (FR)

// Switch language
i18n.toggleLang()       // EN ↔ FR

// Check current language
i18n.lang()             // → 'en' or 'fr'
```

Translations are stored as nested objects:
```typescript
const EN = {
  nav: { home: 'Home', about: 'About', ... },
  hero: { greeting: "Hello, I'm", role: 'Full-Stack Developer', ... },
  ...
};
```

### `theme.service.ts`

Handles **light/dark mode** switching.

```typescript
themeService.toggle()    // Switch between light and dark
themeService.isDark()    // → true if dark mode is active
```

Internally, it sets `data-theme="dark"` on the `<html>` element. The SCSS then applies different colors:

```scss
:root                { --color-bg: #f8f9fa; }   /* Light mode */
[data-theme='dark']  { --color-bg: #0a0e17; }   /* Dark mode  */
```

### `scroll-animation.service.ts`

Initializes `IntersectionObserver` for scroll animations after each page navigation. It finds all elements with `.fade-up`, `.fade-left`, `.fade-right` classes and watches them.

---

## 11. Data models — the shapes of data

Models are TypeScript **interfaces** — they define what properties an object must have.

### `quote.model.ts`

```typescript
interface Quote {
  id: number;
  text: string;          // The quote itself
  author: string;        // Who said it
  explanation: string;   // Why it matters
  date: string;          // When it was added
  tags: string[];        // Topics (e.g. ['learning', 'growth'])
  likes: number;         // How many people liked it
  category: string;      // Main category (e.g. 'Learning')
  expanded?: boolean;    // UI state — is the card expanded?
}
```

### `project.model.ts`

```typescript
interface Project {
  id: string;
  title: string;
  description: string;    // Full text description
  shortDesc: string;      // Brief summary for cards
  imageUrl: string;       // Main thumbnail
  images: string[];       // Gallery images
  techStack: string[];    // e.g. ['Angular', 'Firebase']
  githubUrl: string;
  liveUrl: string;
  featured: boolean;      // Show on homepage?
  order: number;          // Sort order
  createdAt: Timestamp;
}
```

### `blog-post.model.ts`

```typescript
interface BlogPost {
  id: string;
  title: string;
  slug: string;           // URL-friendly version of title
  excerpt: string;        // Short preview text
  content: string;        // Full HTML or Markdown content
  coverUrl: string;       // Header image
  tags: string[];
  likes: number;
  published: boolean;     // Only show published posts
  authorId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 12. The design system (styles)

All visual decisions are centralized in the `src/assets/styles/` folder.

### `_variables.scss`

Every color, font size, spacing value, and animation speed is defined once here. No hardcoded values anywhere else.

**Colors:**
```scss
$color-primary:  #14213d;   // Dark navy (brand color)
$color-accent:   #ffde59;   // Yellow (highlight color)
```

**Spacing scale** (like Tailwind CSS):
```scss
$space-1:  0.25rem;   //  4px
$space-2:  0.5rem;    //  8px
$space-4:  1rem;      // 16px
$space-8:  2rem;      // 32px
$space-16: 4rem;      // 64px
```

**Font sizes:**
```scss
$text-xs:   0.75rem;   // 12px
$text-sm:   0.875rem;  // 14px
$text-base: 1rem;      // 16px
$text-lg:   1.125rem;  // 18px
$text-xl:   1.25rem;   // 20px
$text-2xl:  1.5rem;    // 24px
```

**Transitions:**
```scss
$transition-fast:   150ms ease;
$transition-base:   300ms ease;
$transition-slow:   500ms ease;
$ease-out-cubic:    cubic-bezier(0.33, 1, 0.68, 1);
```

---

### `_mixins.scss`

Reusable SCSS snippets (like functions for CSS).

**Responsive breakpoints:**
```scss
@mixin lg {
  @media (min-width: 1024px) { @content; }
}

// Usage:
.navbar__links {
  display: none;        // Hidden on mobile

  @include lg {
    display: flex;      // Visible on desktop
  }
}
```

**Flexbox helpers:**
```scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

**Animated underline (used for nav links):**
```scss
@mixin underline-anim($color, $height) {
  position: relative;
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: $height;
    background: $color;
    transition: width 300ms ease;
  }
  &:hover::after { width: 100%; }
}
```

---

### `src/styles.scss` (Global)

Imports all design system files and defines **CSS Custom Properties** (variables readable by JavaScript):

```scss
:root {
  --color-bg:        #f8f9fa;
  --color-text:      #0a0e17;
  --color-surface:   #ffffff;
  --color-border:    rgba(0,0,0,0.08);
  --color-accent-text: #14213d;  // Dark on light background = readable yellow text
}

[data-theme='dark'] {
  --color-bg:        #0a0e17;
  --color-text:      #e8eaf0;
  --color-surface:   #111827;
  --color-border:    rgba(255,255,255,0.08);
  --color-accent-text: #ffde59;  // Yellow is visible on dark background
}
```

The `--color-accent-text` variable is a smart solution: yellow (`#ffde59`) is invisible on white backgrounds but looks great on dark ones. By using this variable, text automatically picks the right color in both themes.

---

## 13. Firebase — the database

Firebase is Google's cloud platform. This project uses two Firebase services:

### Firestore (Database)

A **NoSQL document database**. Data is organized in **collections** (like folders) and **documents** (like files).

```
Firestore
├── projects/
│   ├── abc123  ← one project document
│   └── def456  ← another project
├── blogPosts/
│   ├── post1/
│   │   ├── (post data)
│   │   └── comments/   ← sub-collection
│   │       └── comment1
└── quotes/
    └── quote1
```

### Firebase Authentication

Used for login. Only logged-in users can like blog posts. The `auth.guard.ts` protects routes that require login.

### Setup

Firebase credentials go in `src/environments/environment.ts`:
```typescript
export const environment = {
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    // ...
  }
};
```

**Never commit real credentials to git.** Use environment variables in CI/CD pipelines.

---

## 14. Internationalization — two languages

The app supports **English** and **French** without any external library.

### How to add a new translation key

1. Open `src/app/core/services/i18n.service.ts`
2. Add the key to both `EN` and `FR` objects:

```typescript
const EN = {
  hero: {
    greeting: "Hello, I'm",
    // Add new key here:
    tagline: "Building the web, one component at a time.",
  }
};

const FR = {
  hero: {
    greeting: 'Bonjour, je suis',
    // And the French version:
    tagline: "Construire le web, un composant à la fois.",
  }
};
```

3. Use it in any template:
```html
<p>{{ i18n.t('hero.tagline') }}</p>
```

---

## 15. Theme system — light and dark mode

The theme is switched by toggling a `data-theme` attribute on the `<html>` element.

**User flow:**
1. User clicks the ☀/🌙 button in the navbar
2. `themeService.toggle()` is called
3. `data-theme="dark"` is added to (or removed from) `<html>`
4. CSS custom properties change → entire UI re-colors instantly
5. Choice is saved to `localStorage` → persists on next visit

**How to add a new themed color:**

In `src/styles.scss`:
```scss
:root {
  --color-my-new-thing: #ffffff;
}
[data-theme='dark'] {
  --color-my-new-thing: #000000;
}
```

In any SCSS file:
```scss
.my-element {
  background: var(--color-my-new-thing);
}
```

---

## 16. Animations — making things move

The project uses two types of animations:

### 1. CSS Keyframes (page load animations)

Defined in `src/assets/styles/_animations.scss` and inline in component SCSS files.

```scss
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.my-element {
  animation: fadeInUp 400ms ease both;
}
```

The `both` fill-mode means: start invisible (`opacity: 0`) and stay in final state after animation ends.

**Staggered animations** use `animation-delay`:
```scss
.delay-1 { animation-delay: 100ms; }
.delay-2 { animation-delay: 200ms; }
.delay-3 { animation-delay: 300ms; }
```

### 2. Scroll animations (IntersectionObserver)

Elements with class `fade-up`, `fade-left`, or `fade-right` start invisible and animate in when scrolled into view.

```html
<!-- This fades in from below when you scroll to it -->
<div class="fade-up" appFadeOnScroll [delay]="100">
  Content here
</div>
```

**How it works:**
1. `FadeOnScrollDirective` creates an `IntersectionObserver`
2. Observer watches when the element enters the viewport
3. When visible → adds `.visible` class → CSS transition plays

```scss
.fade-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 600ms ease, transform 600ms ease;

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 3. Route transitions

When navigating between pages, Angular 20's View Transitions API creates a smooth cross-fade. Configured in `app.config.ts`:

```typescript
provideRouter(routes, withViewTransitions())
```

---

## 17. Glossary

| Term | Meaning |
|------|---------|
| **Angular** | A JavaScript framework for building web apps |
| **Component** | A reusable piece of UI with its own HTML, CSS, and logic |
| **Service** | A class that holds shared logic and can be injected anywhere |
| **Signal** | A reactive value that auto-updates the UI when it changes |
| **Directive** | A class that adds behavior to an HTML element |
| **Pipe** | A class that transforms data in templates (e.g., dates, text) |
| **Route** | A URL path mapped to a component |
| **Lazy loading** | Loading code only when it's actually needed |
| **Observable** | A stream of data that you can subscribe to (from RxJS) |
| **Firestore** | Google's cloud database used in this project |
| **SCSS** | Enhanced CSS with variables, nesting, and mixins |
| **Mixin** | A reusable SCSS block (like a function) |
| **CSS Custom Property** | A CSS variable (e.g., `--color-bg`) readable at runtime |
| **IntersectionObserver** | Browser API to detect when elements enter the viewport |
| **SPA** | Single Page Application — only one HTML file, JS handles navigation |
| **Standalone component** | An Angular component that doesn't need an NgModule |
| **i18n** | Abbreviation for "internationalization" (multi-language support) |
| **Token** | A design variable (color, spacing) used consistently everywhere |

---

*Generated for the myportofoliov2 project — TilStack Portfolio by Israel Tientcheu*
