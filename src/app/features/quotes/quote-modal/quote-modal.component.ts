import {
  Component, Input, Output, EventEmitter,
  HostListener, OnInit, ElementRef, ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quote, QuoteComment } from '../../../core/models/quote.model';

@Component({
  selector: 'app-quote-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quote-modal.component.html',
  styleUrl: './quote-modal.component.scss',
})
export class QuoteModalComponent implements OnInit {
  @Input({ required: true }) quote!: Quote;
  @Output() close = new EventEmitter<void>();

  @ViewChild('dialog', { static: true }) dialogEl!: ElementRef<HTMLElement>;

  visible   = false;
  liked     = false;
  likeCount = 0;

  comments: QuoteComment[]  = [];
  newCommentAuthor = '';
  newCommentText   = '';

  ngOnInit(): void {
    requestAnimationFrame(() => (this.visible = true));
    document.body.style.overflow = 'hidden';
    this.likeCount = this.quote.likes;
  }

  dismiss(): void {
    this.visible = false;
    document.body.style.overflow = '';
    setTimeout(() => this.close.emit(), 280);
  }

  @HostListener('document:keydown.escape')
  onEsc(): void { this.dismiss(); }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('qmodal__backdrop')) {
      this.dismiss();
    }
  }

  toggleLike(): void {
    this.liked = !this.liked;
    this.likeCount += this.liked ? 1 : -1;
  }

  addComment(): void {
    if (!this.newCommentText.trim()) return;
    this.comments.push({
      id:     Date.now().toString(),
      author: this.newCommentAuthor.trim() || 'Anonyme',
      text:   this.newCommentText.trim(),
      date:   new Date(),
    });
    this.newCommentAuthor = '';
    this.newCommentText   = '';
  }

  formatCommentDate(d: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    }).format(d);
  }

  get formattedDate(): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).format(this.quote.date);
  }

  get initials(): string {
    return this.quote.author.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
}
