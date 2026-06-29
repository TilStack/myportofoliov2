import { Component, inject, signal, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// Transform values relative to the base position (bottom-right corner)
const FLEE_TRANSFORMS = [
  'translate(0, 0)',
  // flee to bottom-left
  'translateX(calc(-100vw + 3.25rem + 64px))',
  // flee to top-right
  'translateY(calc(-100vh + 11.5rem + 64px))',
];

// Zoom overlay origin matched to each position
const ZOOM_ORIGINS = [
  { x: '93%', y: '93%' },   // bottom-right
  { x: '7%',  y: '93%' },   // bottom-left
  { x: '93%', y: '7%'  },   // top-right
];

@Component({
  selector: 'app-avatar-mascot',
  standalone: true,
  templateUrl: './avatar-mascot.component.html',
  styleUrl: './avatar-mascot.component.scss',
})
export class AvatarMascotComponent {
  private router = inject(Router);

  fleeCount    = signal(0);      // how many times it has fled (max 2)
  caught       = signal(false);  // true on 3rd hover – stops fleeing
  isFleeing    = signal(false);  // during flee animation, block new hovers
  isZooming    = signal(false);  // during click-zoom transition
  isOnAbout    = signal(false);

  transformStyle = computed(() => FLEE_TRANSFORMS[this.fleeCount()]);
  zoomOrigin     = computed(() => ZOOM_ORIGINS[this.fleeCount()]);

  constructor() {
    // Detect current route immediately and on each navigation
    const check = (url: string) =>
      this.isOnAbout.set(url === '/about' || url.startsWith('/about/'));

    check(this.router.url);

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => check((e as NavigationEnd).urlAfterRedirects));
  }

  onMouseEnter(): void {
    if (this.isFleeing() || this.isZooming()) return;

    if (this.fleeCount() < 2) {
      // Flee!
      this.isFleeing.set(true);
      this.fleeCount.update(c => c + 1);
      setTimeout(() => this.isFleeing.set(false), 520);
    } else if (!this.caught()) {
      // 3rd hover — got you!
      this.caught.set(true);
    }
  }

  onClick(): void {
    if (this.fleeCount() < 2 || this.isZooming()) return;

    this.isZooming.set(true);

    // Navigate after the circle finishes expanding
    setTimeout(() => this.router.navigate(['/about']), 680);

    // Reset state so it starts fresh when returning
    setTimeout(() => {
      this.isZooming.set(false);
      this.fleeCount.set(0);
      this.caught.set(false);
    }, 900);
  }
}
