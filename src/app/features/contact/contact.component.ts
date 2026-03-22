import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, FadeOnScrollDirective],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  fb = inject(FormBuilder);

  form = this.fb.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  sending = signal(false);
  sent    = signal(false);
  error   = signal(false);

  socials = [
    { label: 'GitHub',   href: 'https://github.com/',    icon: 'github'   },
    { label: 'LinkedIn', href: 'https://linkedin.com/',  icon: 'linkedin' },
    { label: 'Twitter',  href: 'https://twitter.com/',   icon: 'twitter'  },
  ];

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.sending.set(true);
    this.error.set(false);

    // Wire this to your backend / EmailJS / Firebase function
    setTimeout(() => {
      this.sent.set(true);
      this.sending.set(false);
      this.form.reset();
    }, 1200);
  }

  hasError(field: string, err: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.hasError(err) && ctrl?.touched);
  }
}
