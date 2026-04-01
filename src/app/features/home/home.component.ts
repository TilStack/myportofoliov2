import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { Quote } from '../../core/models';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';
import { MONTAGE_PHOTOS } from '../../core/config/images.config';
import { QUOTES } from '../quotes/quotes.data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ButtonComponent, FadeOnScrollDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  i18n = inject(I18nService);

  readonly montagePhotos = MONTAGE_PHOTOS;
  readonly quotes = signal<Quote[]>(QUOTES.slice(0, 6));

  toggleQuote(quote: Quote): void {
    quote.expanded = !quote.expanded;
  }

  downloadCV(): void {
    const a = document.createElement('a');
    a.href     = 'TilStack_CV.pdf';
    a.download = 'TilStack_CV.pdf';
    a.click();
  }
}
