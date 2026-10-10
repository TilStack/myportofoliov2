import {
  Component,
  HostListener,
  PLATFORM_ID,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';
import { I18nService } from '../../core/services/i18n.service';
import { PROFILE_PHOTOS, TRAVEL_PHOTOS } from '../../core/config/images.config';
import { DEVPEA_URL, GITHUB_URL, LINKEDIN_URL, TWITTER_URL } from '../../data/site.data';
import { responsiveImage } from '../../shared/utils/responsive-image';
import { MULTIMEDIA_SKILLS, SKILL_LAYERS, TECH_LOGOS } from '../../data/skills.data';
import { CareerSectionComponent } from './sections/career-section.component';
import { TeachingSectionComponent } from './sections/teaching-section.component';
import { IconComponent, IconName } from '../../shared/components/icon/icon.component';

interface Bilingual { fr: string; en: string; }

interface SetupItem {
  icon: IconName;
  label: Bilingual;
  value: Bilingual;
  details: Bilingual;
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
  imports: [FadeOnScrollDirective, NgOptimizedImage, CareerSectionComponent, TeachingSectionComponent, IconComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit, OnDestroy {
  readonly i18n = inject(I18nService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // ── travel carousel ──────────────────────────────────────
  activeImageIndex = signal(0);
  private imageSub?: Subscription;

  // Unsplash photos used as fallback when no local photo is configured
  private readonly unsplashTravel = [
    {
      src: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=900&q=80&fit=crop', // même photo que « Buea » sur l'accueil (montage)
      alt: 'Cameroon highlands',
      caption: 'The highlands of Cameroon',
    },
    {
      src: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=900&q=80&fit=crop', // même photo que « Douala » sur l'accueil (montage)
      alt: 'Douala street life',
      caption: 'Douala — Street Life',
    },
    {
      src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80&fit=crop', // même photo que « Kribi » sur l'accueil (montage)
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
      icon: 'laptop',
      label: { fr: 'Ordinateur', en: 'Laptop' },
      value: { fr: 'Dell Latitude 5490 — i5-8350U · 16 Go de RAM', en: 'Dell Latitude 5490 — i5-8350U · 16 GB RAM' },
      details: {
        fr: 'Ma machine de développement principale. Double démarrage Ubuntu/Windows pour le développement full-stack avec Flutter, Angular, FastAPI et Docker.',
        en: 'My main development machine. Runs Ubuntu/Windows dual boot for full-stack development with Flutter, Angular, FastAPI, and Docker.',
      },
      bgGradient: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)',
    },
    {
      icon: 'mobile',
      label: { fr: 'Téléphone', en: 'Phone' },
      value: { fr: 'Pixel 6 — 128 Go', en: 'Pixel 6 — 128 GB' },
      details: {
        fr: 'Utilisé pour tester les applications mobiles et au quotidien. Indispensable pour les tests Flutter sur appareil réel.',
        en: 'Used for mobile app testing and daily productivity. Essential for real-device Flutter testing.',
      },
      bgGradient: 'linear-gradient(135deg,#134e5e 0%,#71b280 100%)',
    },
    {
      icon: 'audio',
      label: { fr: 'Audio', en: 'Audio' },
      value: { fr: 'Écouteurs Oraimo | Enceinte JBL Flip 5', en: 'Oraimo headphones | JBL Flip 5 speaker' },
      details: {
        fr: 'Mon allié pour les sessions de concentration, les appels et les revues de code. Une bonne isolation phonique pour rester dans la zone.',
        en: 'My go-to for deep work sessions, video calls, and code review. Good noise isolation helps me stay in the zone.',
      },
      bgGradient: 'linear-gradient(135deg,#373b44 0%,#4286f4 100%)',
    },
    {
      icon: 'web',
      label: { fr: 'Navigateurs', en: 'Browsers' },
      value: { fr: 'Google Chrome & Opera', en: 'Google Chrome & Opera' },
      details: {
        fr: 'Chrome pour le développement (DevTools, extensions) et Opera pour la navigation quotidienne. Synchronisés entre mes appareils.',
        en: 'Chrome for development (DevTools, extensions) and Opera for day-to-day browsing. Both synced across devices.',
      },
      bgGradient: 'linear-gradient(135deg,#c31432 0%,#240b36 100%)',
    },
    {
      icon: 'ai',
      label: { fr: 'Outils IA', en: 'AI Tools' },
      value: { fr: 'Claude Code, NotebookLM, Gemini', en: 'Claude Code, NotebookLM, Gemini' },
      details: {
        fr: 'Claude Code pour développer et faire de la revue de code. NotebookLM pour synthétiser mes sources. Gemini pour les recherches rapides et les intégrations Google.',
        en: 'Claude Code for development and code review. NotebookLM to synthesise my sources. Gemini for quick lookups and Google integrations.',
      },
      bgGradient: 'linear-gradient(135deg,#0f3460 0%,#533483 100%)',
    },
    {
      icon: 'devops',
      label: { fr: 'Système', en: 'OS' },
      value: { fr: 'Ubuntu / Windows (double démarrage)', en: 'Ubuntu / Windows (Dual Boot)' },
      details: {
        fr: 'Ubuntu pour le développement (Docker, outils natifs, terminal) et Windows pour les tests de compatibilité et le multimédia.',
        en: 'Ubuntu for development (Docker, native tools, terminal) and Windows for compatibility testing and multimedia.',
      },
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

  // ── educator gallery lightbox ─────────────────────────────
  readonly image = responsiveImage;
  readonly formateurPhoto = responsiveImage('images/formateur.webp');
  readonly mentorPhoto    = responsiveImage('images/mentor.webp');
  readonly techleadPhoto  = responsiveImage('images/tech_lead.webp');

  eduLightbox = signal<{ src: string; alt: string } | null>(null);

  openEduLightbox(src: string, alt: string): void {
    this.eduLightbox.set({ src, alt });
    document.body.style.overflow = 'hidden';
  }

  closeEduLightbox(): void {
    this.eduLightbox.set(null);
    document.body.style.overflow = '';
  }

  onEduBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('edu-lightbox-backdrop')) {
      this.closeEduLightbox();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeSetupLightbox();
    this.closeEduLightbox();
  }

  // ── involvement links ─────────────────────────────────────────
  involvementLinks: {
    label: string;
    href: string;
    icon: string;
    descKey: string;
    imgSrc?: string;
  }[] = [
    {
      label: 'GitHub',
      href: GITHUB_URL,
      icon: 'github',
      descKey: 'about.involvementGithub',
    },
    {
      label: 'LinkedIn',
      href: LINKEDIN_URL,
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
      href: TWITTER_URL,
      icon: 'twitter',
      descKey: 'about.involvementTwitter',
    },
    {
      label: 'TikTok',
      href: 'https://www.tiktok.com/@tilstack_draw',
      icon: 'tiktok',
      descKey: 'about.involvementTiktok',
    },
    {
      label: 'DevPea',
      href: DEVPEA_URL,
      icon: 'devpea',
      descKey: 'about.involvementDevpea',
    },
    {
      label: 'Boutique',
      href: '/boutique',
      icon: 'shop',
      descKey: 'about.involvementShop',
    },
  ];

  // ── other roles ───────────────────────────────────────────────
  /**
   * Autres casquettes : tout est tiré des pages publiques de la Full Gospel Mission Kotto (Douala), relevées le
   * 10/10/2026 : Facebook (4,3 K abonnés), TikTok (1 290 abonnés, 8 151 j'aime), chaîne YouTube. Les chiffres bougent :
   * à mettre à jour de temps en temps.
   */
  readonly otherRolesOrg = { name: 'Full Gospel Mission Kotto', place: 'Kotto-Bonamoussadi, Douala' };
  otherRoles: {
    icon: IconName; titleKey: string; descKey: string;
    stats: { value: string; labelKey: string }[];
    links: { label: string; href: string; logo: 'facebook' | 'tiktok' | 'youtube' }[];
  }[] = [
    {
      icon: 'camera',
      titleKey: 'about.rolePhotographer',
      descKey: 'about.rolePhotographerDesc',
      stats: [{ value: '4,3 K', labelKey: 'about.statFacebook' }],
      links: [{ label: 'Facebook', href: 'https://www.facebook.com/fullgospelkotto16', logo: 'facebook' }],
    },
    {
      icon: 'video',
      titleKey: 'about.roleVideoEditor',
      descKey: 'about.roleVideoEditorDesc',
      stats: [
        { value: '8 151', labelKey: 'about.statLikes' },
        { value: '1 290', labelKey: 'about.statTiktok' },
      ],
      links: [
        { label: 'TikTok', href: 'https://www.tiktok.com/@fgmkotto', logo: 'tiktok' },
        { label: 'YouTube', href: 'https://www.youtube.com/@fgmkotto9790', logo: 'youtube' },
      ],
    },
    {
      icon: 'megaphone',
      titleKey: 'about.roleCommunity',
      descKey: 'about.roleCommunityDesc',
      stats: [
        { value: '4,3 K', labelKey: 'about.statFacebook' },
        { value: '1 290', labelKey: 'about.statTiktok' },
      ],
      links: [
        { label: 'Facebook', href: 'https://www.facebook.com/fullgospelkotto16', logo: 'facebook' },
        { label: 'TikTok', href: 'https://www.tiktok.com/@fgmkotto', logo: 'tiktok' },
        { label: 'YouTube', href: 'https://www.youtube.com/@fgmkotto9790', logo: 'youtube' },
      ],
    },
  ];

  // ── compétences par couches (skills.data.ts) ───────────────
  readonly skillLayers = SKILL_LAYERS;

  /** Texte de la pastille quand une technologie n'a pas de logo. */
  shortLabel(name: string): string {
    return name === 'REST' ? 'API' : name === 'ChatGPT' ? 'GPT' : name.slice(0, 3);
  }

  /** Logo d'une technologie (masque CSS + couleur), ou `null` si elle n'en a pas. */
  logo(name: string): { url: string; color: string } | null {
    const l = TECH_LOGOS[name];
    return l ? { url: `url(/images/tech/${l.file}.svg)`, color: l.color ?? 'var(--color-text)' } : null;
  }
  readonly multimediaSkills = MULTIMEDIA_SKILLS;

  ngOnInit(): void {
    // Les timers (interval) rendraient l'application instable pendant le pré-rendu.
    if (!this.isBrowser) return;

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
