import { Component, inject } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';
import { VISIBLE_PROJECTS } from '../../data/projects.data';
import { ShopSectionComponent } from '../../shared/components/shop-section/shop-section.component';

/** /boutique : les produits digitaux (données : products.data.ts). SEO et JSON-LD Product : app.routes.ts. */
@Component({
  selector: 'app-boutique',
  standalone: true,
  imports: [ShopSectionComponent],
  templateUrl: './boutique.component.html',
  styleUrl: './boutique.component.scss',
})
export class BoutiqueComponent {
  readonly i18n = inject(I18nService);
  /** Application Otadex : lien et QR code vers le Play Store (données du projet). */
  readonly app = VISIBLE_PROJECTS.find(p => p.slug === 'otadex' && p.playStoreUrl && p.playStoreQr);
}
