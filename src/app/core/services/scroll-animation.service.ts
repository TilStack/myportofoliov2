import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

/**
 * Uses IntersectionObserver to add `.visible` to elements
 * with class `.fade-up`, `.fade-left`, `.fade-right`.
 * Call `init()` once after each page navigation (navigateur uniquement).
 */
@Injectable({ providedIn: 'root' })
export class ScrollAnimationService {
  private readonly document  = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private observer: IntersectionObserver | null = null;

  init(): void {
    if (!this.isBrowser) return;
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

    this.document
      .querySelectorAll('.fade-up, .fade-left, .fade-right')
      .forEach(el => this.observer!.observe(el));
  }

  /**
   * Marque `.visible` les éléments déjà dans la fenêtre. Appelé une seule fois au démarrage, juste avant
   * que `js-anim` ne masque les éléments à révéler : le contenu du premier écran (donc le LCP) ne passe
   * jamais par un état `opacity: 0` en attente de JavaScript.
   */
  revealInViewport(): void {
    if (!this.isBrowser) return;
    const height = this.document.defaultView?.innerHeight ?? 0;
    this.document.querySelectorAll('.fade-up, .fade-left, .fade-right').forEach(el => {
      const { top, bottom } = el.getBoundingClientRect();
      if (top < height && bottom > 0) el.classList.add('visible');
    });
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
