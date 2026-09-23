import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { appConfig } from './app.config';
import { environment } from '../environments/environment';

/** Firebase n'est fourni que dans le navigateur : jamais pendant le pré-rendu. */
const firebaseConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
  ],
};

export const browserConfig = mergeApplicationConfig(appConfig, firebaseConfig);
