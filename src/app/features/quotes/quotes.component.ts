import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';
import { QuoteModalComponent } from './quote-modal/quote-modal.component';
import { Quote } from '../../core/models/quote.model';
import { QUOTES } from './quotes.data';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule, FadeOnScrollDirective, QuoteModalComponent],
  templateUrl: './quotes.component.html',
  styleUrl: './quotes.component.scss',
})
export class QuotesComponent {
  readonly quotes = QUOTES;

  activeQuote = signal<Quote | null>(null);

  /** All unique tags across all quotes */
  readonly allTags = [...new Set(QUOTES.flatMap(q => q.tags))];

  /** All unique categories */
  readonly categories = ['Tous', ...new Set(QUOTES.map(q => q.category ?? '').filter(Boolean))];

  activeCategory = signal<string>('Tous');

  get filtered(): Quote[] {
    const cat = this.activeCategory();
    if (cat === 'Tous') return this.quotes;
    return this.quotes.filter(q => q.category === cat);
  }

  openModal(quote: Quote): void {
    this.activeQuote.set(quote);
  }

  closeModal(): void {
    this.activeQuote.set(null);
  }

  setCategory(cat: string): void {
    this.activeCategory.set(cat);
  }

  initials(author: string): string {
    return author.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
}
