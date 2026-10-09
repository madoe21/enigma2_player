import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageBase } from '../page-base';
import { localePath } from '../../i18n/locales';
import { SiteContent } from '../../content/site-content';

/**
 * What a licence costs. No login, and nothing to buy here - buying is /buy.
 *
 * The price list is baked in by the build rather than fetched from the licence
 * server in the visitor's browser (PO, 2026-10-09): the page works without
 * JavaScript, and the visitor's IP does not reach the licence server before
 * they chose to go to the shop.
 *
 * As of the current build the licence server returns no price models for this
 * application - the endpoint answers, the list is simply empty - so this page
 * shows its "nothing available" text. That is the truth about the shop today,
 * not a defect here (`license_server-ip22` has the shop work).
 */
@Component({
  selector: 'site-pricing',
  imports: [RouterLink],
  template: `
    <main class="page">
      <h1>{{ copy().title }}</h1>
      <p>{{ copy().intro }}</p>

      @if (models().length === 0) {
        <p>{{ copy().empty }}</p>
      } @else {
        <div class="price-list">
          @for (model of models(); track model.id) {
            <article class="price-card">
              <h2 class="price-card__name">{{ model.name }}</h2>
              <p class="price-card__amount">{{ model.price.toFixed(2) }} {{ model.currency }}</p>
              <p class="price-card__period muted">
                {{ period(model.period) }} · {{ model.devices }} {{ copy().devices }}
              </p>
              <a class="btn" [routerLink]="buyHref()">{{ copy().cta }}</a>
            </article>
          }
        </div>
      }
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
    monthly: 'pricing.period.monthly',
    yearly: 'pricing.period.yearly',
    lifetime: 'pricing.period.lifetime',
  });

  protected readonly buyHref = computed(() => localePath('buy', this.lang()));

  /** The period in words, or the raw value for one this build does not know. */
  protected period(period: string): string {
    const labels = this.copy();
    return (
      { monthly: labels.monthly, yearly: labels.yearly, lifetime: labels.lifetime }[period] ??
      period
    );
  }
}
