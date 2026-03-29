import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';
import { QuoteModalComponent } from './quote-modal/quote-modal.component';
import { Quote } from '../../core/models/quote.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { I18nService } from '../../core/services/i18n.service';
import { QuoteService } from '../../core/services/quote.service';

const PAGE_SIZE = 11;

interface QuoteVM extends Quote {
  id: string;
  liked: boolean;
  likeCount: number;
}

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FadeOnScrollDirective, QuoteModalComponent, ButtonComponent],
  templateUrl: './quotes.component.html',
  styleUrl: './quotes.component.scss',
})
export class QuotesComponent {
  private readonly fb = inject(FormBuilder);
  readonly i18n = inject(I18nService);
  private readonly quoteService = inject(QuoteService);

  // ── Loading state ─────────────────────────────────────────
  readonly loading = signal(true);

  // ── Firebase data (real-time) ────────────────────────────
  private readonly rawQuotes = toSignal(
    this.quoteService.getAll().pipe(tap(() => this.loading.set(false))),
    { initialValue: [] as Quote[] }
  );

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    this.quoteService.update(quote.id, { likes: liked ? quote.likeCount - 1 : quote.likeCount + 1 });
  }

  // ── Shared password gate (add / edit) ────────────────────
  showPwModal   = signal(false);
  pwError       = signal(false);
  pwValue       = '';
  pendingAction = signal<'add' | 'edit' | null>(null);

  openPwModal(): void {
    this.pendingAction.set('add');
    this.showPwModal.set(true);
    this.pwError.set(false);
    this.pwValue = '';
  }

  openEditPwModal(quote: QuoteVM, e: MouseEvent): void {
    e.stopPropagation();
    this.pendingAction.set('edit');
    this.editTarget.set(quote);
    this.showPwModal.set(true);
    this.pwError.set(false);
    this.pwValue = '';
  }

  closePwModal(): void { this.showPwModal.set(false); }

  checkPw(): void {
    if (this.pwValue === '1Jesus1') {
      this.closePwModal();
      if (this.pendingAction() === 'add')  this.openAddModal();
      else if (this.pendingAction() === 'edit') this.openEditModal();
    } else {
      this.pwError.set(true);
    }
  }

  onPwBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('qpw-backdrop')) this.closePwModal();
  }

  // ── Add quote modal ──────────────────────────────────────
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
  delPwError   = signal(false);
  delPwValue   = '';

  openDeleteConfirm(quote: QuoteVM, e: MouseEvent): void {
    e.stopPropagation();
    this.deleteTarget.set(quote);
    this.delPwError.set(false);
    this.delPwValue = '';
    document.body.style.overflow = 'hidden';
  }

  closeDeleteConfirm(): void {
    this.deleteTarget.set(null);
    document.body.style.overflow = '';
  }

  confirmDelete(): void {
    if (this.delPwValue === '1Jesus1') {
      const id = this.deleteTarget()?.id;
      if (id) this.quoteService.delete(id).then(() => this.closeDeleteConfirm());
      else this.closeDeleteConfirm();
    } else {
      this.delPwError.set(true);
    }
  }

  onDelBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('qdel-backdrop')) this.closeDeleteConfirm();
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
    if (this.showEditModal())     this.closeEditModal();
    else if (this.showAddModal()) this.closeAddModal();
    else if (this.showPwModal())  this.closePwModal();
    else if (this.deleteTarget()) this.closeDeleteConfirm();
    else if (this.activeQuote())  this.closeModal();
  }
}
