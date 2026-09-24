import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import {
  DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_ALT, SITE_NAME, TWITTER_URL,
} from '../../data/site.data';
import { JsonLd, absoluteUrl } from '../../data/structured-data';

export interface SeoConfig {
  title: string;
  description: string;
  /** Chemin de la page sur le site (« / », « /about »…) : sert au canonical et à og:url. */
  path: string;
  /** Image de partage (chemin du site ou URL absolue). Défaut : DEFAULT_OG_IMAGE. */
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  /** Page à ne pas indexer (admin, 404). */
  noindex?: boolean;
}

/** Données de route lues par SeoService : `data: { seo, jsonLd }`. */
export interface SeoRouteData {
  seo?: SeoConfig;
  jsonLd?: JsonLd[];
}

const JSON_LD_ATTR = 'data-seo-jsonld';

/**
 * Métadonnées SEO et de partage, appliquées à chaque route (pré-rendu comme navigation
 * côté navigateur). Les routes déclarent `data: { seo, jsonLd }` ; les pages dynamiques
 * (projets) appellent `apply()` / `setJsonLd()` elles-mêmes.
 *
 * Le contenu est en français (langue du HTML pré-rendu, `og:locale` fr_FR).
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta     = inject(Meta);
  private readonly title    = inject(Title);
  private readonly document = inject(DOCUMENT);
  private readonly router   = inject(Router);

  /** Applique les données SEO de la route active à chaque navigation. */
  watchRoutes(): void {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      let route: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
      while (route.firstChild) route = route.firstChild;
      const { seo, jsonLd } = route.data as SeoRouteData;
      // Une route sans `seo` (ex. page projet) gère ses métadonnées elle-même.
      if (!seo) return;
      this.apply(seo);
      this.setJsonLd(jsonLd ?? []);
    });
  }

  apply(config: SeoConfig): void {
    const url   = absoluteUrl(config.path);
    const image = absoluteUrl(config.image ?? DEFAULT_OG_IMAGE);
    const alt   = config.imageAlt ?? (config.image ? config.title : DEFAULT_OG_IMAGE_ALT);
    const isDefaultImage = !config.image || config.image === DEFAULT_OG_IMAGE;

    this.title.setTitle(config.title);
    this.setName('description', config.description);
    this.setCanonical(config.noindex ? null : url);

    this.setProperty('og:type', config.type ?? 'website');
    this.setProperty('og:site_name', SITE_NAME);
    this.setProperty('og:title', config.title);
    this.setProperty('og:description', config.description);
    this.setProperty('og:url', url);
    this.setProperty('og:image', image);
    this.setProperty('og:image:alt', alt);
    // Dimensions connues uniquement pour l'image par défaut (1200×630).
    this.setProperty('og:image:width', isDefaultImage ? '1200' : null);
    this.setProperty('og:image:height', isDefaultImage ? '630' : null);
    this.setProperty('og:locale', 'fr_FR');
    this.setProperty('og:locale:alternate', 'en_US');

    this.setName('twitter:card', 'summary_large_image');
    this.setName('twitter:site', `@${TWITTER_URL.split('/').pop()}`);
    this.setName('twitter:title', config.title);
    this.setName('twitter:description', config.description);
    this.setName('twitter:image', image);
    this.setName('twitter:image:alt', alt);

    this.setName('robots', config.noindex ? 'noindex, nofollow' : null);
  }

  /** Remplace les blocs JSON-LD de la page (un `<script type="application/ld+json">` par objet). */
  setJsonLd(schemas: JsonLd[]): void {
    const head = this.document.head;
    head.querySelectorAll(`script[${JSON_LD_ATTR}]`).forEach(el => el.remove());
    for (const schema of schemas) {
      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute(JSON_LD_ATTR, '');
      // « < » échappé : le contenu ne peut jamais refermer la balise <script>.
      script.textContent = JSON.stringify(schema).replace(/</g, '\\u003c');
      head.appendChild(script);
    }
  }

  private setName(name: string, content: string | null): void {
    if (content === null) this.meta.removeTag(`name="${name}"`);
    else this.meta.updateTag({ name, content });
  }

  private setProperty(property: string, content: string | null): void {
    if (content === null) this.meta.removeTag(`property="${property}"`);
    else this.meta.updateTag({ property, content });
  }

  private setCanonical(url: string | null): void {
    if (url === null) {
      this.document.head.querySelector('link[rel="canonical"]')?.remove();
      return;
    }
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
