import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { ConsentGate } from '../../consent/consent-gate';
import { SHOP_CONFIG } from '../../content/shop-config';
import { Translate } from '../../content/translate';

/** Which of the licence server's two views a frame shows. */
export type ShopView = 'buy' | 'account';

/**
 * The licence server's shop or account view, framed behind the consent gate.
 *
 * Its own component because two pages need it since the pricing merge
 * (enigma2_player-eer): the account page, and the buy section of the merged
 * pricing page. The gate, the lazy loading, the referrer policy and the
 * fallback link are the parts that must not differ between them - a second
 * copy is how one of the two ends up loading the frame before the visitor
 * agreed to it.
 *
 * The iframe is INSIDE the gate, and that is the one thing here that is not a
 * port but a decision (PO, 2026-10-09): loading it sends the visitor's IP and
 * their request to the licence server, so it waits for acceptance. Before that
 * the gate explains why nothing is there - a blocked area with a reason beats
 * an empty one. `loading="lazy"` on top of that: even after consent the frame
 * is only fetched when it comes into view.
 */
@Component({
  selector: 'site-shop-frame',
  imports: [ConsentGate],
  template: `
    @if (src()) {
      <site-consent-gate>
        <iframe
          class="shop-frame"
          [src]="trustedSrc()"
          [title]="frameTitle()"
          loading="lazy"
          referrerpolicy="no-referrer"
        ></iframe>
        <p class="shop-fallback">
          <a [href]="src()" target="_blank" rel="noopener">{{ copy().openTab }}</a>
        </p>
      </site-consent-gate>
    } @else {
      <p role="note">{{ copy().unavailable }}</p>
    }
  `,
  styleUrl: './shop.css',
})
export class ShopFrame {
  /** Which view to frame. */
  readonly view = input.required<ShopView>();

  /**
   * The iframe's accessible name.
   *
   * Required rather than derived: an iframe without a title is announced as
   * "frame" (WCAG 4.1.2), and the page that embeds it is the one that knows
   * what it is embedding there.
   */
  readonly frameTitle = input.required<string>();

  private readonly sanitizer = inject(DomSanitizer);
  private readonly translate = inject(Translate);

  protected readonly copy = this.translate.group({
    openTab: 'shop.openTab',
    unavailable: 'shop.unavailable',
  });

  /**
   * The licence server's URL for this view and the page's language, or null
   * when the build had no shop configured - in which case the page says so
   * instead of framing an empty box.
   */
  protected readonly src = computed(() => {
    const { base, apiKey } = SHOP_CONFIG;
    if (!base || !apiKey) {
      return null;
    }
    const path = this.view() === 'account' ? 'account' : 'shop';
    return `${base.replace(/\/+$/, '')}/${path}/${apiKey}?lang=${this.translate.lang()}`;
  });

  /**
   * The same URL, marked as trusted for an iframe.
   *
   * Angular refuses a plain string in a resource-URL position, and it is right
   * to: that position executes whatever it is given. Bypassing the check is
   * safe HERE and nowhere else, because every part of the URL is ours - the
   * base and the api key come from the data file the build wrote, and the
   * language is one of five literals from the route tree. No visitor input
   * reaches it, which is exactly the condition under which marking a URL
   * trusted is a statement of fact rather than a hope.
   */
  protected readonly trustedSrc = computed<SafeResourceUrl | null>(() => {
    const url = this.src();
    return url === null ? null : this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });
}
