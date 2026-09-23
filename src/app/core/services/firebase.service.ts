import { Injectable, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getFirestore,
         query, where, writeBatch, WhereFilterOp,
         DocumentData, onSnapshot } from 'firebase/firestore';
import { NEVER, Observable } from 'rxjs';
import { getFirebaseApp } from '../config/firebase-app';

/** Firestore refuse `undefined` : on retire les clés vides avant l'écriture. */
function clean<T extends object>(data: T): DocumentData {
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
}

/**
 * Accès Firestore, réservé au navigateur : Firebase n'est pas fourni pendant
 * le pré-rendu. Côté serveur, les lectures ne rendent jamais de valeur
 * (`NEVER`) et les composants gardent leur contenu initial.
 */
@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private readonly zone      = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private db?: Firestore;

  /** Initialisé au premier usage, dans le navigateur uniquement. */
  private get firestore(): Firestore {
    return (this.db ??= getFirestore(getFirebaseApp()));
  }

  // --- Generic Firestore helpers ---

  /**
   * Lecture filtrée en temps réel. Les règles Firestore n'autorisent une liste que si
   * la requête prouve elle-même qu'elle ne peut pas renvoyer de documents interdits :
   * toute collection dont la lecture dépend d'un champ (ex. `status`) passe par ici.
   */
  getAllWhere<T>(collectionPath: string, field: string, op: WhereFilterOp, value: unknown): Observable<T[]> {
    if (!this.isBrowser) return NEVER;
    return new Observable(observer => {
      const q = query(collection(this.firestore, collectionPath), where(field, op, value));
      const unsub = onSnapshot(q, snap => {
        this.zone.run(() => observer.next(snap.docs.map(d => ({ id: d.id, ...d.data() } as T))));
      }, err => this.zone.run(() => observer.error(err)));
      return () => unsub();
    });
  }

  /** Lecture de toute la collection (réservée aux collections dont les règles l'autorisent). */
  getAll<T>(collectionPath: string): Observable<T[]> {
    if (!this.isBrowser) return NEVER;
    return new Observable(observer => {
      const unsub = onSnapshot(collection(this.firestore, collectionPath), snap => {
        this.zone.run(() => observer.next(snap.docs.map(d => ({ id: d.id, ...d.data() } as T))));
      }, err => this.zone.run(() => observer.error(err)));
      return () => unsub();
    });
  }

  add<T extends object>(collectionPath: string, data: T): Promise<string> {
    return addDoc(collection(this.firestore, collectionPath), clean(data))
      .then(ref => ref.id);
  }

  /**
   * Crée un document puis un second qui le référence, dans un seul lot atomique
   * (les deux écritures réussissent ou échouent ensemble). Retourne l'id du premier.
   */
  addLinked<A extends object, B extends object>(
    pathA: string, dataA: A, pathB: string, buildB: (idA: string) => B,
  ): Promise<string> {
    const batch = writeBatch(this.firestore);
    const refA  = doc(collection(this.firestore, pathA));
    batch.set(refA, clean(dataA));
    batch.set(doc(collection(this.firestore, pathB)), clean(buildB(refA.id)));
    return batch.commit().then(() => refA.id);
  }

  update<T>(collectionPath: string, id: string, data: Partial<T>): Promise<void> {
    return updateDoc(doc(this.firestore, collectionPath, id), clean(data as object));
  }

  delete(collectionPath: string, id: string): Promise<void> {
    return deleteDoc(doc(this.firestore, collectionPath, id));
  }

  /** Supprime tous les documents dont `field == value` (admin). */
  async deleteWhere(collectionPath: string, field: string, value: unknown): Promise<void> {
    const snap = await getDocs(query(collection(this.firestore, collectionPath), where(field, '==', value)));
    if (snap.empty) return;
    const batch = writeBatch(this.firestore);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
}
