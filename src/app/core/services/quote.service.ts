import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { Quote } from '../models';

const COLLECTION = 'quotes';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private fb = inject(FirebaseService);

  getAll(): Observable<Quote[]> {
    return this.fb.getAll<Quote>(COLLECTION);
  }

  create(quote: Omit<Quote, 'id' | 'expanded'>): Promise<string> {
    return this.fb.add(COLLECTION, quote);
  }
}
