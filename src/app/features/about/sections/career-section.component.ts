import { Component, inject } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { EDUCATION, EXPERIENCE, LANGUAGES } from '../../../data/career.data';

/** Parcours : expériences, formations, langues (données : career.data.ts). */
@Component({
  selector: 'app-career-section',
  standalone: true,
  templateUrl: './career-section.component.html',
  styleUrl: './career-section.component.scss',
})
export class CareerSectionComponent {
  readonly i18n = inject(I18nService);
  readonly experience = EXPERIENCE;
  readonly education = EDUCATION;
  readonly languages = LANGUAGES;

  /** Texte dans la langue courante. */
  tr(text: { fr: string; en: string }): string {
    return text[this.i18n.lang()];
  }
}
