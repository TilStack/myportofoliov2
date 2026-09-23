import { Injectable, NgZone, PLATFORM_ID, afterNextRender, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { loadFirebaseApp } from '../config/firebase-app';
import { ADMIN_UID } from '../../data/site.data';

type AuthModule = typeof import('firebase/auth');
type Auth = ReturnType<AuthModule['getAuth']>;

export interface AdminUser {
  uid: string;
  email: string | null;
}

const HINT_KEY = 'admin-session-hint';

/**
 * Connexion Google réservée à l'admin.
 *
 * Firebase Auth est chargé à la demande (import dynamique de `firebase/auth`) : il n'est ni dans le
 * bundle initial ni dans le HTML pré-rendu. Un visiteur normal ne le charge jamais ;
 * il ne l'est que sur /admin ou si un admin s'est déjà connecté sur ce navigateur.
 * Le contrôle réel des droits est fait par firestore.rules (isAdmin()) : ce service
 * ne fait que décider quelle interface afficher.
 */
@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly zone      = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly user    = signal<AdminUser | null>(null);
  /** true une fois l'état de connexion connu (après chargement d'Auth). */
  readonly ready   = signal(false);
  readonly isAdmin = computed(() => !!ADMIN_UID && this.user()?.uid === ADMIN_UID);

  private loading?: Promise<{ m: AuthModule; auth: Auth }>;

  constructor() {
    afterNextRender(() => {
      if (localStorage.getItem(HINT_KEY)) void this.load();
    });
  }

  /** Charge Auth (une seule fois) et suit l'état de connexion. */
  load(): Promise<{ m: AuthModule; auth: Auth }> {
    if (!this.isBrowser) return new Promise(() => {});
    if (ngServerMode) {
      return new Promise(() => {});
    } else {
      return (this.loading ??= Promise.all([import('firebase/auth'), loadFirebaseApp()]).then(([m, app]) => {
        const auth = m.getAuth(app);
        m.onAuthStateChanged(auth, u => this.zone.run(() => {
          this.user.set(u ? { uid: u.uid, email: u.email } : null);
          if (!u) localStorage.removeItem(HINT_KEY);
          this.ready.set(true);
        }));
        return { m, auth };
      }));
    }
  }

  /**
   * Ouvre la popup Google. Si ADMIN_UID est renseigné et ne correspond pas,
   * la session est fermée aussitôt et la promesse est rejetée ('not-admin').
   */
  async signIn(): Promise<AdminUser> {
    const { m, auth } = await this.load();
    const { user } = await m.signInWithPopup(auth, new m.GoogleAuthProvider());
    if (ADMIN_UID && user.uid !== ADMIN_UID) {
      await m.signOut(auth);
      throw new Error('not-admin');
    }
    localStorage.setItem(HINT_KEY, '1');
    return { uid: user.uid, email: user.email };
  }

  async signOut(): Promise<void> {
    const { m, auth } = await this.load();
    await m.signOut(auth);
    localStorage.removeItem(HINT_KEY);
  }
}
