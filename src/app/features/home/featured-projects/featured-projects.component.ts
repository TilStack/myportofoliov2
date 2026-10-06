import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';
import { FEATURED_PROJECTS, STATUS_KEY } from '../../../data/projects.data';
import { responsiveImage } from '../../../shared/utils/responsive-image';

/**
 * Projets phares, juste après le hero : la première chose qu'un visiteur développeur veut voir.
 * Projets marqués `featured: true` dans projects.data.ts (Dofa, Otadex, Séla Cantique).
 */
@Component({
  selector: 'app-featured-projects',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './featured-projects.component.html',
  styleUrl: './featured-projects.component.scss',
})
export class FeaturedProjectsComponent {
  readonly i18n = inject(I18nService);
  readonly projects = FEATURED_PROJECTS;
  readonly statusKey = STATUS_KEY;
  readonly image = responsiveImage;
}
