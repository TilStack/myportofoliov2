import type { FirebaseApp } from 'firebase/app';
import { environment } from '../../../environments/environment';

let app: Promise<FirebaseApp> | undefined;

/**
 * Instance Firebase unique, chargée à la demande (navigateur uniquement, mise en cache).
 * Côté serveur la promesse ne se résout jamais, et la branche est supprimée du bundle
 * serveur (voir `src/ng-server-mode.d.ts`).
 *
 * On utilise `firebase/*` directement plutôt que les wrappers `@angular/fire/*` :
 * `@angular/fire/firestore` importe statiquement `@angular/fire/auth` et
 * `@angular/fire/app-check`, ce qui embarquerait Firebase Auth dans le bundle initial.
 */
export function loadFirebaseApp(): Promise<FirebaseApp> {
  if (ngServerMode) {
    return new Promise(() => {});
  } else {
    return (app ??= import('firebase/app').then(({ getApp, getApps, initializeApp }) =>
      getApps().length ? getApp() : initializeApp(environment.firebase)));
  }
}
