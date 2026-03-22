import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent';
export type ButtonSize    = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="classes"
      [disabled]="disabled || loading"
      [attr.aria-busy]="loading"
      [type]="type"
    >
      <span class="btn__spinner" *ngIf="loading" aria-hidden="true"></span>
      <ng-content></ng-content>
    </button>
  `,
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize       = 'md';
  @Input() disabled               = false;
  @Input() loading                = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth              = false;

  get classes(): string {
    return [
      'btn',
      `btn--${this.variant}`,
      `btn--${this.size}`,
      this.fullWidth ? 'btn--full' : '',
      this.loading   ? 'btn--loading' : '',
    ].filter(Boolean).join(' ');
  }
}
