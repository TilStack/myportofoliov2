import { Injectable, Injector, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc,
         DocumentData, onSnapshot } from '@angular/fire/firestore';
import { NEVER, Observable } from 'rxjs';

/**
 * Accès Firestore, réservé au navigateur : Firebase n'est pas fourni pendant
 * le pré-rendu. Côté serveur, les lectures ne rendent jamais de valeur
 * (`NEVER`) et les composants gardent leur contenu initial.
 */
@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private readonly injector  = inject(Injector);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private get firestore(): Firestore {
    return this.injector.get(Firestore);
  }

  // --- Generic Firestore helpers ---
  getAll<T>(collectionPath: string): Observable<T[]> {
    if (!this.isBrowser) return NEVER;
    return new Observable(observer => {
      const unsub = onSnapshot(collection(this.firestore, collectionPath), snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
        observer.next(data);
      }, err => observer.error(err));
      return () => unsub();
    });
  }

  add<T>(collectionPath: string, data: T): Promise<string> {
    return addDoc(collection(this.firestore, collectionPath), data as DocumentData)
      .then(ref => ref.id);
  }

  update<T>(collectionPath: string, id: string, data: Partial<T>): Promise<void> {
    return updateDoc(doc(this.firestore, collectionPath, id), data as DocumentData);
  }

  delete(collectionPath: string, id: string): Promise<void> {
    return deleteDoc(doc(this.firestore, collectionPath, id));
  }
}
