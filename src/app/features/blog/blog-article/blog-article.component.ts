import { Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { BLOG_POSTS, BlogPost } from '../../../data/blog.data';
import { IMAGE_MANIFEST } from '../../../data/image-manifest';
import { articleSeo } from '../../../data/seo.data';
import { articleSchema } from '../../../data/structured-data';

/** /blog/<slug> : un article du site. Texte français (langue de rédaction), métadonnées posées ici. */
@Component({
  selector: 'app-blog-article',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './blog-article.component.html',
  styleUrl: './blog-article.component.scss',
})
export class BlogArticleComponent {
  readonly post: BlogPost | null;
  readonly dateLabel: string = '';

  constructor() {
    const seo = inject(SeoService);
    const slug = inject(ActivatedRoute).snapshot.paramMap.get('slug');
    this.post = BLOG_POSTS.find(p => p.slug === slug) ?? null;
    if (this.post) {
      seo.apply(articleSeo(this.post));
      seo.setJsonLd([articleSchema(this.post)]);
      this.dateLabel = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
        .format(new Date(this.post.date));
    }
  }

  /** Dimensions et variantes d'une image optimisée (voir scripts/optimize-images.mjs). */
  image(src: string) {
    const info = IMAGE_MANIFEST[src];
    const base = src.replace(/\.webp$/, '');
    return {
      src,
      width: info.w,
      height: info.h,
      srcset: info.widths.map(w => `${w === info.w ? src : `${base}-${w}.webp`} ${w}w`).join(', '),
    };
  }
}
