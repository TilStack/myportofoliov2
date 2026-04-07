import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FirebaseService } from './firebase.service';
import { Quote } from '../models';

const COLLECTION = 'quotes';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private fb = inject(FirebaseService);

  private mapDates = (quotes: any[]): Quote[] =>
    quotes.map(q => ({
      ...q,
      date: q.date?.toDate ? q.date.toDate() : new Date(q.date ?? Date.now()),
    } as Quote));

  /** Public: only approved (or legacy quotes with no status) */
  getAll(): Observable<Quote[]> {
    return this.fb.getAll<any>(COLLECTION).pipe(
      map(quotes => this.mapDates(quotes).filter(q => !q.status || q.status === 'approved'))
    );
  }

  /** Owner only: pending submissions awaiting review */
  getPending(): Observable<Quote[]> {
    return this.fb.getAll<any>(COLLECTION).pipe(
      map(quotes => this.mapDates(quotes).filter(q => q.status === 'pending'))
    );
  }

  /** Owner adds a quote directly — goes live immediately */
  create(quote: Omit<Quote, 'id' | 'expanded'>): Promise<string> {
    return this.fb.add(COLLECTION, { ...quote, status: 'approved' });
  }

  /** Visitor submits a quote — waits for approval */
  createAsVisitor(quote: Omit<Quote, 'id' | 'expanded'>): Promise<string> {
    return this.fb.add(COLLECTION, { ...quote, status: 'pending' });
  }

  /** Owner approves a pending quote */
  approve(id: string): Promise<void> {
    return this.fb.update<Quote>(COLLECTION, id, { status: 'approved' } as any);
  }

  /** Owner rejects a pending quote (deletes it) */
  reject(id: string): Promise<void> {
    return this.fb.delete(COLLECTION, id);
  }

  update(id: string, data: Partial<Omit<Quote, 'id' | 'expanded'>>): Promise<void> {
    return this.fb.update<Quote>(COLLECTION, id, data);
  }

  delete(id: string): Promise<void> {
    return this.fb.delete(COLLECTION, id);
  }
}
