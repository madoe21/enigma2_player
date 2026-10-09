import { Component, computed, inject } from '@angular/core';

import { PageLanguage } from '../i18n/page-language';
import { CONSENT_COPY } from './consent-copy';
import { ConsentStore } from './consent-store';

/**
 * After a refusal, the page says what state it is in.
 *
 * The requirement is that declining leads to a page that explains itself, not
 * to a page that silently does less (PO, 2026-10-09). A visitor who refused
 * and then finds the shop missing would otherwise read it as a broken site -
 * and the honest version is cheaper than the support mail.
 *
 * `role="status"` rather than an alert: it is the page describing itself, not
 * an error, and an assertive live region would interrupt whatever a screen
 * reader is reading at the time.
 */
@Component({
  selector: 'site-consent-state-notice',
  template: `
    @if (store.rejected()) {
      <aside class="consent-notice" role="status">
        <h2 class="consent-notice__title">{{ copy().refusedTitle }}</h2>
        <p class="consent-notice__body">{{ copy().refusedBody }}</p>
        <button type="button" class="consent-button" (click)="store.accept()">
          {{ copy().accept }}
        </button>
      </aside>
    }
  `,
  styleUrl: './consent.css',
})
export class ConsentStateNotice {
  protected readonly store = inject(ConsentStore);
  private readonly pageLanguage = inject(PageLanguage);

  protected readonly copy = computed(() => CONSENT_COPY[this.pageLanguage.lang()]);
}
