import { Component } from '@angular/core';

import { PageBase } from '../page-base';
import { ShopFrame } from './shop-frame';

/**
 * The customer account, which lives on the licence server.
 *
 * This page only frames it. Login, licences, devices and invoices are
 * implemented there (licence server ADR-0005), and the server must allow this
 * origin via `EMBED_ALLOWED_ORIGINS`.
 *
 * It framed buying as well until the PO merged pricing, licence information
 * and buying into one page (enigma2_player-eer); the buy view now sits in the
 * merged page's last section, through the same `ShopFrame`.
 */
@Component({
  selector: 'site-shop',
  imports: [ShopFrame],
  template: `
    <main class="page">
      <h1>{{ copy().account }}</h1>
      <p>{{ copy().intro }}</p>

      <site-shop-frame view="account" [frameTitle]="copy().frame" />
    </main>
  `,
  styleUrls: ['../page.css', './shop.css'],
})
export class Shop extends PageBase {
  protected readonly copy = this.translate.group({
    account: 'nav.account',
    intro: 'account.intro',
    // The frame is named after what it IS - someone else's application - and
    // deliberately not after this page's heading: a screen reader reads both,
    // and "heading My Account ... frame My Account" sounds like the heading
    // twice rather than like an embedded account view (enigma2_player-dp3).
    frame: 'shop.frameAccount',
  });

  /** The sentence a search result shows for the account page. */
  protected override descriptionKey() {
    return 'account.intro' as const;
  }
}
