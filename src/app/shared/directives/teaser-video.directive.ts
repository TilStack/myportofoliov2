import { Directive, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';

/**
 * Extrait vidéo muet d'une carte produit : joue quand il est visible à l'écran, se met en pause sinon.
 * Reste sur l'image d'aperçu (poster) si le visiteur réduit les animations ou active l'économie de données.
 */
@Directive({ selector: 'video[appTeaserVideo]', standalone: true })
export class TeaserVideoDirective implements OnDestroy {
  private readonly video = inject<ElementRef<HTMLVideoElement>>(ElementRef).nativeElement;
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
      if (saveData || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.video.muted = true; // requis pour le démarrage automatique
      this.observer = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? this.video.play().catch(() => {}) : this.video.pause()),
        { threshold: 0.5 },
      );
      this.observer.observe(this.video);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
