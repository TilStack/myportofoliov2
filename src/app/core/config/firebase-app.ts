import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { environment } from '../../../environments/environment';

/**
 * Instance Firebase unique (navigateur uniquement).
 *
 * On utilise `firebase/*` directement plutôt que les wrappers `@angular/fire/*` :
 * `@angular/fire/firestore` importe statiquement `@angular/fire/auth` et
 * `@angular/fire/app-check`, ce qui embarquerait Firebase Auth dans le bundle initial.
 */
export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(environment.firebase);
}
