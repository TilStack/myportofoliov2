import { Component, afterNextRender, computed, HostListener, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, filter, map, of, switchMap, tap } from 'rxjs';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';
import { QuoteModalComponent } from './quote-modal/quote-modal.component';
import { Quote, QuoteSubmission } from '../../core/models/quote.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { I18nService } from '../../core/services/i18n.service';
import { QuoteService } from '../../core/services/quote.service';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { QUOTES } from './quotes.data';
import { scrollToTop } from '../../shared/utils/motion';

const PAGE_SIZE = 9;

interface QuoteVM extends Quote {
  id: string;
  liked: boolean;
  likeCount: number;
}

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, FadeOnScrollDirective, QuoteModalComponent, ButtonComponent],
  templateUrl: './quotes.component.html',
  styleUrl: './quotes.component.scss',
})
export class QuotesComponent {
  private readonly fb = inject(FormBuilder);
  readonly i18n = inject(I18nService);
  private readonly quoteService = inject(QuoteService);
  readonly admin = inject(AdminAuthService);

  // ── Données ───────────────────────────────────────────────
  // Les 12 citations locales s'affichent immédiatement (aussi dans le HTML pré-rendu). Firestore
  // n'est chargé qu'après le premier rendu, au repos ou à la première interaction : le SDK
  // (~350 kB) ne concurrence donc ni le LCP ni le thread principal au chargement.
  readonly loading = signal(false);
  private readonly remoteEnabled = signal(false);
  /** true dès que Firestore a répondu : les citations ont alors de vrais identifiants (like, édition). */
  private readonly remoteReady = signal(false);

  private readonly rawQuotes = toSignal(
    toObservable(this.remoteEnabled).pipe(
      switchMap(enabled => enabled ? this.quoteService.getAll() : EMPTY),
      // Une réponse vide (base non migrée, aucune citation approuvée) ne remplace jamais les citations locales.
      filter(remote => remote.length > 0),
      map(remote => this.inLocalOrder(remote)),
      tap(() => { this.loading.set(false); this.remoteReady.set(true); }),
    ),
    { initialValue: QUOTES }
  );

  constructor() {
    afterNextRender(() => {
      const events = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const;
      let idleHandle: number | undefined;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const start = () => {
        events.forEach(e => window.removeEventListener(e, start));
        if (timer !== undefined) clearTimeout(timer);
        if (idleHandle !== undefined && 'cancelIdleCallback' in window) cancelIdleCallback(idleHandle);
        this.remoteEnabled.set(true);
      };
      events.forEach(e => window.addEventListener(e, start, { once: true, passive: true }));
      // Sans interaction : au repos, après une pause qui laisse la page devenir interactive (les citations
      // locales sont déjà affichées : rien d'urgent). Le chargement de Firestore ne pèse pas sur la mesure de chargement.
      timer = setTimeout(() => {
        if ('requestIdleCallback' in window) idleHandle = requestIdleCallback(start, { timeout: 4000 });
        else start();
      }, 4000);
    });
  }

  /**
   * Remet les citations distantes dans l'ordre des citations locales (texte identique), les nouvelles
   * ensuite par date décroissante : quand Firestore remplace les données, la page ne bouge pas.
   */
  private inLocalOrder(remote: Quote[]): Quote[] {
    const rank = new Map(QUOTES.map((q, i) => [q.text, i]));
    const rankOf = (q: Quote) => rank.get(q.text) ?? Number.MAX_SAFE_INTEGER;
    return [...remote].sort((a, b) => rankOf(a) - rankOf(b) || +new Date(b.date) - +new Date(a.date));
  }

  // ── Pending quotes + coordonnées des visiteurs (admin connecté uniquement) ──
  // Les règles Firestore refusent ces lectures aux autres : on ne s'abonne donc pas.
  private readonly rawPending = toSignal(
    toObservable(this.admin.isAdmin).pipe(
      switchMap(isAdmin => isAdmin ? this.quoteService.getPending() : of([] as Quote[])),
    ),
    { initialValue: [] as Quote[] }
  );

  private readonly submissions = toSignal(
    toObservable(this.admin.isAdmin).pipe(
      switchMap(isAdmin => isAdmin ? this.quoteService.getSubmissions() : of([] as QuoteSubmission[])),
    ),
    { initialValue: [] as QuoteSubmission[] }
  );

  /** Coordonnées du visiteur qui a proposé cette citation (admin uniquement). */
  submissionFor(quoteId: string): QuoteSubmission | undefined {
    return this.submissions().find(s => s.quoteId === quoteId);
  }

  readonly pendingQuotes = computed<QuoteVM[]>(() =>
    this.rawPending().map(q => ({
      ...q,
      id: q.id!,
      liked: false,
      likeCount: q.likes,
    }))
  );

  readonly pendingCount = computed(() => this.pendingQuotes().length);

  // Local liked state (session only)
  private likedSet = signal<Set<string>>(new Set());

  // Combined QuoteVM computed from Firebase + local liked state
  quotes = computed<QuoteVM[]>(() =>
    this.rawQuotes().map(q => ({
      ...q,
      id: q.id!,
      liked: this.likedSet().has(q.id!),
      likeCount: q.likes,
    }))
  );

  // null = show all
  activeCategory = signal<string | null>(null);

  readonly dataCategories = computed(() =>
    [...new Set(this.quotes().map(q => q.category ?? '').filter(Boolean))]
  );

  readonly filteredQuotes = computed<QuoteVM[]>(() => {
    const cat = this.activeCategory();
    if (!cat) return this.quotes();
    return this.quotes().filter(q => q.category === cat);
  });

  activeQuote = signal<QuoteVM | null>(null);

  openModal(quote: QuoteVM): void { this.activeQuote.set(quote); }
  closeModal(): void              { this.activeQuote.set(null); }

  setCategory(cat: string | null): void {
    this.activeCategory.set(cat);
    this.currentPage.set(1);
  }

  // ── Pagination ───────────────────────────────────────────
  currentPage = signal(1);

  readonly paginatedQuotes = computed<QuoteVM[]>(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.filteredQuotes().slice(start, start + PAGE_SIZE);
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredQuotes().length / PAGE_SIZE))
  );

  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  goToPage(page: number): void {
    this.currentPage.set(page);
    scrollToTop();
  }

  initials(author: string): string {
    return author.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  // ── Like on card ─────────────────────────────────────────
  toggleLike(quote: QuoteVM, e: MouseEvent): void {
    e.stopPropagation();
    const liked = this.likedSet().has(quote.id);
    this.likedSet.update(set => {
      const next = new Set(set);
      liked ? next.delete(quote.id) : next.add(quote.id);
      return next;
    });
    // Avant la réponse de Firestore les citations locales n'ont pas de document : pas d'écriture.
    if (this.remoteReady()) this.quoteService.like(quote.id, liked ? quote.likeCount - 1 : quote.likeCount + 1);
  }

  // ── Admin actions (UI visible uniquement si admin.isAdmin(); droits réels : firestore.rules) ──
  openEditFor(quote: QuoteVM, e: MouseEvent): void {
    e.stopPropagation();
    this.editTarget.set(quote);
    this.openEditModal();
  }

  // ── Add quote modal (owner) ──────────────────────────────
  showAddModal  = signal(false);
  addSuccess    = signal(false);
  addSubmitting = signal(false);

  addForm = this.fb.group({
    text:        ['', [Validators.required, Validators.minLength(10)]],
    author:      ['', [Validators.required]],
    category:    [''],
    tags:        [''],
    explanation: ['', [Validators.required, Validators.minLength(20)]],
  });

  openAddModal(): void {
    this.showAddModal.set(true);
    this.addSuccess.set(false);
    this.addForm.reset();
    document.body.style.overflow = 'hidden';
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
    document.body.style.overflow = '';
  }

  onAddBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('qadd-backdrop')) this.closeAddModal();
  }

  submitQuote(): void {
    if (this.addForm.invalid) return;
    this.addSubmitting.set(true);
    const v = this.addForm.value;
    const q: Omit<Quote, 'id' | 'expanded'> = {
      text:        v.text!,
      author:      v.author!,
      category:    v.category || undefined,
      tags:        v.tags ? v.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      explanation: v.explanation!,
      date:        new Date(),
      likes:       0,
    };
    this.quoteService.create(q)
      .then(() => { this.addSuccess.set(true); this.addSubmitting.set(false); })
      .catch(() => { this.addSubmitting.set(false); });
  }

  // ── Edit quote modal ─────────────────────────────────────
  showEditModal  = signal(false);
  editTarget     = signal<QuoteVM | null>(null);
  editSuccess    = signal(false);
  editSubmitting = signal(false);

  editForm = this.fb.group({
    text:        ['', [Validators.required, Validators.minLength(10)]],
    author:      ['', [Validators.required]],
    category:    [''],
    tags:        [''],
    explanation: ['', [Validators.required, Validators.minLength(20)]],
  });

  openEditModal(): void {
    const q = this.editTarget();
    if (!q) return;
    this.editForm.patchValue({
      text:        q.text,
      author:      q.author,
      category:    q.category ?? '',
      tags:        q.tags.join(', '),
      explanation: q.explanation,
    });
    this.showEditModal.set(true);
    this.editSuccess.set(false);
    document.body.style.overflow = 'hidden';
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editTarget.set(null);
    document.body.style.overflow = '';
  }

  onEditBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('qedit-backdrop')) this.closeEditModal();
  }

  submitEdit(): void {
    if (this.editForm.invalid) return;
    const id = this.editTarget()?.id;
    if (!id) return;
    this.editSubmitting.set(true);
    const v = this.editForm.value;
    const data: Partial<Omit<Quote, 'id' | 'expanded'>> = {
      text:        v.text!,
      author:      v.author!,
      category:    v.category || undefined,
      tags:        v.tags ? v.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      explanation: v.explanation!,
    };
    this.quoteService.update(id, data)
      .then(() => { this.editSuccess.set(true); this.editSubmitting.set(false); })
      .catch(() => { this.editSubmitting.set(false); });
  }

  // ── Delete quote ─────────────────────────────────────────
  deleteTarget = signal<QuoteVM | null>(null);

  openDeleteConfirm(quote: QuoteVM, e: MouseEvent): void {
    e.stopPropagation();
    this.deleteTarget.set(quote);
    document.body.style.overflow = 'hidden';
  }

  closeDeleteConfirm(): void {
    this.deleteTarget.set(null);
    document.body.style.overflow = '';
  }

  confirmDelete(): void {
    const id = this.deleteTarget()?.id;
    if (id) this.quoteService.delete(id).then(() => this.closeDeleteConfirm());
    else this.closeDeleteConfirm();
  }

  onDelBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('qdel-backdrop')) this.closeDeleteConfirm();
  }

  // ── Public visitor submission ────────────────────────────
  showSuggestModal   = signal(false);
  suggestSuccess     = signal(false);
  suggestSubmitting  = signal(false);

  suggestForm = this.fb.group({
    text:             ['', [Validators.required, Validators.minLength(10)]],
    author:           ['', [Validators.required, Validators.minLength(2)]],
    submitterRole:    [''],
    submitterEmail:   ['', [Validators.required, Validators.email]],
    submitterLinkedin:[''],
    explanation:      ['', [Validators.required, Validators.minLength(20)]],
  });

  openSuggestModal(): void {
    this.showSuggestModal.set(true);
    this.suggestSuccess.set(false);
    this.suggestForm.reset();
    document.body.style.overflow = 'hidden';
  }

  closeSuggestModal(): void {
    this.showSuggestModal.set(false);
    document.body.style.overflow = '';
  }

  onSuggestBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('qsuggest-backdrop')) this.closeSuggestModal();
  }

  submitSuggestion(): void {
    if (this.suggestForm.invalid) return;
    this.suggestSubmitting.set(true);
    const v = this.suggestForm.value;
    const q: Omit<Quote, 'id' | 'expanded' | 'status'> = {
      text:        v.text!,
      author:      v.author!,
      explanation: v.explanation!,
      date:        new Date(),
      likes:       0,
      tags:        [],
    };
    const contact = {
      email: v.submitterEmail!,
      ...(v.submitterRole     ? { role: v.submitterRole } : {}),
      ...(v.submitterLinkedin ? { linkedin: v.submitterLinkedin } : {}),
    };
    this.quoteService.createAsVisitor(q, contact)
      .then(() => { this.suggestSuccess.set(true); this.suggestSubmitting.set(false); })
      .catch(() => { this.suggestSubmitting.set(false); });
  }

  // ── Moderation panel (owner only) ────────────────────────
  showModerationModal  = signal(false);

  openModerationModal(): void { this.showModerationModal.set(true); }
  moderationApproving  = signal<string | null>(null);
  moderationRejecting  = signal<string | null>(null);

  closeModerationModal(): void {
    this.showModerationModal.set(false);
    document.body.style.overflow = '';
  }

  onModBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('qmod-backdrop')) this.closeModerationModal();
  }

  approvePending(quote: QuoteVM): void {
    this.moderationApproving.set(quote.id);
    this.quoteService.approve(quote.id)
      .then(() => this.moderationApproving.set(null))
      .catch(() => this.moderationApproving.set(null));
  }

  rejectPending(quote: QuoteVM): void {
    this.moderationRejecting.set(quote.id);
    this.quoteService.reject(quote.id)
      .then(() => this.moderationRejecting.set(null))
      .catch(() => this.moderationRejecting.set(null));
  }

  // ── Rich text toolbar (shared helper) ────────────────────
  private applyFormat(ta: HTMLTextAreaElement, format: string, patchFn: (v: string) => void): void {
    const s   = ta.selectionStart ?? 0;
    const end = ta.selectionEnd   ?? 0;
    const sel = ta.value.substring(s, end) || 'texte';
    let f: string;
    switch (format) {
      case 'bold':       f = `**${sel}**`;      break;
      case 'italic':     f = `*${sel}*`;         break;
      case 'h1':         f = `\n# ${sel}\n`;     break;
      case 'h2':         f = `\n## ${sel}\n`;    break;
      case 'blockquote': f = `\n> ${sel}`;       break;
      case 'code':       f = `\`${sel}\``;       break;
      default:           f = sel;
    }
    patchFn(ta.value.substring(0, s) + f + ta.value.substring(end));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + f.length, s + f.length); });
  }

  applyQuoteFormat(format: string): void {
    const ta = document.getElementById('qa-expl') as HTMLTextAreaElement;
    if (ta) this.applyFormat(ta, format, v => this.addForm.patchValue({ explanation: v }));
  }

  applyEditFormat(format: string): void {
    const ta = document.getElementById('qe-expl') as HTMLTextAreaElement;
    if (ta) this.applyFormat(ta, format, v => this.editForm.patchValue({ explanation: v }));
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showModerationModal())  this.closeModerationModal();
    else if (this.showEditModal())   this.closeEditModal();
    else if (this.showAddModal())    this.closeAddModal();
    else if (this.showSuggestModal())this.closeSuggestModal();
    else if (this.deleteTarget())    this.closeDeleteConfirm();
    else if (this.activeQuote())     this.closeModal();
  }
}
