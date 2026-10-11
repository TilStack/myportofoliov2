import { Component, computed, inject, input } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { Price, discountPercent, formatEuro, formatPrice } from '../../../data/products.data';

/**
 * Prix actuel, prix barré et réduction. Le prix barré est lisible par les lecteurs d'écran
 * (« Prix initial ») : la barre seule ne se lit pas.
 */
@Component({
  selector: 'app-price',
  standalone: true,
  template: `
    <p class="price">
      @if (price().compareAt) {
        <span class="sr-only">{{ i18n.t('shop.was') }} </span>
        <s class="price__old">{{ euro() ? formatEuro(price().compareAt!) : format(price().compareAt!) }}</s>
        <span class="sr-only"> — {{ i18n.t('shop.now') }} </span>
      }
      <strong class="price__now">{{ prefix() }}{{ euro() ? formatEuro(price().amount) : format(price().amount) }}</strong>
      @if (discount(); as pct) {
        <span class="price__badge">−{{ pct }}&nbsp;%</span>
      }
      @if (euro()) {
        <span class="price__xaf">
          @if (price().compareAt) { <s>{{ format(price().compareAt!) }}</s> }
          {{ format(price().amount) }}
        </span>
      }
    </p>
  `,
  styles: `
    .price { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.5rem 0.75rem; margin: 0; }
    .price__now { font-family: var(--font-display, 'Poppins', sans-serif); font-size: var(--price-size, 1.5rem); font-weight: 700; color: var(--color-text); }
    .price__xaf { flex-basis: 100%; color: var(--color-text-muted); font-size: 0.8125rem; }
    .price__old { color: var(--color-text-muted); font-size: 1rem; }
    .price__badge {
      padding: 0.125rem 0.5rem; border-radius: 9999px; background: rgba(34, 197, 94, 0.14); color: #166534;
      font-size: 0.75rem; font-weight: 700;
    }
  `,
})
export class PriceComponent {
  readonly i18n = inject(I18nService);
  readonly price = input.required<Price>();
  /** Texte avant le montant (« Dès » pour un minimum). */
  readonly minimum = input(false);
  /** Affiche le montant en euros (indicatif) ; le prix XAF réel reste visible en petit dessous. */
  readonly euro = input(false);

  readonly discount = computed(() => discountPercent(this.price()));
  readonly prefix = computed(() => (this.minimum() ? `${this.i18n.t('shop.from')} ` : ''));

  formatEuro(amountXaf: number): string {
    return formatEuro(amountXaf, this.i18n.lang());
  }

  format(amount: number): string {
    return formatPrice(amount, this.price().currency);
  }
}
