import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { PRESENTER_POSES, PresenterPose } from './presenter.poses';

/**
 * L'avatar 3D qui « présente » une section : il se tient à côté du contenu, avec une bulle de texte.
 * La bulle porte le message.
 */
@Component({
  selector: 'app-presenter',
  standalone: true,
  imports: [NgOptimizedImage],
  template: `
    <div class="presenter">
      @if (label()) {
        <p class="presenter__bubble">{{ label() }}</p>
      }
      <div class="presenter__figure">
        <span class="presenter__glow" aria-hidden="true"></span>
        <img class="presenter__img" [ngSrc]="image().src" [width]="image().width" [height]="image().height" alt="Avatar 3D d'Israel Tientcheu (TilStack)" />
      </div>
    </div>
  `,
  styleUrl: './presenter.component.scss',
})
export class PresenterComponent {
  readonly pose = input<PresenterPose>('default');
  /** Texte de la bulle (déjà traduit). */
  readonly label = input('');
  readonly image = computed(() => PRESENTER_POSES[this.pose()]);
}
