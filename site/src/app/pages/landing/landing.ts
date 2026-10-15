import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ConsentGate } from '../../consent/consent-gate';
import { PageBase } from '../page-base';
import { getScreenshots, shotSource } from '../../content/content';
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
        <div class="hero__text">
          <h1>{{ copy().heroTitle }}</h1>
          <p class="hero__sub">{{ copy().heroSub }}</p>
          <div class="cta-row">
            <a class="btn btn--primary" [routerLink]="downloadsHref()">{{ copy().ctaDownload }}</a>
            <a class="btn" [routerLink]="buyHref()">{{ copy().ctaBuy }}</a>
          </div>
          @if (release(); as release) {
            <p class="muted">{{ copy().latest }}: {{ release.version }}</p>
          }
        </div>

        <!--
          The product, shown rather than described (PO, 2026-10-15). The image
          and its alternative text are the gallery's own first screenshot, so
          the sentence a screen reader gets is translated with everything else
          and no new key had to be invented for a picture.
        -->
        @if (heroShot(); as shot) {
          <div class="hero__media">
            <img
              class="hero__image"
              [src]="shotSource(shot)"
              [alt]="shot.caption"
              width="1200"
              height="675"
            />
          </div>
        }
      </section>

      <section class="features">
        <h2>{{ copy().featuresTitle }}</h2>
        <ul class="card-grid">
          @for (highlight of highlights(); track highlight) {
            <li class="card card--highlight">{{ highlight }}</li>
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
          <p>
            <a class="btn btn--primary" [routerLink]="buyHref()">{{ copy().ctaBuy }}</a>
          </p>
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

  /**
   * The gallery's first screenshot, borrowed as the hero image.
   *
   * Borrowed on purpose: its `caption` is already translated in all five
   * languages, so the hero needs no new dictionary key and no literal in the
   * template (`check:literals`). `?? null` because `@if` wants a falsy value,
   * and because a locale without screenshots must drop the image, not crash.
   */
  protected readonly heroShot = computed(() => getScreenshots(this.lang())[0] ?? null);

  /** The shared path builder, reachable from the template. */
  protected readonly shotSource = shotSource;

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
