import { Component, computed, inject, input } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { PROJECT_OFFERS, ProjectOffer } from '../../../data/products.data';
import { PriceComponent } from '../price/price.component';

/**
 * Offres rattachées à un projet (`PROJECT_OFFERS[slug]`) : abonnements (Otadex).
 * Rien ne s'affiche pour un projet sans offre. Tant qu'une offre n'a pas d'URL (TODO(israel) dans
 * products.data.ts), le CTA est un libellé inactif « Bientôt disponible », jamais un lien mort.
 */
@Component({
  selector: 'app-project-offers',
  standalone: true,
  imports: [PriceComponent],
  templateUrl: './project-offers.component.html',
  styleUrl: './project-offers.component.scss',
})
export class ProjectOffersComponent {
  readonly i18n = inject(I18nService);
  readonly slug = input.required<string>();

  readonly offers = computed<ProjectOffer[]>(() => PROJECT_OFFERS[this.slug()] ?? []);
  readonly subscriptions = computed(() => this.offers().filter(o => o.kind === 'subscription'));
  readonly donation = computed(() => this.offers().find(o => o.kind === 'donation') ?? null);
  /** Première URL renseignée parmi les offres du projet (page d'achat ou de don). */
  readonly ctaUrl = computed(() => this.offers().find(o => o.url)?.url ?? null);
}
