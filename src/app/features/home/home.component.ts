import { NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { Quote } from '../../core/models';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';
import { MONTAGE_PHOTOS } from '../../core/config/images.config';
import { QUOTES } from '../quotes/quotes.data';
import { LINKEDIN_URL } from '../../data/site.data';
import { responsiveImage } from '../../shared/utils/responsive-image';
import { ShopSectionComponent } from '../../shared/components/shop-section/shop-section.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { FeaturedProjectsComponent } from './featured-projects/featured-projects.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, ButtonComponent, FadeOnScrollDirective, ShopSectionComponent, IconComponent, FeaturedProjectsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  i18n = inject(I18nService);

  /** Photo du hero : élément LCP de l'accueil (priority). */
  readonly heroPhoto = responsiveImage('images/profile/me_simple.webp');
  readonly cardPhoto = responsiveImage('images/profile/me2.webp');

  readonly linkedinUrl = LINKEDIN_URL;
  readonly montagePhotos = MONTAGE_PHOTOS;
  /** `true` seulement si toutes les photos du montage sont des fichiers locaux (pas de placeholder Unsplash). */
  readonly montagePhotosAreLocal = MONTAGE_PHOTOS.every(p => !!p.file);
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
