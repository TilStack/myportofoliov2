import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { I18nService } from '../../core/services/i18n.service';

interface NavLink {
  key: string;
  path: string;
  icon: 'home' | 'user' | 'folder' | 'bag' | 'blog' | 'quote' | 'mail';
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

  links: NavLink[] = [
    { key: 'nav.home',     path: '/', icon: 'home'         },
    { key: 'nav.about',    path: '/about', icon: 'user'    },
    { key: 'nav.projects', path: '/projects', icon: 'folder' },
    { key: 'nav.shop',     path: '/boutique', icon: 'bag' },
    { key: 'nav.blog',     path: '/blog', icon: 'blog'     },
    { key: 'nav.quotes',   path: '/quotes', icon: 'quote'   },
    { key: 'nav.contact',  path: '/contact', icon: 'mail'  },
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 20);
  }
}
