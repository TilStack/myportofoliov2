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

  // Rotating images — replace with real paths in /public/images/
  travelImages: TravelImage[] = [
    { src: 'images/cameroon-1.jpg', alt: 'Cameroon landscape', caption: 'The highlands of Cameroon' },
    { src: 'images/cameroon-2.jpg', alt: 'Douala at night',   caption: 'Douala by night' },
    { src: 'images/cameroon-3.jpg', alt: 'Local culture',     caption: 'Rich local culture' },
  ];

  setupItems: SetupItem[] = [
    { icon: '💻', label: 'Machine',  value: 'ThinkPad X1 Carbon / Ubuntu' },
    { icon: '🖊️', label: 'Editor',   value: 'VS Code + GitHub Copilot'     },
    { icon: '⚡', label: 'Terminal', value: 'Zsh + Oh My Zsh + Starship'   },
    { icon: '🎨', label: 'Design',   value: 'Figma + Excalidraw'           },
    { icon: '🎧', label: 'Audio',    value: 'Spotify — Lo-fi while coding' },
    { icon: '☕', label: 'Fuel',     value: 'Black coffee, always'         },
  ];

  skills = [
    'Angular', 'TypeScript', 'Node.js', 'Firebase',
    'SCSS', 'Git', 'Docker', 'PostgreSQL',
    'React', 'Figma', 'Linux', 'REST / GraphQL',
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
