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
    const inView = (el: Element) => {
      const { top, bottom } = el.getBoundingClientRect();
      return top < height && bottom > 0;
    };
    // Une section `content-visibility: auto` hors écran garde son contenu « sauté » : interroger un de ses
    // descendants forcerait sa mise en page (≈100 ms sur À propos). On ne teste donc que la section elle-même.
    const containers = new Map<Element, boolean>();
    this.document.querySelectorAll('.fade-up, .fade-left, .fade-right').forEach(el => {
      const container = el.closest('.cv-auto');
      if (container) {
        if (!containers.has(container)) containers.set(container, inView(container));
        if (!containers.get(container)) return;
      }
      if (inView(el)) el.classList.add('visible');
    });
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
