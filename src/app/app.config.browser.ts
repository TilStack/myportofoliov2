import { ApplicationConfig, mergeApplicationConfig, provideAppInitializer } from '@angular/core';

import { appConfig } from './app.config';
import { APP_CHECK } from './core/config/app-check.config';
import { loadFirebaseApp } from './core/config/firebase-app';

/** Configuration navigateur : Firebase n'est jamais initialisé pendant le pré-rendu. */
const browserOnlyConfig: ApplicationConfig = {
  providers: [
    // App Check (reCAPTCHA v3) : derrière un flag, chargé à la demande.
    // Actif seulement si APP_CHECK.enabled ET une clé de site sont renseignés.
    // Doit être initialisé avant la première requête Firestore : d'où l'initializer.
    provideAppInitializer(async () => {
      if (!APP_CHECK.enabled || !APP_CHECK.siteKey) return;
      const [{ initializeAppCheck, ReCaptchaV3Provider }, app] =
        await Promise.all([import('firebase/app-check'), loadFirebaseApp()]);
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(APP_CHECK.siteKey),
        isTokenAutoRefreshEnabled: true,
      });
    }),
  ],
};

export const browserConfig = mergeApplicationConfig(appConfig, browserOnlyConfig);
