import { Injectable } from '@angular/core';

/**
 * Uses IntersectionObserver to add `.visible` to elements
 * with class `.fade-up`, `.fade-left`, `.fade-right`.
 * Call `init()` once after each page navigation.
 */
@Injectable({ providedIn: 'root' })
export class ScrollAnimationService {
  private observer: IntersectionObserver | null = null;

  init(): void {
    this.destroy();

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document
      .querySelectorAll('.fade-up, .fade-left, .fade-right')
      .forEach(el => this.observer!.observe(el));
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
