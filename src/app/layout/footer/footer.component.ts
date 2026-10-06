import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';
import {
  CONTACT_EMAIL, DEVPEA_URL, GITHUB_URL, LINKEDIN_URL, PERSON_NAME, TWITTER_URL,
} from '../../data/site.data';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  i18n = inject(I18nService);
  year = new Date().getFullYear();
  readonly personName = PERSON_NAME;
  readonly githubUrl = GITHUB_URL;
  readonly linkedinUrl = LINKEDIN_URL;
  readonly twitterUrl = TWITTER_URL;
  readonly devpeaUrl = DEVPEA_URL;
  readonly contactEmail = CONTACT_EMAIL;
  readonly mailtoHref = `mailto:${CONTACT_EMAIL}`;
}
