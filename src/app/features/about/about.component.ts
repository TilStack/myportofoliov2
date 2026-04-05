import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';
import { I18nService } from '../../core/services/i18n.service';
import { PROFILE_PHOTOS, TRAVEL_PHOTOS } from '../../core/config/images.config';

interface SetupItem {
  icon: string;
  label: string;
  value: string;
  details: string;
  bgGradient: string;
}

interface ProfileImage {
  src?: string; // optional real photo (from images.config.ts)
  alt?: string; // descriptive alt text for accessibility
  bg: string;
  icon: string;
  label: string;
  isText?: boolean;
}

interface TravelImage {
  src: string;
  alt: string;
  caption: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [FadeOnScrollDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit, OnDestroy {
  readonly i18n = inject(I18nService);

  // ── travel carousel ──────────────────────────────────────
  activeImageIndex = signal(0);
  private imageSub?: Subscription;

  // Unsplash photos used as fallback when no local photo is configured
  private readonly unsplashTravel = [
    {
      src: 'https://images.unsplash.com/photo-MdNOvU9uFuo?w=900&q=80&fit=crop',
      alt: 'Cameroon highlands',
      caption: 'The highlands of Cameroon',
    },
    {
      src: 'https://images.unsplash.com/photo-oTrwlvPvpVo?w=900&q=80&fit=crop',
      alt: 'Douala street life',
      caption: 'Douala — Street Life',
    },
    {
      src: 'https://images.unsplash.com/photo-Kj7naxthK6c?w=900&q=80&fit=crop',
      alt: 'Kribi daily life',
      caption: 'Kribi, South Cameroon',
    },
  ];

  // Uses images.config.ts — falls back to Unsplash when src is empty
  travelImages: TravelImage[] = TRAVEL_PHOTOS.map((cfg, i) => ({
    src: cfg.src || this.unsplashTravel[i].src,
    alt: cfg.alt || this.unsplashTravel[i].alt,
    caption: cfg.caption || this.unsplashTravel[i].caption,
  }));

  // ── profile photo stack ───────────────────────────────────
  activeProfileIdx = signal(0);
  private profileSub?: Subscription;

  // Uses images.config.ts — src overrides the gradient/emoji placeholder when set
  profileImages: ProfileImage[] = [
    {
      src: PROFILE_PHOTOS[0].src || undefined,
      alt: PROFILE_PHOTOS[0].alt,
      bg: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)',
      icon: 'IT',
      label: PROFILE_PHOTOS[0].label,
      isText: true,
    },
    {
      src: PROFILE_PHOTOS[1].src || undefined,
      alt: PROFILE_PHOTOS[1].alt,
      bg: 'linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)',
      icon: '💻',
      label: PROFILE_PHOTOS[1].label,
    },
    {
      src: PROFILE_PHOTOS[2].src || undefined,
      alt: PROFILE_PHOTOS[2].alt,
      bg: 'linear-gradient(135deg,#11998e 0%,#38ef7d 100%)',
      icon: '🌍',
      label: PROFILE_PHOTOS[2].label,
    },
  ];

  stackPos(i: number): 'front' | 'mid' | 'back' {
    const active = this.activeProfileIdx();
    if (i === active) return 'front';
    if (i === (active + 1) % 3) return 'mid';
    return 'back';
  }

  advanceProfile(): void {
    this.activeProfileIdx.update((i) => (i + 1) % this.profileImages.length);
  }

  // ── setup items ───────────────────────────────────────────
  setupItems: SetupItem[] = [
    {
      icon: '💻',
      label: 'Laptop',
      value: 'Dell Latitude 5490 — i5-8350U · 16 GB RAM',
      details:
        'My main development machine. Runs Ubuntu/Windows dual boot for full-stack development with Angular, NestJS, Flutter, and Docker.',
      bgGradient: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)',
    },
    {
      icon: '📱',
      label: 'Phone',
      value: 'Pixel 6 - 128gb',
      details:
        'Used for mobile app testing and daily productivity. Essential for real-device Flutter testing.',
      bgGradient: 'linear-gradient(135deg,#134e5e 0%,#71b280 100%)',
    },
    {
      icon: '🎧',
      label: 'Audio',
      value: 'Oraimo headphones | JBL Flip 5 speaker',
      details:
        'My go-to for deep work sessions, video calls, and code review. Good noise isolation helps me stay in the zone.',
      bgGradient: 'linear-gradient(135deg,#373b44 0%,#4286f4 100%)',
    },
    {
      icon: '🌐',
      label: 'Browsers',
      value: 'Google Chrome & Opera',
      details:
        'Chrome for development (DevTools, extensions) and Opera for day-to-day browsing. Both synced across devices.',
      bgGradient: 'linear-gradient(135deg,#c31432 0%,#240b36 100%)',
    },
    {
      icon: '🤖',
      label: 'AI Tools',
      value: 'ChatGPT & Claude AI',
      details:
        'ChatGPT for brainstorming, debugging and code review. Gemini for quick lookups and Google integrations.',
      bgGradient: 'linear-gradient(135deg,#0f3460 0%,#533483 100%)',
    },
    {
      icon: '⚙️',
      label: 'OS',
      value: 'Ubuntu / Windows (Dual Boot)',
      details:
        'Ubuntu for development (Docker, native tools, terminal) and Windows for compatibility testing and multimedia.',
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
    if (
      (e.target as HTMLElement).classList.contains('setup-lightbox-backdrop')
    ) {
      this.closeSetupLightbox();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeSetupLightbox();
  }

  // ── involvement links ─────────────────────────────────────────
  involvementLinks = [
    {
      label: 'GitHub',
      href: 'https://github.com/tilstack',
      icon: 'github',
      descKey: 'about.involvementGithub',
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/israel-tientcheu/',
      icon: 'linkedin',
      descKey: 'about.involvementLinkedIn',
    },
    {
      label: 'Zerofiltre.tech',
      href: 'https://zerofiltre.tech',
      icon: 'zerofiltre',
      descKey: 'about.involvementZerofiltre',
    },
    {
      label: 'X / Twitter',
      href: 'https://x.com/tilstack',
      icon: 'twitter',
      descKey: 'about.involvementTwitter',
    },
  ];

  // ── other roles ───────────────────────────────────────────────
  otherRoles = [
    {
      icon: '📸',
      titleKey: 'about.rolePhotographer',
      descKey: 'about.rolePhotographerDesc',
      links: [] as { label: string; href: string }[],
    },
    {
      icon: '🎬',
      titleKey: 'about.roleVideoEditor',
      descKey: 'about.roleVideoEditorDesc',
      links: [] as { label: string; href: string }[],
    },
    {
      icon: '📱',
      titleKey: 'about.roleCommunity',
      descKey: 'about.roleCommunityDesc',
      links: [
        { label: 'TikTok', href: 'https://www.tiktok.com/@tilstack' },
        { label: 'Facebook', href: 'https://www.facebook.com/tilstack' },
      ],
    },
  ];

  // ── skills ────────────────────────────────────────────────
  skills = [
    'Figma',
    'Canva',
    'Angular',
    'TypeScript',
    'Flutter',
    'SCSS',
    'NestJS',
    'ExpressJS',
    'NodeJS',
    'PostgreSQL',
    'Git / GitHub',
    'Docker',
    'Firebase',
    'Trello',
  ];

  ngOnInit(): void {
    this.imageSub = interval(5000).subscribe(() =>
      this.activeImageIndex.update((i) => (i + 1) % this.travelImages.length),
    );
    this.profileSub = interval(4000).subscribe(() => this.advanceProfile());
  }

  ngOnDestroy(): void {
    this.imageSub?.unsubscribe();
    this.profileSub?.unsubscribe();
  }

  setImage(index: number): void {
    this.activeImageIndex.set(index);
  }
}
