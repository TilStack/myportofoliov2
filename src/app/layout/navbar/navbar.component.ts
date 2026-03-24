import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { I18nService } from '../../core/services/i18n.service';

interface NavLink {
  key: string;
  path: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  themeService = inject(ThemeService);
  i18n         = inject(I18nService);

  scrolled  = signal(false);
  menuOpen  = signal(false);

  links: NavLink[] = [
    { key: 'nav.home',     path: '/'         },
    { key: 'nav.about',    path: '/about'    },
    { key: 'nav.projects', path: '/projects' },
    { key: 'nav.blog',     path: '/blog'     },
    { key: 'nav.quotes',   path: '/quotes'   },
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 20);
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
