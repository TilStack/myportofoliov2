import { NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { Quote } from '../../core/models';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';
import { MONTAGE_CREDITS, MONTAGE_PHOTOS } from '../../core/config/images.config';
import { QUOTES } from '../quotes/quotes.data';
import { VISIBLE_PROJECTS } from '../../data/projects.data';
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
  readonly montageCredits = MONTAGE_CREDITS;
  /** `true` seulement si toutes les photos du montage sont des fichiers locaux (pas de placeholder Unsplash). */
  readonly montagePhotosAreLocal = MONTAGE_PHOTOS.every(p => !!p.file);
  /** Aperçus réels des cartes « Explorez mon univers » (plus de faux code ni de fausses lignes). */
  readonly previewProjects = VISIBLE_PROJECTS.slice(0, 4);
  readonly blogTopics = ['Angular', 'Flutter', 'NestJS', 'Docker', 'Lottie'];
  readonly previewQuote = QUOTES[0];
  /**
   * Citation mise en avant sur l'accueil (texte donné par Israel). TODO(israel): si elle doit aussi figurer sur
   * /quotes, l'ajouter à QUOTES avec sa date et son explication.
   */
  readonly featuredQuote = {
    text: "Être l'exception parmi les exceptions afin d'être exceptionnellement exceptionnel.",
    author: 'Israel Tientcheu',
  };
  /** Trois autres citations seulement : la page /quotes montre le reste. */
  readonly quotes = signal<Quote[]>(QUOTES.slice(0, 3));

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
