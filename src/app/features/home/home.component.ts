import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';
import { QuoteService } from '../../core/services/quote.service';
import { ScrollAnimationService } from '../../core/services/scroll-animation.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { Quote } from '../../core/models';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, SkeletonComponent, FadeOnScrollDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  i18n         = inject(I18nService);
  quoteService = inject(QuoteService);
  scrollAnim   = inject(ScrollAnimationService);

  quotes        = signal<Quote[]>([]);
  quotesLoading = signal(true);

  ngOnInit(): void {
    this.quoteService.getAll().subscribe({
      next: q => {
        this.quotes.set(q.slice(0, 6));
        this.quotesLoading.set(false);
        // Give DOM a tick to render before observing
        setTimeout(() => this.scrollAnim.init(), 100);
      },
      error: () => this.quotesLoading.set(false),
    });
  }

  toggleQuote(quote: Quote): void {
    quote.expanded = !quote.expanded;
  }
}
