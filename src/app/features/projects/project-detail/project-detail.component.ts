import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map } from 'rxjs/operators';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { I18nService } from '../../../core/services/i18n.service';
import { SeoService } from '../../../core/services/seo.service';
import { VISIBLE_PROJECTS, Project } from '../../../data/projects.data';
import { SEO, projectImage, projectSeo } from '../../../data/seo.data';
import { DEFAULT_OG_IMAGE } from '../../../data/site.data';
import { absoluteUrl, projectSchema } from '../../../data/structured-data';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterModule, ButtonComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent {
  readonly i18n = inject(I18nService);
  private readonly seo = inject(SeoService);

  private readonly slug = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map(params => params.get('slug'))),
  );

  /** Résolu de façon synchrone depuis les données locales (pré-rendable). */
  readonly project = computed<Project | null>(
    () => VISIBLE_PROJECTS.find(p => p.slug === this.slug()) ?? null,
  );

  constructor() {
    // Métadonnées et JSON-LD propres au projet (les projets masqués n'atteignent jamais ce composant).
    effect(() => {
      const p = this.project();
      if (!p) {
        this.seo.apply(SEO.notFound);
        this.seo.setJsonLd([]);
        return;
      }
      this.seo.apply(projectSeo(p));
      this.seo.setJsonLd([projectSchema(p, projectImage(p) ?? absoluteUrl(DEFAULT_OG_IMAGE))]);
    });
  }

  /** Texte détaillé si présent, sinon description courte ; jamais de texte inventé. */
  readonly body = computed(() => {
    const p = this.project();
    if (!p) return '';
    const fr = this.i18n.lang() === 'fr';
    return (fr ? p.detailFr || p.descFr : p.detailEn || p.descEn)
      || p.detailEn || p.descEn;
  });

  activeImg = signal(0);

  imageOrientations = signal<Record<string, 'portrait' | 'landscape'>>({});
  lightboxSrc = signal<string | null>(null);

  setActiveImg(i: number): void {
    this.activeImg.set(i);
  }

  onImageLoad(event: Event, src: string): void {
    const img = event.target as HTMLImageElement;
    const orientation = img.naturalHeight > img.naturalWidth ? 'portrait' : 'landscape';
    this.imageOrientations.update(o => ({ ...o, [src]: orientation }));
  }

  getOrientation(src: string): string {
    return this.imageOrientations()[src] ?? 'unknown';
  }

  openLightbox(src: string): void {
    this.lightboxSrc.set(src);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxSrc.set(null);
    document.body.style.overflow = '';
  }

  onLightboxBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('img-lightbox-backdrop')) {
      this.closeLightbox();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeLightbox();
  }
}
