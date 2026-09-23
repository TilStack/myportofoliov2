import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';
import { I18nService } from '../../core/services/i18n.service';
import { CONTACT_EMAIL, GITHUB_URL, LINKEDIN_URL, TWITTER_URL } from '../../data/site.data';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, FadeOnScrollDirective],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  readonly i18n = inject(I18nService);
  fb = inject(FormBuilder);

  form = this.fb.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  sending = signal(false);
  sent    = signal(false);
  error   = signal(false);

  readonly email = CONTACT_EMAIL;

  socials = [
    { label: 'GitHub',   href: GITHUB_URL,   icon: 'github'   },
    { label: 'LinkedIn', href: LINKEDIN_URL, icon: 'linkedin' },
    { label: 'Twitter',  href: TWITTER_URL,  icon: 'twitter'  },
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
