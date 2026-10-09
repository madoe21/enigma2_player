import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CONSENT_COPY } from '../consent/consent-copy';
import { ConsentStore } from '../consent/consent-store';
import { LegalLinks } from '../legal/legal-links';
import { Translate } from '../content/translate';
import { PageLanguage } from '../i18n/page-language';

/**
 * The footer: the legal links, and the way back out of the cookie decision.
 *
 * Both are here because both have to be on *every* page - an imprint that is
 * only reachable from the start page is not reachable in the sense §5 DDG
 * means ("easily recognisable, directly accessible"), and a consent decision
 * that can only be given and never taken back is not a decision.
 *
 * The rest of the footer - the product links, the download pointers - arrives
 * with `enigma2_player-n5j`. It folds into this element rather than adding a
 * second one.
 */
@Component({
  selector: 'site-footer',
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <nav class="site-footer__links" [attr.aria-label]="copy().legalNav">
        <ul>
          @for (link of legal.links(); track link.id) {
            <li><a [routerLink]="link.href">{{ link.label }}</a></li>
          }
        </ul>
      </nav>
      <button type="button" class="site-footer__action" (click)="revoke()">
        {{ copy().revoke }}
      </button>
      <!-- The note the Astro footer carried. Missing it was the third thing
           the comparison against the old build caught. -->
      <p class="site-footer__note">{{ note() }}</p>
    </footer>
  `,
  styleUrl: '../consent/consent.css',
})
export class SiteFooter {
  private readonly store = inject(ConsentStore);
  private readonly pageLanguage = inject(PageLanguage);
  private readonly announcer = inject(LiveAnnouncer);

  protected readonly legal = inject(LegalLinks);

  protected readonly note = inject(Translate).t('footer.note');

  protected readonly copy = computed(() => CONSENT_COPY[this.pageLanguage.lang()]);

  /**
   * Forgets the decision and says so.
   *
   * The announcement matters more here than it looks: the visible consequence
   * is a dialog that reappears above the fold, and a screen reader user who
   * pressed a button down in the footer needs to be told that, not left to
   * discover it.
   */
  protected revoke(): void {
    this.store.revoke();
    this.announcer.announce(this.copy().revoked, 'polite');
  }
}
