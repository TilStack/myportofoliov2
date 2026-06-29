import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { Project } from '../../../core/models';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonComponent, ButtonComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent implements OnInit {
  private route          = inject(ActivatedRoute);
  private projectService = inject(ProjectService);

  project  = signal<Project | null>(null);
  loading  = signal(true);
  notFound = signal(false);
  activeImg = signal(0);

  imageOrientations = signal<Record<string, 'portrait' | 'landscape'>>({});
  lightboxSrc = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.notFound.set(true); return; }

    this.projectService.getById(id).subscribe({
      next: p => {
        this.project.set(p);
        this.loading.set(false);
        if (!p) this.notFound.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
      },
    });
  }

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
