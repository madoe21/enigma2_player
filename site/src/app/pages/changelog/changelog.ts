import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { PageBase } from '../page-base';
import { SiteContent } from '../../content/site-content';

/**
 * What changed per release.
 *
 * Baked in at build time for the same reason as the downloads, and rendered as
 * TEXT rather than as markup - `white-space: pre-line` keeps the line breaks.
 * That is the Astro version's decision and it stands: no markdown parser means
 * no path from a release note into the page as HTML, and a release note is
 * written by us but travels through an API.
 */
@Component({
  selector: 'site-changelog',
  imports: [DatePipe],
  template: `
    <main class="page">
      <h1>{{ copy().title }}</h1>
      <p>{{ copy().intro }}</p>

      @if (releases().length === 0) {
        <p>{{ copy().empty }}</p>
      } @else {
        @for (release of releases(); track release.tag) {
          <section class="block">
            <h2>
              {{ release.name }}
              @if (release.publishedAt) {
                <span class="muted"> · {{ release.publishedAt | date: 'longDate' : undefined : lang() }}</span>
              }
              @if (release.prerelease) {
                <span class="muted"> · {{ copy().prerelease }}</span>
              }
            </h2>
            <p>{{ release.body }}</p>
          </section>
        }
      }
    </main>
  `,
  styleUrl: '../page.css',
})
export class Changelog extends PageBase {
  protected readonly releases = inject(SiteContent).notes;

  protected readonly copy = this.translate.group({
    title: 'nav.changelog',
    intro: 'changelog.intro',
    empty: 'changelog.empty',
    prerelease: 'changelog.prerelease',
  });
}
