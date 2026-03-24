import { Component, inject, OnInit, signal } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-intro',
  standalone: true,
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.scss',
})
export class IntroComponent implements OnInit {
  readonly i18n = inject(I18nService);

  visible  = signal(true);
  exiting  = signal(false);

  ngOnInit(): void {
    if (sessionStorage.getItem('intro-shown')) {
      this.visible.set(false);
      return;
    }
    sessionStorage.setItem('intro-shown', '1');

    // Start exit after 2.8s, remove after exit animation (900ms)
    setTimeout(() => {
      this.exiting.set(true);
      setTimeout(() => this.visible.set(false), 950);
    }, 2800);
  }
}
