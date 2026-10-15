import { A11yModule, LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, afterNextRender, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LegalLinks } from '../legal/legal-links';
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
  imports: [A11yModule, RouterLink],
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
          <!--
            Focus lands on the TITLE, not on the first tabbable element
            (enigma2_player-ulv). Auto-capture would otherwise start at the
            imprint link in the middle of the dialog - which a screen reader
            reads as a link out of context, and which at 400 % zoom scrolls the
            256 px window straight past the question being asked. The accept
            button would be worse: focus on it means Enter consents to
            something nobody has read yet.
          -->
          <h2 class="consent-dialog__title" [id]="titleId" tabindex="-1" cdkFocusInitial>
            {{ copy().title }}
          </h2>
          <p class="consent-dialog__body" [id]="bodyId">{{ copy().body }}</p>
          <!--
            The legal texts, reachable BEFORE the answer is given: consent to
            something the visitor cannot read first is not informed consent,
            and §5 DDG wants the imprint directly accessible.

            They are repeated here rather than left to the footer because this
            dialog is modal - its scrim covers the footer and its focus trap
            keeps the keyboard out of it, so for an undecided visitor the
            footer does not exist. The end-to-end test found that by trying to
            click the footer link through the scrim (enigma2_player-esp).
          -->
          <!--
            A list and not a <nav>: the footer already has a navigation
            landmark called "Rechtliches", and two landmarks with the same name
            are indistinguishable when a screen reader lists them (axe
            landmark-unique). Inside a dialog the list semantics are enough.
          -->
          <ul class="consent-dialog__legal">
            @for (link of legal.links(); track link.id) {
              <li>
                <a [routerLink]="link.href">{{ link.label }}</a>
              </li>
            }
          </ul>
          <p class="consent-dialog__policy">
            <a [routerLink]="policy().href">{{ copy().policyLink }}</a>
          </p>
          <div class="consent-dialog__actions">
            <button type="button" class="consent-button" (click)="store.accept()">
              {{ copy().accept }}
            </button>
            <button
              type="button"
              class="consent-button consent-button--quiet"
              (click)="store.reject()"
            >
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

  protected readonly legal = inject(LegalLinks);

  protected readonly policy = this.legal.cookiePolicy;

  protected readonly titleId = 'consent-dialog-title';
  protected readonly bodyId = 'consent-dialog-body';

  protected readonly copy = computed(() => CONSENT_COPY[this.pageLanguage.lang()]);

  constructor() {
    // Announced once, in the browser, after the first render - not in an
    // effect during it. Two reasons, and the second was a bug in the
    // prerendered files: an effect fires before the routed page has published
    // its language, so /en/ shipped a German announcement inside its live
    // region. And a live region should start empty: text baked into it is text
    // a screen reader may read at load, out of context.
    afterNextRender(() => {
      if (!this.store.decided()) {
        this.announcer.announce(this.copy().announce, 'assertive');
      }
    });
  }
}
