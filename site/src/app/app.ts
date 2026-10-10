import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ConsentModal } from './consent/consent-modal';
import { ConsentStateNotice } from './consent/consent-state-notice';
import { DemoNotice } from './shell/demo-notice';
import { SiteFooter } from './shell/site-footer';
import { SiteNav } from './shell/site-nav';
import { RouteAnnouncer } from './i18n/route-announcer';
import { Translate } from './content/translate';

/**
 * The application shell: skip link, cookie question, navigation, page, footer.
 *
 * Standalone with its dependencies imported here, no NgModule anywhere (PO,
 * 2026-10-09).
 */
@Component({
  imports: [RouterOutlet, ConsentModal, ConsentStateNotice, DemoNotice, SiteNav, SiteFooter],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly skipLabel = inject(Translate).t('nav.skip');

  /**
   * Injected for its side effect, which is the point of it: a single-page
   * application changes the page without a page load, and without this a
   * screen reader is never told that anything happened (enigma2_player-iaa).
   */
  private readonly announcer = inject(RouteAnnouncer);
}
