import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FirebaseService } from './firebase.service';
import { Quote, QuoteSubmission } from '../models';

const COLLECTION  = 'quotes';
const SUBMISSIONS = 'quoteSubmissions';

/** Coordonnées saisies par un visiteur qui propose une citation. */
export type SubmitterContact = Pick<QuoteSubmission, 'email' | 'role' | 'linkedin'>;

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private fb = inject(FirebaseService);

  private mapDates = (quotes: any[]): Quote[] =>
    quotes.map(q => ({
      ...q,
      date: q.date?.toDate ? q.date.toDate() : new Date(q.date ?? Date.now()),
    } as Quote));

  /**
   * Public : citations approuvées uniquement. La requête filtre sur `status` parce que
   * les règles Firestore n'autorisent la lecture qu'aux citations approuvées. En cas
   * d'erreur (hors ligne, règles), le flux s'arrête et la page garde son contenu initial.
   */
  getAll(): Observable<Quote[]> {
    return this.fb.getAllWhere<any>(COLLECTION, 'status', '==', 'approved').pipe(
      map(quotes => this.mapDates(quotes)),
      catchError(() => EMPTY),
    );
  }

  /** Admin : propositions en attente de modération (refusé par les règles pour les autres). */
  getPending(): Observable<Quote[]> {
    return this.fb.getAllWhere<any>(COLLECTION, 'status', '==', 'pending').pipe(
      map(quotes => this.mapDates(quotes)),
      catchError(() => EMPTY),
    );
  }

  /** Admin : coordonnées des visiteurs (collection lisible par l'admin uniquement). */
  getSubmissions(): Observable<QuoteSubmission[]> {
    return this.fb.getAll<QuoteSubmission>(SUBMISSIONS).pipe(catchError(() => EMPTY));
  }

  /** Admin : ajoute une citation, publiée immédiatement. */
  create(quote: Omit<Quote, 'id' | 'expanded' | 'status'>): Promise<string> {
    return this.fb.add(COLLECTION, { ...quote, status: 'approved' });
  }

  /**
   * Visiteur : propose une citation. La citation (sans coordonnées) est écrite en
   * `pending` dans `quotes`, l'email et les autres coordonnées dans `quoteSubmissions`,
   * en un seul lot atomique.
   */
  createAsVisitor(
    quote: Omit<Quote, 'id' | 'expanded' | 'status'>,
    contact: SubmitterContact,
  ): Promise<string> {
    return this.fb.addLinked(
      COLLECTION, { ...quote, status: 'pending' },
      SUBMISSIONS, quoteId => ({ quoteId, ...contact }),
    );
  }

  /** Admin : approuve une proposition. */
  approve(id: string): Promise<void> {
    return this.fb.update<Quote>(COLLECTION, id, { status: 'approved' });
  }

  /** Admin : rejette une proposition (supprime la citation et les coordonnées associées). */
  reject(id: string): Promise<void> {
    return this.delete(id);
  }

  /** Visiteur : like (+1 / -1) — seule modification permise sans être admin. */
  like(id: string, likes: number): Promise<void> {
    return this.fb.update<Quote>(COLLECTION, id, { likes });
  }

  /** Admin : modifie une citation. */
  update(id: string, data: Partial<Omit<Quote, 'id' | 'expanded'>>): Promise<void> {
    return this.fb.update<Quote>(COLLECTION, id, data);
  }

  /** Admin : supprime une citation et ses coordonnées de visiteur. */
  async delete(id: string): Promise<void> {
    await this.fb.deleteWhere(SUBMISSIONS, 'quoteId', id);
    await this.fb.delete(COLLECTION, id);
  }
}
