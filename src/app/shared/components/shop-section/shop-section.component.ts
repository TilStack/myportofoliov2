import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';
import { DigitalProduct, PRODUCTS } from '../../../data/products.data';
import { STORE_URL } from '../../../data/site.data';
import { PriceComponent } from '../price/price.component';
import { TeaserVideoDirective } from '../../directives/teaser-video.directive';

/**
 * Produits digitaux (boutique Chariow) : nom, description, prix actuel, prix barré et CTA vers l'URL du produit.
 * Même composant sur l'accueil (avec lien vers /boutique) et sur /boutique.
 */
@Component({
  selector: 'app-shop-section',
  standalone: true,
  imports: [RouterLink, PriceComponent, TeaserVideoDirective],
  templateUrl: './shop-section.component.html',
  styleUrl: './shop-section.component.scss',
})
export class ShopSectionComponent {
  readonly i18n = inject(I18nService);
  /** Limite la liste à certaines natures de produit (catégories de /boutique) ; sans valeur : tous les produits. */
  readonly kinds = input<DigitalProduct['kind'][] | null>(null);
  /** Titre de catégorie visible (h2) à la place du titre masqué ; resserre aussi l'espacement vertical. */
  readonly categoryTitle = input<string | null>(null);
  /** Id du titre : unique par catégorie (plusieurs sections sur /boutique). */
  readonly titleId = computed(() => 'shop-title' + (this.kinds() ? '-' + this.kinds()!.join('-') : ''));
  readonly products = computed(() => {
    const k = this.kinds();
    return k ? PRODUCTS.filter(p => k.includes(p.kind)) : PRODUCTS;
  });
  readonly storeUrl = STORE_URL;
  /** Sur l'accueil : titre en h2 et lien « Voir la boutique ». Sur /boutique la page porte déjà le h1. */
  readonly showHeader = input(true);
  readonly showAllLink = input(false);
  /** Prix affichés en euros (indicatif, avec le prix XAF réel dessous). */
  readonly euro = input(false);
  /** Version réduite (accueil) : sans sous-titre, sans vidéo d'aperçu ni description — nom, prix et lien seulement. */
  readonly compact = input(false);
}
