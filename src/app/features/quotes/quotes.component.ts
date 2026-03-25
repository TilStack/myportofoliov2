import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';
import { QuoteModalComponent } from './quote-modal/quote-modal.component';
import { Quote } from '../../core/models/quote.model';
import { QUOTES } from './quotes.data';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { I18nService } from '../../core/services/i18n.service';

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

  // ── mutable quotes list ──────────────────────────────────
  quotes = signal<QuoteVM[]>(
    QUOTES.map(q => ({ ...q, id: q.id ?? String(Date.now() + Math.random()), liked: false, likeCount: q.likes }))
  );

  // null = show all
  activeCategory = signal<string | null>(null);

  // Unique category values from data (for the filter buttons)
  readonly dataCategories = computed(() =>
    [...new Set(this.quotes().map(q => q.category ?? '').filter(Boolean))]
  );

  readonly filteredQuotes = computed<QuoteVM[]>(() => {
    const cat = this.activeCategory();
    if (!cat) return this.quotes();
    return this.quotes().filter(q => q.category === cat);
  });

  activeQuote = signal<QuoteVM | null>(null);

  openModal(quote: QuoteVM): void           { this.activeQuote.set(quote); }
  closeModal(): void                        { this.activeQuote.set(null); }
  setCategory(cat: string | null): void     { this.activeCategory.set(cat); }

  initials(author: string): string {
    return author.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  // ── Like on card ─────────────────────────────────────────
  toggleLike(quote: QuoteVM, e: MouseEvent): void {
    e.stopPropagation();
    this.quotes.update(list =>
      list.map(q => q.id === quote.id
        ? { ...q, liked: !q.liked, likeCount: q.liked ? q.likeCount - 1 : q.likeCount + 1 }
        : q
      )
    );
  }

  // ── Password gate (add quote) ────────────────────────────
  showPwModal = signal(false);
  pwError     = signal(false);
  pwValue     = '';

  openPwModal(): void  { this.showPwModal.set(true); this.pwError.set(false); this.pwValue = ''; }
  closePwModal(): void { this.showPwModal.set(false); }

  checkPw(): void {
    if (this.pwValue === '1Jesus1') { this.closePwModal(); this.openAddModal(); }
    else                            { this.pwError.set(true); }
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
    const q: QuoteVM = {
      id:          Date.now().toString(),
      text:        v.text!,
      author:      v.author!,
      category:    v.category || undefined,
      tags:        v.tags ? v.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      explanation: v.explanation!,
      date:        new Date(),
      likes:       0,
      liked:       false,
      likeCount:   0,
    };
    setTimeout(() => {
      this.quotes.update(list => [q, ...list]);
      this.addSuccess.set(true);
      this.addSubmitting.set(false);
    }, 600);
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
      if (id) this.quotes.update(list => list.filter(q => q.id !== id));
      this.closeDeleteConfirm();
    } else {
      this.delPwError.set(true);
    }
  }

  onDelBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('qdel-backdrop')) this.closeDeleteConfirm();
  }

  // ── Rich text for explanation ────────────────────────────
  applyQuoteFormat(format: string): void {
    const ta = document.getElementById('qa-expl') as HTMLTextAreaElement;
    if (!ta) return;
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
    const nv = ta.value.substring(0, s) + f + ta.value.substring(end);
    this.addForm.patchValue({ explanation: nv });
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + f.length, s + f.length); });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showAddModal())    this.closeAddModal();
    else if (this.showPwModal())    this.closePwModal();
    else if (this.deleteTarget())   this.closeDeleteConfirm();
    else if (this.activeQuote())    this.closeModal();
  }
}
