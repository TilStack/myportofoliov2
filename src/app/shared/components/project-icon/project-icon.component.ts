import { Component, input } from '@angular/core';

/**
 * Icônes de projets « croquis » : traits arrondis légèrement tremblés (filtre feTurbulence discret)
 * et une tache de marqueur jaune décalée, comme un dessin au feutre. Remplace les emojis, jugés trop
 * « génériques ». Décoratif (`aria-hidden`) : le nom du projet est toujours écrit à côté.
 * Slug inconnu : l'emoji de repli du projet est affiché.
 */
let nextId = 0;

@Component({
  selector: 'app-project-icon',
  standalone: true,
  template: `
    <svg
      class="sketch"
      viewBox="0 0 48 48"
      [attr.width]="size()"
      [attr.height]="size()"
      fill="none"
      stroke="currentColor"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter [attr.id]="filterId" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
        </filter>
      </defs>
      @switch (slug()) {
        @case ('dofa') {
          <!-- voiture, vue de côté -->
          <path class="marker" d="M9 30c1-6 4-9 9-10l6-.5c4.5.2 7.5 3 10 8l2 3-2 5H10z" />
          <g [attr.filter]="filterRef">
            <path d="M6 33l2-7c.6-2 2-3.2 4-3.6L18 21l4-5.5c.8-1 1.8-1.5 3-1.5h6c1.4 0 2.6.7 3.4 1.8L38 22l4 1.5c1.4.6 2.2 1.8 2.2 3.3V33c0 .8-.6 1.4-1.4 1.4H40" />
            <path d="M6 33v1.4c0 .6.4 1 1 1h3" />
            <path d="M16 35h16" />
            <path d="M20.5 21.5l3-5h6l2.5 5z" />
            <circle cx="14" cy="35.5" r="4" />
            <circle cx="35" cy="35.5" r="4" />
          </g>
        }
        @case ('devpea-website') {
          <!-- fenêtre de navigateur -->
          <path class="marker" d="M8 16h31v22H8z" />
          <g [attr.filter]="filterRef">
            <rect x="6" y="10" width="36" height="28" rx="3" />
            <path d="M6 18h36" />
            <path d="M11 14h.1M15 14h.1M19 14h.1" stroke-width="3" />
            <path d="M24 22a7 7 0 1 0 .1 0" />
            <path d="M17 29h14M24 22c-3 2.5-3 9 0 12M24 22c3 2.5 3 9 0 12" />
          </g>
        }
        @case ('levefly') {
          <!-- avion en papier -->
          <path class="marker" d="M9 25l30-14-9 26-7-8z" />
          <g [attr.filter]="filterRef">
            <path d="M7 24L41 9 31 39l-8-9z" />
            <path d="M41 9L23 30" />
            <path d="M23 30v8l5-6" />
            <path d="M5 33c3 1 6 0 8-2M3 39c2 .5 4 0 5.5-1" stroke-width="1.8" />
          </g>
        }
        @case ('mycagnotte') {
          <!-- tirelire -->
          <path class="marker" d="M9 27c0-6 5-10 12-10h6c6 0 11 4 11 10s-4 10-9 10H19c-6 0-10-4-10-10z" />
          <g [attr.filter]="filterRef">
            <path d="M8 27c0-6.5 5.5-11 13-11h7c4 0 7.5 1.5 9.5 4l4-1-1 6 2 2v5l-4 1c-1.5 3-4 5-7.5 5.5V41h-5v-3h-8v3h-5v-5C11 34 8 31 8 27z" />
            <path d="M22 11.5h6" />
            <path d="M25 11.5V8" />
            <circle cx="35" cy="26" r="1" fill="currentColor" />
            <path d="M18 22c2-1 5-1 7 0" />
          </g>
        }
        @case ('otadex') {
          <!-- livre ouvert + étoile : l'encyclopédie -->
          <path class="marker" d="M9 14c5-1 10-.5 15 3 5-3.5 10-4 15-3v22c-5-1-10-.5-15 3-5-3.5-10-4-15-3z" />
          <g [attr.filter]="filterRef">
            <path d="M24 17c-5-3.5-11-4.5-17-3.500V37c6-1 12 0 17 3.5 5-3.5 11-4.5 17-3.500V13.500C35 12.5 29 13.5 24 17z" />
            <path d="M24 17v23.5" />
            <path d="M31 21l1.200 2.600 2.800.4-2 2 .5 2.800-2.5-1.300-2.5 1.300.5-2.800-2-2 2.800-.4z" stroke-width="1.7" />
          </g>
        }
        @case ('mypokemon') {
          <!-- balle -->
          <path class="marker" d="M10 22a15 15 0 0 1 28 0z" />
          <g [attr.filter]="filterRef">
            <circle cx="24" cy="24" r="16.5" />
            <path d="M7.5 24h9.500M31 24h9.5" />
            <circle cx="24" cy="24" r="6.5" />
            <circle cx="24" cy="24" r="2" fill="currentColor" />
          </g>
        }
        @case ('nuvel') {
          <!-- bulles de conversation + croix : réseau chrétien -->
          <path class="marker" d="M8 12h24v17H18l-7 6v-6H8z" />
          <g [attr.filter]="filterRef">
            <path d="M6 9.500h26a2 2 0 0 1 2 2V27a2 2 0 0 1-2 2H19l-7 6v-6H6a2 2 0 0 1-2-2V11.500a2 2 0 0 1 2-2z" />
            <path d="M19 13v11M14 17.500h10" />
            <path d="M37 18h3.500a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H39v5l-6-5H22a2 2 0 0 1-2-2v-1.5" />
          </g>
        }
        @default {
          <text x="24" y="31" text-anchor="middle" font-size="22" stroke="none" fill="currentColor">{{ fallback() }}</text>
        }
      }
    </svg>
  `,
  styles: `
    :host { display: inline-flex; line-height: 0; }
    .marker { fill: var(--sketch-marker, #ffde59); stroke: none; opacity: 0.85; }
  `,
})
export class ProjectIconComponent {
  /** Id unique par instance : le filtre est défini dans chaque SVG, sans doublon d'id dans la page. */
  readonly filterId = `sketch-wobble-${nextId++}`;
  readonly filterRef = `url(#${this.filterId})`;

  readonly slug = input.required<string>();
  /** Emoji de repli si le slug n'a pas de croquis. */
  readonly fallback = input('•');
  readonly size = input(34);
}
