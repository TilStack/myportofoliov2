import { Injectable, afterNextRender, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'portfolio-theme';

/**
 * Le thème initial est appliqué avant le premier rendu par le script inline de
 * `index.html` (pas de flash). Ce service n'agit que dans le navigateur, après
 * le rendu : côté serveur le signal reste sur 'light' et rien n'est touché.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly theme = signal<Theme>('light');
  private ready = false;

  constructor() {
    afterNextRender(() => {
      this.theme.set(this.getInitialTheme());
      this.ready = true;
    });

    // Persist & apply whenever theme changes (after the initial theme is read)
    effect(() => {
      const t = this.theme();
      if (!this.ready) return;
      this.document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem(STORAGE_KEY, t);
    });
  }

  toggle(): void {
    this.theme.update(t => (t === 'light' ? 'dark' : 'light'));
  }

  isDark(): boolean {
    return this.theme() === 'dark';
  }

  private getInitialTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return this.document.defaultView!.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
