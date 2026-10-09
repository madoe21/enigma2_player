import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ConsentGate } from '../../consent/consent-gate';
import { PageBase } from '../page-base';
import { localePath } from '../../i18n/locales';
import { SiteContent } from '../../content/site-content';

/**
 * The start page: what this is, what it costs nothing to try, and where to go.
 *
 * Ported from the Astro `Landing.astro` with its hero, its two calls to action
 * and its five highlights, all from the same `ui.ts` keys. One addition that
 * the old page could not have: the version on offer, because the build knows
 * it now (`enigma2_player-n5j`).
 */
@Component({
  selector: 'site-landing',
  imports: [RouterLink, ConsentGate],
  template: `
    <main class="page">
      <section class="hero">
        <h1>{{ copy().heroTitle }}</h1>
        <p class="hero__sub">{{ copy().heroSub }}</p>
        <div class="cta-row">
          <a class="btn btn--primary" [routerLink]="downloadsHref()">{{ copy().ctaDownload }}</a>
          <a class="btn" [routerLink]="buyHref()">{{ copy().ctaBuy }}</a>
        </div>
        @if (release(); as release) {
          <p class="muted">{{ copy().latest }}: {{ release.version }}</p>
        }
      </section>

      <section class="features">
        <h2>{{ copy().featuresTitle }}</h2>
        <ul class="card-grid">
          @for (highlight of highlights(); track highlight) {
            <li class="card">{{ highlight }}</li>
          }
        </ul>
      </section>

      <!--
        The purchase path, gated like every other one: the shop frame loads
        from the licence server, so it waits for the cookie decision
        (enigma2_player-vmk). The gate explains itself when it blocks.
      -->
      <section class="buy-teaser">
        <h2>{{ copy().ctaBuy }}</h2>
        <site-consent-gate>
          <p><a class="btn btn--primary" [routerLink]="buyHref()">{{ copy().ctaBuy }}</a></p>
        </site-consent-gate>
      </section>
    </main>
  `,
  styleUrls: ['../page.css', './landing.css'],
})
export class Landing extends PageBase {
  protected readonly release = inject(SiteContent).release;

  protected readonly copy = this.translate.group({
    heroTitle: 'home.hero.title',
    heroSub: 'home.hero.sub',
    ctaDownload: 'home.cta.download',
    ctaBuy: 'home.cta.buy',
    featuresTitle: 'home.features.title',
    latest: 'downloads.latest',
    multi: 'home.f.multi',
    stream: 'home.f.stream',
    subs: 'home.f.subs',
    cross: 'home.f.cross',
    license: 'home.f.license',
  });

  /** The same five highlights, in the same order, as the Astro page. */
  protected readonly highlights = computed(() => {
    const copy = this.copy();
    return [copy.multi, copy.stream, copy.subs, copy.cross, copy.license];
  });

  /** The start page is titled with the site name, not with a page name. */
  protected override titleKey() {
    return null;
  }

  protected override descriptionKey() {
    return 'home.hero.sub' as const;
  }

  protected readonly downloadsHref = computed(() => localePath('downloads', this.lang()));
  protected readonly buyHref = computed(() => localePath('buy', this.lang()));
}
