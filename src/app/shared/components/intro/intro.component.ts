import { Component, afterNextRender, inject, signal } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-intro',
  standalone: true,
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.scss',
})
export class IntroComponent {
  readonly i18n = inject(I18nService);

  // Absent du HTML pré-rendu ; affiché seulement dans le navigateur, une fois par session.
  visible  = signal(false);
  exiting  = signal(false);

  constructor() {
    afterNextRender(() => {
      if (sessionStorage.getItem('intro-shown')) return;
      sessionStorage.setItem('intro-shown', '1');
      this.visible.set(true);

      // Start exit after 2.8s, remove after exit animation (900ms)
      setTimeout(() => {
        this.exiting.set(true);
        setTimeout(() => this.visible.set(false), 950);
      }, 2800);
    });
  }
}
