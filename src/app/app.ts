import { Component, Injector, PLATFORM_ID, afterNextRender, inject, OnInit } from '@angular/core';
import { RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { filter, take } from 'rxjs/operators';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { BackToTopComponent } from './shared/components/back-to-top/back-to-top.component';
import { AvatarMascotComponent } from './shared/components/avatar-mascot/avatar-mascot.component';
import { ThemeService } from './core/services/theme.service';
import { ScrollAnimationService } from './core/services/scroll-animation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, BackToTopComponent, AvatarMascotComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private themeService = inject(ThemeService);          // initializes on inject
  private scrollAnim   = inject(ScrollAnimationService);
  private router       = inject(Router);
  private isBrowser    = isPlatformBrowser(inject(PLATFORM_ID));
  private injector     = inject(Injector);

  ngOnInit(): void {
    if (!this.isBrowser) return;

    // Premier écran visible d'emblée : on marque ce qui est dans la fenêtre PUIS on active js-anim
    // (qui masque le reste jusqu'au défilement). Sans JS, ou avant ce point, tout le contenu reste visible.
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), take(1)).subscribe(() => {
      afterNextRender({
        write: () => {
          this.scrollAnim.revealInViewport();
          document.documentElement.classList.add('js-anim');
        },
      }, { injector: this.injector });
    });

    // Re-init scroll animations on every page navigation
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      setTimeout(() => this.scrollAnim.init(), 150);
    });
  }
}
