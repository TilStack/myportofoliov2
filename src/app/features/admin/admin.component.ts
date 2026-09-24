import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { I18nService } from '../../core/services/i18n.service';

/**
 * Espace admin : connexion Google. Route non pré-rendue, hors sitemap, noindex
 * (balise robots via SeoService, plus en-tête X-Robots-Tag dans firebase.json).
 * Aucun lien public n'y mène ; les droits réels sont dans firestore.rules.
 */
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  readonly i18n  = inject(I18nService);
  readonly admin = inject(AdminAuthService);

  readonly busy  = signal(false);
  readonly error = signal<'forbidden' | 'failed' | null>(null);

  ngOnInit(): void {
    void this.admin.load();
  }

  async signIn(): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.admin.signIn();
    } catch (e) {
      // 'not-admin' : compte refusé et déconnecté ; le reste (popup fermée, réseau…) : échec générique.
      this.error.set((e as Error).message === 'not-admin' ? 'forbidden' : 'failed');
    } finally {
      this.busy.set(false);
    }
  }

  signOut(): void {
    void this.admin.signOut();
  }
}
