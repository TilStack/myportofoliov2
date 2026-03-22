import {
  Component, Input, Output, EventEmitter,
  HostListener, OnInit, ElementRef, ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quote } from '../../../core/models/quote.model';

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

  visible = false;

  ngOnInit(): void {
    // Trigger enter animation on next frame
    requestAnimationFrame(() => (this.visible = true));
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  dismiss(): void {
    this.visible = false;
    document.body.style.overflow = '';
    // Wait for exit animation before emitting
    setTimeout(() => this.close.emit(), 280);
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.dismiss();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('qmodal__backdrop')) {
      this.dismiss();
    }
  }

  /** Readable date */
  get formattedDate(): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).format(this.quote.date);
  }

  /** Author initials for avatar */
  get initials(): string {
    return this.quote.author
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
