import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { SeoService } from './core/services/seo.service';

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
    provideAnimationsAsync(),
    provideClientHydration(withEventReplay()),
    // Title, meta, canonical, Open Graph et JSON-LD de chaque route (pré-rendu compris).
    provideAppInitializer(() => inject(SeoService).watchRoutes()),
  ],
};
