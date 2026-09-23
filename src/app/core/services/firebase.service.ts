import { Injectable, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { DocumentData, Firestore, WhereFilterOp } from 'firebase/firestore';
import { NEVER, Observable, defer, switchMap } from 'rxjs';
import { loadFirebaseApp } from '../config/firebase-app';

type FirestoreModule = typeof import('firebase/firestore');
interface FirestoreContext { m: FirestoreModule; db: Firestore }

/** Firestore refuse `undefined` : on retire les clés vides avant l'écriture. */
function clean<T extends object>(data: T): DocumentData {
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
}

/**
 * Accès Firestore, réservé au navigateur et chargé à la demande : `firebase/firestore`
 * n'est importé (import dynamique) qu'au premier appel, puis mis en cache. Les pages qui
 * n'utilisent pas ce service ne téléchargent aucun code Firebase.
 *
 * Côté serveur (pré-rendu), les lectures ne rendent jamais de valeur (`NEVER`) et les
 * composants gardent leur contenu initial ; `firebase/firestore` n'entre pas dans le bundle
 * serveur (sa version Node dépend de gRPC, module CommonJS).
 */
@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private readonly zone      = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private context?: Promise<FirestoreContext>;

  /** Charge Firestore (une seule fois) et l'initialise sur l'app Firebase. */
  private load(): Promise<FirestoreContext> {
    if (!this.isBrowser) return new Promise(() => {});
    if (ngServerMode) {
      return new Promise(() => {});
    } else {
      return (this.context ??= Promise.all([import('firebase/firestore'), loadFirebaseApp()])
        .then(([m, app]) => ({ m, db: m.getFirestore(app) })));
    }
  }

  // --- Generic Firestore helpers ---

  /**
   * Lecture filtrée en temps réel. Les règles Firestore n'autorisent une liste que si
   * la requête prouve elle-même qu'elle ne peut pas renvoyer de documents interdits :
   * toute collection dont la lecture dépend d'un champ (ex. `status`) passe par ici.
   */
  getAllWhere<T>(collectionPath: string, field: string, op: WhereFilterOp, value: unknown): Observable<T[]> {
    if (!this.isBrowser) return NEVER;
    return defer(() => this.load()).pipe(switchMap(({ m, db }) => new Observable<T[]>(observer => {
      const q = m.query(m.collection(db, collectionPath), m.where(field, op, value));
      const unsub = m.onSnapshot(q, snap => {
        this.zone.run(() => observer.next(snap.docs.map(d => ({ id: d.id, ...d.data() } as T))));
      }, err => this.zone.run(() => observer.error(err)));
      return () => unsub();
    })));
  }

  /** Lecture de toute la collection (réservée aux collections dont les règles l'autorisent). */
  getAll<T>(collectionPath: string): Observable<T[]> {
    if (!this.isBrowser) return NEVER;
    return defer(() => this.load()).pipe(switchMap(({ m, db }) => new Observable<T[]>(observer => {
      const unsub = m.onSnapshot(m.collection(db, collectionPath), snap => {
        this.zone.run(() => observer.next(snap.docs.map(d => ({ id: d.id, ...d.data() } as T))));
      }, err => this.zone.run(() => observer.error(err)));
      return () => unsub();
    })));
  }

  async add<T extends object>(collectionPath: string, data: T): Promise<string> {
    const { m, db } = await this.load();
    const ref = await m.addDoc(m.collection(db, collectionPath), clean(data));
    return ref.id;
  }

  /**
   * Crée un document puis un second qui le référence, dans un seul lot atomique
   * (les deux écritures réussissent ou échouent ensemble). Retourne l'id du premier.
   */
  async addLinked<A extends object, B extends object>(
    pathA: string, dataA: A, pathB: string, buildB: (idA: string) => B,
  ): Promise<string> {
    const { m, db } = await this.load();
    const batch = m.writeBatch(db);
    const refA  = m.doc(m.collection(db, pathA));
    batch.set(refA, clean(dataA));
    batch.set(m.doc(m.collection(db, pathB)), clean(buildB(refA.id)));
    await batch.commit();
    return refA.id;
  }

  async update<T>(collectionPath: string, id: string, data: Partial<T>): Promise<void> {
    const { m, db } = await this.load();
    return m.updateDoc(m.doc(db, collectionPath, id), clean(data as object));
  }

  async delete(collectionPath: string, id: string): Promise<void> {
    const { m, db } = await this.load();
    return m.deleteDoc(m.doc(db, collectionPath, id));
  }

  /** Supprime tous les documents dont `field == value` (admin). */
  async deleteWhere(collectionPath: string, field: string, value: unknown): Promise<void> {
    const { m, db } = await this.load();
    const snap = await m.getDocs(m.query(m.collection(db, collectionPath), m.where(field, '==', value)));
    if (snap.empty) return;
    const batch = m.writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
}
