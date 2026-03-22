import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `<div class="skeleton" [style.width]="width" [style.height]="height" [style.border-radius]="radius"></div>`,
  styles: [`
    .skeleton {
      background: linear-gradient(
        90deg,
        var(--color-surface) 25%,
        var(--color-border) 50%,
        var(--color-surface) 75%
      );
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.4s ease-in-out infinite;
      border-radius: 0.5rem;
    }
    @keyframes skeleton-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class SkeletonComponent {
  @Input() width  = '100%';
  @Input() height = '1rem';
  @Input() radius = '0.5rem';
}
