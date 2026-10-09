import { Component, computed, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { ConsentGate } from '../../consent/consent-gate';
import { PageBase } from '../page-base';
import { SHOP_CONFIG } from '../../content/shop-config';

/** Which of the licence server's two views this route wants. */
export type ShopView = 'buy' | 'account';

/**
 * Buying and the customer account, both of which happen on the licence server.
 *
 * This page only frames them. Purchase, login and account management are
 * implemented there (licence server ADR-0005), and the server must allow this
 * origin via `EMBED_ALLOWED_ORIGINS`.
 *
 * The iframe is INSIDE the consent gate, and that is the one thing about this
 * page that is not a port but a decision (PO, 2026-10-09): loading it sends
 * the visitor's IP and their request to the licence server, so it waits for
 * acceptance. Before that the gate explains why nothing is there - a blocked
 * area with a reason beats an empty one.
 *
 * `loading="lazy"` on top of that: even after consent the frame is only
 * fetched when it comes into view.
 */
@Component({
  selector: 'site-shop',
  imports: [ConsentGate],
  template: `
    <main class="page">
      <h1>{{ title() }}</h1>
      <p>{{ intro() }}</p>

      @if (src()) {
        <site-consent-gate>
          <iframe
            class="shop-frame"
            [src]="trustedSrc()"
            [title]="title()"
            loading="lazy"
            referrerpolicy="no-referrer"
          ></iframe>
          <p class="shop-fallback">
            <a [href]="src()" target="_blank" rel="noopener">{{ copy().openTab }}</a>
          </p>
        </site-consent-gate>
      } @else {
        <p>{{ copy().unavailable }}</p>
      }
    </main>
  `,
  styleUrls: ['../page.css', './shop.css'],
})
export class Shop extends PageBase {
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly view = computed<ShopView>(() =>
    this.route.snapshot.data['view'] === 'account' ? 'account' : 'buy',
  );

  protected readonly copy = this.translate.group({
    buy: 'nav.buy',
    buyIntro: 'buy.intro',
    account: 'nav.account',
    accountIntro: 'account.intro',
    openTab: 'shop.openTab',
    unavailable: 'shop.unavailable',
  });

  protected readonly title = computed(() =>
    this.view() === 'account' ? this.copy().account : this.copy().buy,
  );

  protected readonly intro = computed(() =>
    this.view() === 'account' ? this.copy().accountIntro : this.copy().buyIntro,
  );

  /** Two views behind one component, so the title cannot come from the route. */
  protected override titleKey() {
    return this.view() === 'account' ? ('nav.account' as const) : ('nav.buy' as const);
  }

  /**
   * The licence server's view for this page and language, or null when the
   * build had no shop configured - in which case the page says so instead of
   * framing an empty box.
   */
  protected readonly src = computed(() => {
    const { base, apiKey } = SHOP_CONFIG;
    if (!base || !apiKey) {
      return null;
    }
    const path = this.view() === 'account' ? 'account' : 'shop';
    return `${base.replace(/\/+$/, '')}/${path}/${apiKey}?lang=${this.lang()}`;
  });

  /**
   * The same URL, marked as trusted for an iframe.
   *
   * Angular refuses a plain string in a resource-URL position, and it is right
   * to: that position executes whatever it is given. Bypassing the check is
   * safe HERE and nowhere else in this file, because every part of the URL is
   * ours - the base and the api key come from the data file the build wrote,
   * and the language is one of five literals from the route tree. No visitor
   * input reaches it, which is exactly the condition under which marking a URL
   * trusted is a statement of fact rather than a hope.
   */
  protected readonly trustedSrc = computed<SafeResourceUrl | null>(() => {
    const url = this.src();
    return url === null ? null : this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });
}
