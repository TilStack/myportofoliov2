import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { IMAGE_LOADER } from '@angular/common';
import { provideClientHydration, withEventReplay, withIncrementalHydration } from '@angular/platform-browser';
import { provideRouter, withViewTransitions, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { SeoService } from './core/services/seo.service';
import { imageLoader } from './shared/utils/responsive-image';

/** Configuration commune au navigateur et au pré-rendu (aucun accès Firebase ici). */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    // NgOptimizedImage : variantes WebP générées à l'avance (npm run images), choisies via le manifeste.
    { provide: IMAGE_LOADER, useValue: imageLoader },
    // Hydratation incrémentale : les blocs `@defer (hydrate on viewport)` sont rendus dans le HTML pré-rendu
    // (SEO) mais n'ont besoin de JavaScript qu'à leur arrivée à l'écran.
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    // Title, meta, canonical, Open Graph et JSON-LD de chaque route (pré-rendu compris).
    provideAppInitializer(() => inject(SeoService).watchRoutes()),
  ],
};
