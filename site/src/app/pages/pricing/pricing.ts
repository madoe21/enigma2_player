import { Component, computed, inject } from '@angular/core';

import { PageBase } from '../page-base';
import { ShopFrame } from '../shop/shop-frame';
import { SiteContent } from '../../content/site-content';
import { getLicenseInfo } from '../../content/content';

/**
 * What a licence costs, what it covers, and where to buy it - one page.
 *
 * Three pages until the PO merged them (enigma2_player-eer): `/pricing` showed
 * prices and sent the visitor to `/buy`, `/license` explained what a licence
 * covers, and `/buy` framed the shop. Nobody buys without reading all three,
 * so the split made a purchase a three-page walk and put the same question -
 * "what do I get for this?" - on a page the price list only linked to. The two
 * old paths stay as aliases that render this page (`canonicalOf` in
 * `app.routes.ts`).
 *
 * The price list is baked in by the build rather than fetched from the licence
 * server in the visitor's browser (PO, 2026-10-09): the page works without
 * JavaScript, and the visitor's IP does not reach the licence server before
 * they chose to go to the shop. As of the current build the licence server
 * returns no price models for this application - the endpoint answers, the
 * list is simply empty - so the first section shows its "nothing available"
 * text. That is the truth about the shop today, not a defect here
 * (`license_server-ip22` has the shop work).
 */
@Component({
  selector: 'site-pricing',
  imports: [ShopFrame],
  template: `
    <main class="page">
      <h1>{{ copy().title }}</h1>
      <p>{{ copy().intro }}</p>

      @if (models().length === 0) {
        <p>{{ copy().empty }}</p>
      } @else {
        <ul class="price-list">
          @for (model of models(); track model.id) {
            <li class="price-card">
              <!--
                The model's name is a paragraph and not a heading: the headings
                on this page are its three sections, and three price cards
                between them would turn the outline a screen-reader user
                navigates by into a product list.
              -->
              <p class="price-card__name">{{ model.name }}</p>
              <p class="price-card__amount">{{ model.price.toFixed(2) }} {{ model.currency }}</p>
              <p class="price-card__period muted">
                {{ period(model.period) }} · {{ model.devices }} {{ copy().devices }}
              </p>
              <a class="btn" [href]="buyHref">{{ copy().cta }}</a>
            </li>
          }
        </ul>
      }

      <section class="block">
        <h2>{{ copy().license }}</h2>
        @for (block of licenseBlocks(); track block.heading) {
          <section class="block">
            <h3>{{ block.heading }}</h3>
            <p>{{ block.body }}</p>
          </section>
        }
      </section>

      <section class="block" id="buy">
        <h2>{{ copy().buy }}</h2>
        <p>{{ copy().buyIntro }}</p>

        <site-shop-frame view="buy" [frameTitle]="copy().frame" />
      </section>
    </main>
  `,
  styleUrls: ['../page.css', './pricing.css'],
})
export class Pricing extends PageBase {
  protected readonly models = inject(SiteContent).prices;

  protected readonly copy = this.translate.group({
    title: 'nav.pricing',
    intro: 'pricing.intro',
    empty: 'pricing.empty',
    devices: 'pricing.devices',
    cta: 'nav.buy',
    license: 'nav.license',
    buy: 'nav.buy',
    // Not `buy` again: the frame sits directly under that heading, and a
    // reader hearing "heading Buy ... frame Buy" learns nothing about what is
    // inside it (enigma2_player-dp3).
    frame: 'shop.frameBuy',
    buyIntro: 'buy.intro',
    monthly: 'pricing.period.monthly',
    yearly: 'pricing.period.yearly',
    lifetime: 'pricing.period.lifetime',
  });

  protected readonly licenseBlocks = computed(() => getLicenseInfo(this.lang()));

  /**
   * Where a price card's button goes: the buy section of this page.
   *
   * A fragment rather than a route, because the thing it used to link to is
   * now three screens further down the same document. A plain `href` and not
   * `routerLink`: the page is prerendered and this has to work with JavaScript
   * off, which is the whole premise of the site.
   */
  protected readonly buyHref = '#buy';

  /** The period in words, or the raw value for one this build does not know. */
  protected period(period: string): string {
    const labels = this.copy();
    return (
      { monthly: labels.monthly, yearly: labels.yearly, lifetime: labels.lifetime }[period] ??
      period
    );
  }
}
