import { DOCUMENT } from '@angular/common';
import { Injectable, NgZone, inject } from '@angular/core';

/**
 * Révèle le damier de fond sous le curseur (voir `body::before` dans styles.scss), UNIQUEMENT sur les zones
 * vides : dès que le curseur est sur un texte, une image, une icône ou un contrôle, l'effet est coupé. Le damier
 * est de plus derrière le contenu, donc jamais par-dessus. Il s'efface après un court moment d'immobilité,
 * pour ne laisser que les taches d'ambiance. Désactivé sans souris (tactile) et avec prefers-reduced-motion.
 * N'écrit que deux variables CSS, hors de la détection de changements d'Angular.
 */
@Injectable({ providedIn: 'root' })
export class ChessSpotlightService {
  private readonly doc = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private started = false;

  /** Navigateur uniquement. Idempotent. */
  start(): void {
    const win = this.doc.defaultView;
    if (this.started || !win?.matchMedia) return;
    if (!win.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.started = true;

    const root = this.doc.documentElement;
    let frame = 0;
    let idle: ReturnType<typeof setTimeout> | undefined;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      root.style.setProperty('--mx', `${x}px`);
      root.style.setProperty('--my', `${y}px`);
      // Texte ou contenu sous le curseur OU juste autour : pas de damier. Zone vide : damier (fondu après immobilité).
      if (this.nearContent(x, y)) {
        root.classList.remove('chess-live');
        clearTimeout(idle);
      } else {
        root.classList.add('chess-live');
        clearTimeout(idle);
        idle = setTimeout(() => root.classList.remove('chess-live'), 1600);
      }
    };

    this.zone.runOutsideAngular(() => {
      this.doc.addEventListener('pointermove', (e: PointerEvent) => {
        x = e.clientX;
        y = e.clientY;
        if (!frame) frame = win.requestAnimationFrame(paint);
      }, { passive: true });

      this.doc.documentElement.addEventListener('pointerleave', () => root.classList.remove('chess-live'));
    });
  }

  /** Rayon (px) de la zone de respiration autour d'un texte ou d'un média. */
  private static readonly MARGIN = 36;

  /** `true` si le point, ou l'un des points d'un anneau autour de lui, est sur un contenu. */
  private nearContent(x: number, y: number): boolean {
    if (this.overContent(x, y)) return true;
    const r = ChessSpotlightService.MARGIN;
    for (let a = 0; a < 8; a++) {
      const t = (a * Math.PI) / 4;
      if (this.overContent(x + Math.cos(t) * r, y + Math.sin(t) * r)) return true;
    }
    return false;
  }

  /** `true` si le point (x, y) est sur un texte, un média ou un contrôle (et non sur un fond vide). */
  private overContent(x: number, y: number): boolean {
    const el = this.doc.elementFromPoint(x, y);
    if (!el) return false;
    if (el.closest('img, picture, video, canvas, svg, button, input, textarea, select, iframe')) return true;
    // Texte : un nœud texte non vide, directement dans l'élément survolé, dont une ligne contient le point.
    const range = this.doc.createRange();
    for (const node of Array.from(el.childNodes)) {
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) continue;
      range.selectNodeContents(node);
      for (const r of Array.from(range.getClientRects())) {
        if (x >= r.left - 4 && x <= r.right + 4 && y >= r.top - 2 && y <= r.bottom + 2) return true;
      }
    }
    return false;
  }
}
