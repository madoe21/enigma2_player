import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, computed, inject } from '@angular/core';

import { CONSENT_COPY } from '../consent/consent-copy';
import { ConsentStore } from '../consent/consent-store';
import { PageLanguage } from '../i18n/page-language';

/**
 * The footer, which for now exists for one reason: the way back out.
 *
 * Consent has to be withdrawable at any time, and the place a visitor looks
 * for it is the footer (PO, 2026-10-09). A decision that can only be given and
 * never taken back is not a decision.
 *
 * Deliberately minimal. The real footer - imprint, cookie policy, the other
 * links - arrives with `enigma2_player-esp` and `-n5j`; this is the control
 * those beads fold in, not a competing footer. It is a `<button>` and not a
 * link because it performs an action rather than navigating somewhere.
 */
@Component({
  selector: 'site-footer',
  template: `
    <footer class="site-footer">
      <button type="button" class="site-footer__action" (click)="revoke()">
        {{ copy().revoke }}
      </button>
    </footer>
  `,
  styleUrl: '../consent/consent.css',
})
export class SiteFooter {
  private readonly store = inject(ConsentStore);
  private readonly pageLanguage = inject(PageLanguage);
  private readonly announcer = inject(LiveAnnouncer);

  protected readonly copy = computed(() => CONSENT_COPY[this.pageLanguage.lang()]);

  /**
   * Forgets the decision and says so.
   *
   * The announcement matters more here than it looks: the visible consequence
   * is a dialog that reappears, and a screen reader user who pressed a button
   * in the footer needs to be told that, not left to discover it.
   */
  protected revoke(): void {
    this.store.revoke();
    this.announcer.announce(this.copy().revoked, 'polite');
  }
}
