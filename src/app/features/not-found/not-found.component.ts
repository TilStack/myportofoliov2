import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';

/**
 * Route `**` : pré-rendue en 404.html, que Firebase Hosting sert avec un statut 404.
 * Les métadonnées (noindex) viennent de SEO.notFound via les données de route.
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  readonly i18n = inject(I18nService);
}
