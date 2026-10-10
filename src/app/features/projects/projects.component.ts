import { NgOptimizedImage } from '@angular/common';
import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';
import { I18nService } from '../../core/services/i18n.service';
import { CATEGORY_KEYS, Contributor, STATUS_KEY, VISIBLE_PROJECTS, Project, ProjectCategory } from '../../data/projects.data';
import { ProjectIconComponent } from '../../shared/components/project-icon/project-icon.component';
import { responsiveImage } from '../../shared/utils/responsive-image';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, FadeOnScrollDirective, ProjectIconComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  readonly image = responsiveImage;

  readonly i18n = inject(I18nService);
  readonly statusKey = STATUS_KEY;
  readonly projects = VISIBLE_PROJECTS;

  /** Filtre actif : toutes les catégories ou une seule. */
  readonly filter = signal<'all' | ProjectCategory>('all');
  readonly categoryKeys = CATEGORY_KEYS;

  /** Catégories qui contiennent au moins un projet, dans l'ordre d'affichage, avec leurs projets. */
  readonly groups = computed(() =>
    (Object.keys(CATEGORY_KEYS) as ProjectCategory[])
      .map((cat) => ({ cat, items: this.projects.filter((p) => p.category === cat) }))
      .filter((g) => g.items.length > 0),
  );

  /** Groupes affichés selon le filtre. */
  readonly visibleGroups = computed(() => {
    const f = this.filter();
    return f === 'all' ? this.groups() : this.groups().filter((g) => g.cat === f);
  });

  selected = signal<Project | null>(null);

  activeGalleryIdx = signal(0);

  setGalleryIdx(i: number): void {
    this.activeGalleryIdx.set(i);
  }

  openModal(p: Project): void {
    this.selected.set(p);
    this.activeGalleryIdx.set(0);
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.selected.set(null);
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeModal();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('pmodal__backdrop')) {
      this.closeModal();
    }
  }

  /** Inclinaison légère et déterministe (identique au rendu serveur) : cartes « posées » à la main. */
  tilt(i: number): string {
    return ['-1.1deg', '0.8deg', '-0.6deg', '1deg', '-0.9deg', '0.6deg'][i % 6];
  }

  /** « Depuis mars 2024 » à partir de `startedAt` (AAAA-MM) ; chaîne vide si la date est inconnue. */
  since(p: Project): string {
    if (!p.startedAt) return '';
    const [y, m] = p.startedAt.split('-').map(Number);
    if (!y || !m) return '';
    const lang = this.i18n.lang();
    const month = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
      month: 'long', year: 'numeric', timeZone: 'UTC',
    });
    return `${this.i18n.t('projects.since')} ${month}`;
  }

  desc(p: Project): string {
    return this.i18n.lang() === 'fr' ? p.descFr : p.descEn;
  }

  detail(p: Project): string {
    return this.i18n.lang() === 'fr' ? p.detailFr : p.detailEn;
  }

  role(c: Contributor): string {
    return this.i18n.lang() === 'fr' ? c.roleFr : c.roleEn;
  }
}
