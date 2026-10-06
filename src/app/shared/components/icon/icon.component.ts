import { Component, input } from '@angular/core';

/**
 * Jeu d'icônes SVG au trait (style Feather), pour remplacer les emojis utilisés comme icônes
 * (My Stack, Tools & Gear, Other Hats). `viewBox="0 0 24 24"`, `stroke="currentColor"`, décoratif
 * (`aria-hidden`) : le texte utile est toujours doublé à côté, jamais porté par l'icône seule.
 */
export type IconName =
  | 'mobile' | 'web' | 'backend' | 'database' | 'devops' | 'ai'
  | 'laptop' | 'audio' | 'camera' | 'video' | 'megaphone' | 'quote';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class="app-icon"
    >
      @switch (name()) {
        @case ('mobile') {
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <line x1="11" y1="18" x2="13" y2="18" />
        }
        @case ('web') {
          <circle cx="12" cy="12" r="9" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
        }
        @case ('backend') {
          <rect x="3" y="4" width="18" height="7" rx="1.5" />
          <rect x="3" y="13" width="18" height="7" rx="1.5" />
          <line x1="7" y1="7.5" x2="7.01" y2="7.5" />
          <line x1="7" y1="16.5" x2="7.01" y2="16.5" />
        }
        @case ('database') {
          <ellipse cx="12" cy="5.5" rx="8" ry="3" />
          <path d="M4 5.5v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
          <path d="M4 11.5v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
        }
        @case ('devops') {
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.1-3.1a5 5 0 0 1-6.6 6.6L5.4 21.5a2 2 0 0 1-2.9-2.9L11.2 9.9a5 5 0 0 1 6.6-6.6l-3.1 3z" />
        }
        @case ('ai') {
          <rect x="4" y="8" width="16" height="11" rx="2" />
          <path d="M12 8V4" />
          <circle cx="12" cy="3" r="1" />
          <line x1="9" y1="13" x2="9.01" y2="13" />
          <line x1="15" y1="13" x2="15.01" y2="13" />
          <path d="M9 17h6" />
        }
        @case ('laptop') {
          <rect x="3" y="4" width="18" height="12" rx="1.5" />
          <path d="M2 19h20" />
        }
        @case ('audio') {
          <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
          <rect x="2" y="14" width="5" height="7" rx="1.5" />
          <rect x="17" y="14" width="5" height="7" rx="1.5" />
        }
        @case ('camera') {
          <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
          <circle cx="12" cy="14" r="3.5" />
        }
        @case ('video') {
          <rect x="2" y="5" width="14" height="14" rx="1.5" />
          <path d="M16 10l6-3v10l-6-3" />
        }
        @case ('megaphone') {
          <path d="M3 10v4a1 1 0 0 0 1 1h2l10 4V5L6 9H4a1 1 0 0 0-1 1z" />
          <path d="M17 9a4 4 0 0 1 0 6" />
        }
        @case ('quote') {
          <path
            fill="currentColor" stroke="none"
            d="M7.17 17c-.98 0-1.79-.33-2.43-1-.64-.67-.96-1.52-.96-2.56 0-1.1.3-2.22.9-3.36.62-1.16 1.5-2.2 2.63-3.13l1.7 1.44c-.74.68-1.3 1.33-1.68 1.96-.37.6-.6 1.2-.68 1.8.1-.03.25-.04.45-.04.85 0 1.56.28 2.12.85.57.56.86 1.28.86 2.15 0 .9-.3 1.65-.9 2.24-.6.6-1.33.9-2.21.9zm9 0c-.98 0-1.79-.33-2.43-1-.64-.67-.96-1.52-.96-2.56 0-1.1.3-2.22.9-3.36.62-1.16 1.5-2.2 2.63-3.13l1.7 1.44c-.74.68-1.3 1.33-1.68 1.96-.37.6-.6 1.2-.68 1.8.1-.03.25-.04.45-.04.85 0 1.56.28 2.12.85.57.56.86 1.28.86 2.15 0 .9-.3 1.65-.9 2.24-.6.6-1.33.9-2.21.9z"
          />
        }
      }
    </svg>
  `,
  styles: `
    :host { display: inline-flex; }
    .app-icon { display: block; }
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(20);
}
