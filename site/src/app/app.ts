import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ConsentModal } from './consent/consent-modal';
import { ConsentStateNotice } from './consent/consent-state-notice';
import { SiteFooter } from './shell/site-footer';

/**
 * The application shell: the cookie question, the page, the footer.
 *
 * Standalone with its dependencies imported here, no NgModule anywhere (PO,
 * 2026-10-09).
 */
@Component({
  imports: [RouterOutlet, ConsentModal, ConsentStateNotice, SiteFooter],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
