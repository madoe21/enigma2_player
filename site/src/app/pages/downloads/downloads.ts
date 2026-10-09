import { Component, inject } from '@angular/core';

import { PageBase } from '../page-base';
import { SITE_DATA } from '../../content/site-data';
import { SiteContent } from '../../content/site-content';

/**
 * The download buttons for the latest release.
 *
 * The release is baked in by the build (`tool/fetch-site-data.mjs`) rather
 * than fetched from `api.github.com` in the visitor's browser, which is what
 * the Astro version did. Two reasons, and the second is the deciding one: the
 * page now works with JavaScript switched off, and a visitor's IP address no
 * longer reaches GitHub before they have agreed to anything - the cookie
 * policy says this site loads nothing from anyone else's server, and it has to
 * be true (PO, 2026-10-09).
 *
 * The cost is honest and small: the list is as fresh as the last build, and a
 * new release *is* a build.
 */
@Component({
  selector: 'site-downloads',
  template: `
    <main class="page">
      <h1>{{ copy().title }}</h1>
      <p>{{ copy().intro }}</p>

      @if (release(); as release) {
        <p class="muted">{{ copy().latest }}: {{ release.version }}</p>
        <ul class="download-list">
          @for (row of release.downloads; track row.url) {
            <li class="download-row">
              <span class="download-row__platform">{{ row.label }}</span>
              <span class="muted">{{ row.file }}</span>
              <a class="btn" [href]="row.url">{{ copy().cta }}</a>
            </li>
          }
        </ul>
      } @else {
        <p>{{ copy().empty }}</p>
      }

      <p><a [href]="allReleases">{{ copy().viewAll }}</a></p>
      <p class="muted">{{ copy().stores }}</p>
    </main>
  `,
  styleUrls: ['../page.css', './downloads.css'],
})
export class Downloads extends PageBase {
  protected readonly release = inject(SiteContent).release;
  protected readonly allReleases = `https://github.com/${SITE_DATA.repo ?? 'madoe21/enigma2_player'}/releases`;

  protected readonly copy = this.translate.group({
    title: 'nav.downloads',
    intro: 'downloads.intro',
    latest: 'downloads.latest',
    empty: 'downloads.empty',
    cta: 'downloads.cta',
    viewAll: 'downloads.viewAll',
    stores: 'downloads.stores',
  });
}
