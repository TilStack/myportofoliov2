import { Component, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';

interface SetupItem {
  icon: string;
  label: string;
  value: string;
  details: string;
  bgGradient: string;
}

interface ProfileImage {
  bg: string;
  icon: string;
  label: string;
  isText?: boolean;
}

interface TravelImage { src: string; alt: string; caption: string; }

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, FadeOnScrollDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit, OnDestroy {
  // ── travel carousel ──────────────────────────────────────
  activeImageIndex = signal(0);
  private imageSub?: Subscription;

  travelImages: TravelImage[] = [
    { src: 'images/cameroon-1.jpg', alt: 'Cameroon landscape', caption: 'The highlands of Cameroon' },
    { src: 'images/cameroon-2.jpg', alt: 'Douala at night',    caption: 'Douala by night'            },
    { src: 'images/cameroon-3.jpg', alt: 'Local culture',      caption: 'Rich local culture'          },
  ];

  // ── profile photo stack ───────────────────────────────────
  activeProfileIdx = signal(0);
  private profileSub?: Subscription;

  profileImages: ProfileImage[] = [
    { bg: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)',          icon: 'IT',  label: 'Israel T.',    isText: true },
    { bg: 'linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)', icon: '💻', label: 'Full-Stack Dev' },
    { bg: 'linear-gradient(135deg,#11998e 0%,#38ef7d 100%)',          icon: '🌍', label: 'Explorer'       },
  ];

  stackPos(i: number): 'front' | 'mid' | 'back' {
    const active = this.activeProfileIdx();
    if (i === active)                     return 'front';
    if (i === (active + 1) % 3)           return 'mid';
    return 'back';
  }

  advanceProfile(): void {
    this.activeProfileIdx.update(i => (i + 1) % this.profileImages.length);
  }

  // ── setup items ───────────────────────────────────────────
  setupItems: SetupItem[] = [
    {
      icon: '💻', label: 'Laptop', value: 'Dell Latitude 5490 — i5-8350U · 16 GB RAM',
      details: 'My main development machine. Runs Ubuntu/Windows dual boot for full-stack development with Angular, NestJS, Flutter, and Docker.',
      bgGradient: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)',
    },
    {
      icon: '📱', label: 'Phone', value: 'Tecno Camon 16 S — Android 10 · 128 GB',
      details: 'Used for mobile app testing and daily productivity. Essential for real-device Flutter testing.',
      bgGradient: 'linear-gradient(135deg,#134e5e 0%,#71b280 100%)',
    },
    {
      icon: '🎧', label: 'Audio', value: 'Oraimo headphones',
      details: 'My go-to for deep work sessions, video calls, and code review. Good noise isolation helps me stay in the zone.',
      bgGradient: 'linear-gradient(135deg,#373b44 0%,#4286f4 100%)',
    },
    {
      icon: '🌐', label: 'Browsers', value: 'Google Chrome & Opera',
      details: 'Chrome for development (DevTools, extensions) and Opera for day-to-day browsing. Both synced across devices.',
      bgGradient: 'linear-gradient(135deg,#c31432 0%,#240b36 100%)',
    },
    {
      icon: '🤖', label: 'AI Tools', value: 'ChatGPT & Gemini',
      details: 'ChatGPT for brainstorming, debugging and code review. Gemini for quick lookups and Google integrations.',
      bgGradient: 'linear-gradient(135deg,#0f3460 0%,#533483 100%)',
    },
    {
      icon: '⚙️', label: 'OS', value: 'Ubuntu / Windows (Dual Boot)',
      details: 'Ubuntu for development (Docker, native tools, terminal) and Windows for compatibility testing and multimedia.',
      bgGradient: 'linear-gradient(135deg,#11998e 0%,#38ef7d 100%)',
    },
  ];

  // ── setup lightbox ────────────────────────────────────────
  setupLightbox = signal<SetupItem | null>(null);

  openSetupLightbox(item: SetupItem): void {
    this.setupLightbox.set(item);
    document.body.style.overflow = 'hidden';
  }

  closeSetupLightbox(): void {
    this.setupLightbox.set(null);
    document.body.style.overflow = '';
  }

  onSetupBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('setup-lightbox-backdrop')) {
      this.closeSetupLightbox();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.closeSetupLightbox(); }

  // ── skills ────────────────────────────────────────────────
  skills = [
    'Figma', 'Canva',
    'Angular', 'TypeScript', 'Flutter', 'SCSS',
    'NestJS', 'ExpressJS', 'NodeJS', 'PostgreSQL',
    'Git / GitHub', 'Docker', 'Firebase', 'Trello',
  ];

  ngOnInit(): void {
    this.imageSub  = interval(5000).subscribe(() =>
      this.activeImageIndex.update(i => (i + 1) % this.travelImages.length)
    );
    this.profileSub = interval(4000).subscribe(() => this.advanceProfile());
  }

  ngOnDestroy(): void {
    this.imageSub?.unsubscribe();
    this.profileSub?.unsubscribe();
  }

  setImage(index: number): void { this.activeImageIndex.set(index); }
}
