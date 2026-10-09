import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ConsentModal } from './consent/consent-modal';
import { ConsentStateNotice } from './consent/consent-state-notice';
import { SiteFooter } from './shell/site-footer';
import { SiteNav } from './shell/site-nav';
import { Translate } from './content/translate';

/**
 * The application shell: skip link, cookie question, navigation, page, footer.
 *
 * Standalone with its dependencies imported here, no NgModule anywhere (PO,
 * 2026-10-09).
 */
@Component({
  imports: [RouterOutlet, ConsentModal, ConsentStateNotice, SiteNav, SiteFooter],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly skipLabel = inject(Translate).t('nav.skip');
}
