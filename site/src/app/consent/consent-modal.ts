import { A11yModule, LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, computed, effect, inject, untracked } from '@angular/core';

import { PageLanguage } from '../i18n/page-language';
import { CONSENT_COPY } from './consent-copy';
import { ConsentStore } from './consent-store';

/**
 * The cookie dialog: accept, or the site is not usable.
 *
 * Two buttons and no third way, because there is one cookie category and it is
 * the technically necessary one (PO, 2026-10-09). There is deliberately **no
 * close button and no dismiss on Escape**: closing without answering would
 * leave the visitor in the undecided state the dialog exists to resolve, and
 * the dialog would be back on the next page view. Refusing is the way out, and
 * it is a button with a label rather than a cross in a corner.
 *
 * Accessibility is Angular's own rather than hand-rolled ARIA (PO,
 * 2026-10-09): `cdkTrapFocus` with auto-capture keeps the keyboard inside the
 * dialog and restores focus where it was, and [LiveAnnouncer] announces the
 * dialog for a screen reader. Both buttons are real `<button>` elements, so
 * NVDA reads them as buttons and Space and Enter both work - a `<div>` with a
 * click handler reads as nothing and is operable by neither.
 */
@Component({
  selector: 'site-consent-modal',
  imports: [A11yModule],
  template: `
    @if (!store.decided()) {
      <div class="consent-scrim">
        <div
          class="consent-dialog"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          [attr.aria-describedby]="bodyId"
          cdkTrapFocus
          [cdkTrapFocusAutoCapture]="true"
        >
          <h2 class="consent-dialog__title" [id]="titleId">{{ copy().title }}</h2>
          <p class="consent-dialog__body" [id]="bodyId">{{ copy().body }}</p>
          <div class="consent-dialog__actions">
            <button type="button" class="consent-button" (click)="store.accept()">
              {{ copy().accept }}
            </button>
            <button type="button" class="consent-button consent-button--quiet"
                    (click)="store.reject()">
              {{ copy().reject }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './consent.css',
})
export class ConsentModal {
  protected readonly store = inject(ConsentStore);
  private readonly pageLanguage = inject(PageLanguage);
  private readonly announcer = inject(LiveAnnouncer);

  protected readonly titleId = 'consent-dialog-title';
  protected readonly bodyId = 'consent-dialog-body';

  protected readonly copy = computed(() => CONSENT_COPY[this.pageLanguage.lang()]);

  constructor() {
    // Announced once while the question is open, and again never: an
    // announcement that repeats on every language change or re-render talks
    // over whatever the visitor was reading.
    effect(() => {
      if (!this.store.decided()) {
        untracked(() => this.announcer.announce(this.copy().announce, 'assertive'));
      }
    });
  }
}
