import { Component, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
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
  private readonly document = inject(DOCUMENT);

  form = this.fb.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  readonly email = CONTACT_EMAIL;

  socials = [
    { label: 'GitHub',   href: GITHUB_URL,   icon: 'github'   },
    { label: 'LinkedIn', href: LINKEDIN_URL, icon: 'linkedin' },
    { label: 'Twitter',  href: TWITTER_URL,  icon: 'twitter'  },
  ];

  /** Ouvre le client mail du visiteur avec sujet et message pré-remplis (aucun envoi simulé). */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, message } = this.form.getRawValue();
    const subject = `${this.i18n.t('contact.mailtoSubject')} — ${name}`;
    const body = `${message}\n\n— ${name} (${email})`;

    this.document.defaultView!.location.href =
      `mailto:${this.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  hasError(field: string, err: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.hasError(err) && ctrl?.touched);
  }
}
