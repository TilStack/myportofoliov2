import { NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';
import { MONTAGE_CREDITS, MONTAGE_PHOTOS } from '../../core/config/images.config';
import { LINKEDIN_URL } from '../../data/site.data';
import { ShopSectionComponent } from '../../shared/components/shop-section/shop-section.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { TECH_LOGOS } from '../../data/skills.data';
import { FeaturedProjectsComponent } from './featured-projects/featured-projects.component';

interface HeroPose {
  src: string;
  width: number;
  height: number;
  kind: 'full' | 'bust';
  alt: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, ButtonComponent, FadeOnScrollDirective, ShopSectionComponent, IconComponent, FeaturedProjectsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  i18n = inject(I18nService);

  /**
   * Poses du personnage (héros). La première est l'élément LCP de l'accueil (priority). Pour ajouter une pose :
   * déposer l'image (fond transparent) dans public/hero/ et l'ajouter ici — `kind: 'full'` pour un personnage en
   * pied (comme l'avatar 3D, 336 × 900), `kind: 'bust'` pour un buste (le dessin).
   */
  readonly poses: HeroPose[] = [
    { src: 'hero/avatar-3d.webp', width: 336, height: 900, kind: 'full', alt: 'Israel Tientcheu — avatar 3D, développeur Full-Stack et créateur de TilStack' },
    { src: 'images/splash/avatar-illustre.webp', width: 626, height: 640, kind: 'bust', alt: 'Israel Tientcheu — portrait dessiné' },
  ];
  /** Pose affichée. */
  readonly pose = signal(0);
  private lastPointer = 'mouse';

  /** Bandeau des technologies sous le héros : logos réels (public/images/tech). */
  readonly stack = ['Flutter', 'Angular', 'TypeScript', 'Dart', 'FastAPI', 'Python', 'NestJS', 'Firebase', 'Docker', 'Claude']
    .map(name => ({ name, file: TECH_LOGOS[name].file, color: TECH_LOGOS[name].color }));

  readonly linkedinUrl = LINKEDIN_URL;
  readonly montagePhotos = MONTAGE_PHOTOS;
  readonly montageCredits = MONTAGE_CREDITS;
  /** `true` seulement si toutes les photos du montage sont des fichiers locaux (pas de placeholder Unsplash). */
  readonly montagePhotosAreLocal = MONTAGE_PHOTOS.every(p => !!p.file);
  /**
   * Citation mise en avant sur l'accueil (texte donné par Israel). TODO(israel): si elle doit aussi figurer sur
   * /quotes, l'ajouter à QUOTES avec sa date et son explication.
   */
  readonly featuredQuote = {
    text: "Être l'exception parmi les exceptions afin d'être exceptionnellement exceptionnel.",
    author: 'Israel Tientcheu',
  };
  /** Passe à la pose suivante. */
  nextPose(): void {
    this.pose.update(i => (i + 1) % this.poses.length);
  }

  /** Souris : le survol change la pose. Tactile / stylet : le tap (voir `onPoseClick`). */
  onPoseEnter(e: PointerEvent): void {
    this.lastPointer = e.pointerType;
    if (e.pointerType === 'mouse') this.nextPose();
  }

  onPoseDown(e: PointerEvent): void {
    this.lastPointer = e.pointerType;
  }

  /** Tap (tactile) ou clavier (Entrée / Espace : `detail === 0`) ; le clic souris est déjà traité par le survol. */
  onPoseClick(e: MouseEvent): void {
    if (e.detail === 0 || this.lastPointer !== 'mouse') this.nextPose();
  }

  downloadCV(): void {
    const a = document.createElement('a');
    a.href     = 'TilStack_CV.pdf';
    a.download = 'TilStack_CV.pdf';
    a.click();
  }
}
