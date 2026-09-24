import { Component, computed, inject } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { PRODUCTS } from '../../../data/products.data';
import { INTERVENTIONS, TEACHING } from '../../../data/teaching.data';

/**
 * Enseignement & Formations (CEFTI, Prof 2.0) et liste d'interventions. La liste est vide tant qu'aucune
 * intervention réelle n'est renseignée dans teaching.data.ts : le bloc est alors totalement masqué.
 */
@Component({
  selector: 'app-teaching-section',
  standalone: true,
  templateUrl: './teaching-section.component.html',
  styleUrl: './teaching-section.component.scss',
})
export class TeachingSectionComponent {
  readonly i18n = inject(I18nService);
  readonly teaching = TEACHING;
  readonly interventions = INTERVENTIONS;
  readonly courseUrl = computed(() => PRODUCTS.find(p => p.id === TEACHING.createdCourse.productId)?.url ?? null);

  tr(text: { fr: string; en: string }): string {
    return text[this.i18n.lang()];
  }
}
