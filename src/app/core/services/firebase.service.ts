import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, getDoc, getDocs,
         updateDoc, deleteDoc, query, where, orderBy, limit,
         CollectionReference, DocumentData, onSnapshot } from '@angular/fire/firestore';
import { Auth, signInWithEmailAndPassword, signOut,
         onAuthStateChanged, User } from '@angular/fire/auth';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private firestore = inject(Firestore);
  private auth      = inject(Auth);

  // --- Auth state ---
  private userSubject = new BehaviorSubject<User | null>(null);
  readonly user$ = this.userSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, user => this.userSubject.next(user));
  }

  get currentUser(): User | null {
    return this.userSubject.getValue();
  }

  login(email: string, password: string): Promise<void> {
    return signInWithEmailAndPassword(this.auth, email, password).then(() => {});
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

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
