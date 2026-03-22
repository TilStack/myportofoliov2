import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';

interface SetupItem { icon: string; label: string; value: string; }
interface TravelImage { src: string; alt: string; caption: string; }

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, FadeOnScrollDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit, OnDestroy {
  activeImageIndex = signal(0);
  private imageSub?: Subscription;

  travelImages: TravelImage[] = [
    { src: 'images/cameroon-1.jpg', alt: 'Cameroon landscape', caption: 'The highlands of Cameroon' },
    { src: 'images/cameroon-2.jpg', alt: 'Douala at night',    caption: 'Douala by night'            },
    { src: 'images/cameroon-3.jpg', alt: 'Local culture',      caption: 'Rich local culture'          },
  ];

  setupItems: SetupItem[] = [
    { icon: '💻', label: 'Laptop',     value: 'Dell Latitude 5490 — i5-8350U · 16 GB RAM'  },
    { icon: '📱', label: 'Phone',      value: 'Tecno Camon 16 S — Android 10 · 128 GB'     },
    { icon: '🎧', label: 'Audio',      value: 'Oraimo headphones'                            },
    { icon: '🌐', label: 'Browsers',   value: 'Google Chrome & Opera'                        },
    { icon: '🤖', label: 'AI Tools',   value: 'ChatGPT & Gemini'                             },
    { icon: '⚙️', label: 'OS',         value: 'Ubuntu / Windows (Dual Boot)'                 },
  ];

  skills = [
    // Design
    'Figma', 'Canva',
    // Front-end
    'Angular', 'TypeScript', 'Flutter', 'SCSS',
    // Back-end
    'NestJS', 'ExpressJS', 'NodeJS', 'PostgreSQL',
    // DevOps & tools
    'Git / GitHub', 'Docker', 'Firebase', 'Trello',
  ];

  ngOnInit(): void {
    this.imageSub = interval(5000).subscribe(() => {
      this.activeImageIndex.update(i => (i + 1) % this.travelImages.length);
    });
  }

  ngOnDestroy(): void {
    this.imageSub?.unsubscribe();
  }

  setImage(index: number): void {
    this.activeImageIndex.set(index);
  }
}
