import { Component, computed, inject } from '@angular/core';

import { PageLanguage } from '../i18n/page-language';
import { CONSENT_COPY } from './consent-copy';
import { ConsentStore } from './consent-store';

/**
 * Wraps anything that may only run with consent, and says so when it may not.
 *
 * Blocked means *visibly explained*, not simply gone: a button that does
 * nothing is worse than one with a reason next to it (PO, 2026-10-09). So the
 * blocked state renders the reason and an accept button, which is also the
 * second place consent can be given - next to the thing the visitor actually
 * wanted, which is where the question finally makes sense to them.
 *
 * Used by the shop embed and every path into a purchase. Those arrive with
 * `enigma2_player-n5j`; until then the landing page carries one gated region
 * so the mechanism is exercised by the end-to-end tests rather than only by
 * unit tests.
 */
@Component({
  selector: 'site-consent-gate',
  template: `
    @if (store.accepted()) {
      <ng-content />
    } @else {
      <div class="consent-blocked" role="note">
        <p class="consent-blocked__reason">{{ copy().blocked }}</p>
        <!--
          The accept button appears only once a decision exists - which in
          practice means after a refusal. While the dialog is still open the
          question is already in front of the visitor, and a second identical
          button behind the scrim is one control too many: ambiguous to read
          out, and ambiguous to automate against, which is how the end-to-end
          test found it.
        -->
        @if (store.decided()) {
          <button type="button" class="consent-button" (click)="store.accept()">
            {{ copy().accept }}
          </button>
        }
      </div>
    }
  `,
  styleUrl: './consent.css',
})
export class ConsentGate {
  protected readonly store = inject(ConsentStore);
  private readonly pageLanguage = inject(PageLanguage);

  protected readonly copy = computed(() => CONSENT_COPY[this.pageLanguage.lang()]);
}
