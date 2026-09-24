import { NgOptimizedImage } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';
import { I18nService } from '../../core/services/i18n.service';
import { Contributor, VISIBLE_PROJECTS, Project } from '../../data/projects.data';
import { responsiveImage } from '../../shared/utils/responsive-image';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, FadeOnScrollDirective],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  readonly image = responsiveImage;

  readonly i18n = inject(I18nService);
  readonly projects = VISIBLE_PROJECTS;

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
