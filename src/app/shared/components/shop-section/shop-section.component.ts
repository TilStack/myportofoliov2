import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';
import { PRODUCTS } from '../../../data/products.data';
import { STORE_URL } from '../../../data/site.data';
import { PriceComponent } from '../price/price.component';

/**
 * Produits digitaux (boutique Chariow) : nom, description, prix actuel, prix barré et CTA vers l'URL du produit.
 * Même composant sur l'accueil (avec lien vers /boutique) et sur /boutique.
 */
@Component({
  selector: 'app-shop-section',
  standalone: true,
  imports: [RouterLink, PriceComponent],
  templateUrl: './shop-section.component.html',
  styleUrl: './shop-section.component.scss',
})
export class ShopSectionComponent {
  readonly i18n = inject(I18nService);
  readonly products = PRODUCTS;
  readonly storeUrl = STORE_URL;
  /** Sur l'accueil : titre en h2 et lien « Voir la boutique ». Sur /boutique la page porte déjà le h1. */
  readonly showHeader = input(true);
  readonly showAllLink = input(false);
}
