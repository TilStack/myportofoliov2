import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FirebaseService } from './firebase.service';
import { Quote } from '../models';

const COLLECTION = 'quotes';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private fb = inject(FirebaseService);

  getAll(): Observable<Quote[]> {
    return this.fb.getAll<any>(COLLECTION).pipe(
      map(quotes => quotes.map(q => ({
        ...q,
        date: q.date?.toDate ? q.date.toDate() : new Date(q.date ?? Date.now()),
      } as Quote)))
    );
  }

  create(quote: Omit<Quote, 'id' | 'expanded'>): Promise<string> {
    return this.fb.add(COLLECTION, quote);
  }

  update(id: string, data: Partial<Omit<Quote, 'id' | 'expanded'>>): Promise<void> {
    return this.fb.update<Quote>(COLLECTION, id, data);
  }

  delete(id: string): Promise<void> {
    return this.fb.delete(COLLECTION, id);
  }
}
