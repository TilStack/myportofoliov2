import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, getDoc,
         updateDoc, deleteDoc,
         CollectionReference, DocumentData, onSnapshot } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private firestore = inject(Firestore);

  // --- Generic Firestore helpers ---
  col<T = DocumentData>(path: string): CollectionReference<T> {
    return collection(this.firestore, path) as CollectionReference<T>;
  }

  getAll<T>(collectionPath: string): Observable<T[]> {
    return new Observable(observer => {
      const unsub = onSnapshot(collection(this.firestore, collectionPath), snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
        observer.next(data);
      }, err => observer.error(err));
      return () => unsub();
    });
  }

  getById<T>(collectionPath: string, id: string): Observable<T | null> {
    return from(getDoc(doc(this.firestore, collectionPath, id))).pipe(
      map(snap => snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null)
    );
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
