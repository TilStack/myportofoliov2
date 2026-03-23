import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';
import { I18nService } from '../../core/services/i18n.service';

// ── Article types ──────────────────────────────────────────────────────────
type ArticleSource = 'local' | 'zerofiltre';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  coverUrl?: string;
  coverGradient?: string;
  coverIcon?: string;
  tags: string[];
  date: Date;
  source: ArticleSource;
  externalUrl?: string;
  readTime: number;
  featured?: boolean;
}

// ── Static data ────────────────────────────────────────────────────────────
const ARTICLES: Article[] = [
  // ── Local articles (fictional, editable later) ──
  {
    id: 'angular-signals-guide',
    title: 'Getting Started with Angular Signals',
    excerpt:
      'Angular 17+ introduced Signals as a powerful new reactive primitive. In this guide, I break down how they work, how they compare to RxJS observables, and how to adopt them effectively in your components.',
    coverGradient: 'linear-gradient(135deg, #c31432 0%, #240b36 100%)',
    coverIcon: '⚡',
    tags: ['Angular', 'TypeScript', 'Signals'],
    date: new Date('2024-11-15'),
    source: 'local',
    readTime: 8,
    featured: true,
  },
  {
    id: 'nestjs-postgresql-api',
    title: 'Building a REST API with NestJS & PostgreSQL',
    excerpt:
      'A step-by-step guide to building a production-ready REST API using NestJS, TypeORM, and PostgreSQL — from project setup and entity design all the way to deployment on a VPS.',
    coverGradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    coverIcon: '🔗',
    tags: ['NestJS', 'NodeJS', 'PostgreSQL', 'Backend'],
    date: new Date('2024-09-20'),
    source: 'local',
    readTime: 12,
  },
  {
    id: 'flutter-vs-react-native-2025',
    title: 'Flutter vs React Native in 2025',
    excerpt:
      'An honest, developer-focused comparison of the two leading cross-platform mobile frameworks. I cover performance, developer experience, community size, ecosystem, and real-world job market data.',
    coverGradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    coverIcon: '📱',
    tags: ['Flutter', 'Mobile', 'React Native'],
    date: new Date('2025-01-05'),
    source: 'local',
    readTime: 10,
  },

  // ── Zerofiltre articles (real, published externally) ──
  {
    id: 'zerofiltre-docker-debian',
    title: 'Conquérir l\'écosystème Docker sur les distributions Debian',
    excerpt:
      'Guide pratique pour découvrir le processus d\'installation de Docker avec les distributions Debian, pour développeurs de toute catégorie. Maîtrisez les bases du conteneur dès le départ.',
    coverUrl:
      'https://storage.gra.cloud.ovh.net/v1/AUTH_5159edadfde2413fb43128c1fef06fbf/zerofiltre-object-container/Docker-Website.png',
    tags: ['Docker', 'Débutant', 'DevOps'],
    date: new Date('2024-03-27'),
    source: 'zerofiltre',
    externalUrl:
      'https://zerofiltre.tech/articles/287-conqu%C3%A9rir-l-%C3%A9cosysteme-docker-sur-les-distributions-debian',
    readTime: 6,
  },
  {
    id: 'zerofiltre-flutter-toast',
    title: 'Flutter Toast 2024 | Notifiez vos utilisateurs avec style',
    excerpt:
      'Un moyen simple, efficace et stylé d\'informer vos utilisateurs. Découvrez comment intégrer des notifications toast élégantes dans vos applications Flutter en 2024.',
    coverUrl:
      'https://storage.gra.cloud.ovh.net/v1/AUTH_5159edadfde2413fb43128c1fef06fbf/zerofiltre-object-container/toast_flutter_2024.png',
    tags: ['Flutter', 'Productivité', 'Débutant'],
    date: new Date('2024-02-08'),
    source: 'zerofiltre',
    externalUrl:
      'https://zerofiltre.tech/articles/282-flutter-toast-2024-notifiez-vos-utilisateurs-avec-style',
    readTime: 5,
  },
  {
    id: 'zerofiltre-faker-mongodb',
    title: 'Faker : Générez des données de test sur MongoDB Atlas avec Nodejs',
    excerpt:
      'Découvrez comment utiliser Faker.js et MongoDB Atlas avec Node.js pour générer rapidement des données fictives et réalistes. Accélérez le développement et les tests de vos applications.',
    coverUrl:
      'https://storage.gra.cloud.ovh.net/v1/AUTH_5159edadfde2413fb43128c1fef06fbf/zerofiltre-object-container/test_data_faker_new.png',
    tags: ['NodeJS', 'MongoDB', 'JavaScript', 'Débutant'],
    date: new Date('2023-07-08'),
    source: 'zerofiltre',
    externalUrl:
      'https://zerofiltre.tech/articles/244-faker-generez-facilement-des-donnees-de-test-sur-mongodb-atlas-avec-nodejs',
    readTime: 7,
  },
  {
    id: 'zerofiltre-lottie-flutter',
    title: 'Améliorer l\'UX avec les fichiers Lottie dans Flutter',
    excerpt:
      'Guide pratique pour ajouter des animations Lottie à vos projets Flutter mobile et web. Rendez vos interfaces visuellement captivantes avec des animations légères et fluides.',
    coverUrl:
      'https://storage.gra.cloud.ovh.net/v1/AUTH_5159edadfde2413fb43128c1fef06fbf/zerofiltre-object-container/Screenshot%202023-05-12%20100633.png',
    tags: ['Flutter', 'Animation', 'UX', 'Débutant'],
    date: new Date('2023-05-12'),
    source: 'zerofiltre',
    externalUrl:
      'https://zerofiltre.tech/articles/232-ameliorer-lexperience-utilisateur-avec-les-fichiers-lottie-dans-vos-projets-flutter-mobile-et-web',
    readTime: 8,
  },
];

// ── Component ──────────────────────────────────────────────────────────────
@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, FadeOnScrollDirective],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
})
export class BlogComponent {
  readonly i18n = inject(I18nService);
  readonly fb   = inject(FormBuilder);

  // ── filter ──
  activeFilter = signal<'all' | 'mine' | 'zerofiltre'>('all');

  filteredArticles = computed<Article[]>(() => {
    const filter = this.activeFilter();
    const all    = ARTICLES;
    if (filter === 'mine')        return all.filter(a => a.source === 'local');
    if (filter === 'zerofiltre')  return all.filter(a => a.source === 'zerofiltre');
    return all;
  });

  featuredArticle = computed<Article | null>(() =>
    this.activeFilter() !== 'zerofiltre'
      ? (ARTICLES.find(a => a.featured) ?? null)
      : null
  );

  gridArticles = computed<Article[]>(() =>
    this.filteredArticles().filter(a => !a.featured)
  );

  setFilter(f: 'all' | 'mine' | 'zerofiltre'): void {
    this.activeFilter.set(f);
  }

  // ── newsletter ──
  subscribed  = signal(false);
  subscribing = signal(false);

  newsletterForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  subscribeNewsletter(): void {
    if (this.newsletterForm.invalid) return;
    this.subscribing.set(true);
    setTimeout(() => {
      this.subscribed.set(true);
      this.subscribing.set(false);
    }, 1200);
  }

  // ── contribute modal ──
  showContribute  = signal(false);
  submitSuccess   = signal(false);
  submitting      = signal(false);

  contributeForm = this.fb.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    title:   ['', [Validators.required, Validators.minLength(5)]],
    tags:    [''],
    desc:    ['', [Validators.required, Validators.minLength(20)]],
    content: [''],
  });

  // ── password gate ──
  showPasswordModal = signal(false);
  passwordError     = signal(false);
  passwordValue     = '';

  openPasswordModal(): void {
    this.showPasswordModal.set(true);
    this.passwordError.set(false);
    this.passwordValue = '';
  }

  closePasswordModal(): void {
    this.showPasswordModal.set(false);
    this.passwordError.set(false);
  }

  checkPassword(): void {
    if (this.passwordValue === '1Jesus1') {
      this.closePasswordModal();
      this.openContribute();
    } else {
      this.passwordError.set(true);
    }
  }

  onPwBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('pw-backdrop')) {
      this.closePasswordModal();
    }
  }

  // ── article detail ──
  articleDetail = signal<Article | null>(null);

  openArticleDetail(article: Article): void {
    if (article.source !== 'local') return;
    this.articleDetail.set(article);
    document.body.style.overflow = 'hidden';
  }

  closeArticleDetail(): void {
    this.articleDetail.set(null);
    document.body.style.overflow = '';
  }

  onArticleBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('adetail-backdrop')) {
      this.closeArticleDetail();
    }
  }

  // ── rich-text toolbar ──
  applyFormat(format: string): void {
    const ta = document.getElementById('c-desc') as HTMLTextAreaElement;
    if (!ta) return;
    const start    = ta.selectionStart ?? 0;
    const end      = ta.selectionEnd   ?? 0;
    const selected = ta.value.substring(start, end) || 'text';

    let formatted: string;
    switch (format) {
      case 'bold':       formatted = `**${selected}**`;                                          break;
      case 'italic':     formatted = `*${selected}*`;                                           break;
      case 'strike':     formatted = `~~${selected}~~`;                                         break;
      case 'underline':  formatted = `<u>${selected}</u>`;                                      break;
      case 'h1':         formatted = `\n# ${selected}\n`;                                       break;
      case 'h2':         formatted = `\n## ${selected}\n`;                                      break;
      case 'h3':         formatted = `\n### ${selected}\n`;                                     break;
      case 'center':     formatted = `<center>${selected}</center>`;                            break;
      case 'right':      formatted = `<p style="text-align:right">${selected}</p>`;             break;
      case 'bullet':     formatted = selected.split('\n').map(l => `- ${l}`).join('\n');        break;
      case 'numbered':   formatted = selected.split('\n').map((l,i) => `${i+1}. ${l}`).join('\n'); break;
      case 'blockquote': formatted = selected.split('\n').map(l => `> ${l}`).join('\n');        break;
      case 'code':       formatted = `\`${selected}\``;                                         break;
      case 'codeblock':  formatted = `\`\`\`\n${selected}\n\`\`\``;                            break;
      case 'link':       formatted = `[${selected}](url)`;                                      break;
      case 'hr':         formatted = `\n\n---\n\n`;                                             break;
      default:           formatted = selected;
    }

    const newVal = ta.value.substring(0, start) + formatted + ta.value.substring(end);
    this.contributeForm.patchValue({ desc: newVal });
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + formatted.length, start + formatted.length);
    });
  }

  openContribute(): void {
    this.showContribute.set(true);
    this.submitSuccess.set(false);
    this.contributeForm.reset();
    document.body.style.overflow = 'hidden';
  }

  closeContribute(): void {
    this.showContribute.set(false);
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showContribute())    this.closeContribute();
    if (this.articleDetail())     this.closeArticleDetail();
    if (this.showPasswordModal()) this.closePasswordModal();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('contribute-backdrop')) {
      this.closeContribute();
    }
  }

  submitContribute(): void {
    if (this.contributeForm.invalid) return;
    this.submitting.set(true);
    // Wire to Firebase or email service later
    setTimeout(() => {
      this.submitSuccess.set(true);
      this.submitting.set(false);
    }, 1000);
  }

  // ── helpers ──
  formatDate(d: Date): string {
    return new Intl.DateTimeFormat(this.i18n.lang() === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric', month: 'short', year: 'numeric',
    }).format(d);
  }
}
