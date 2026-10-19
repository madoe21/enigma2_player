import { Component, computed, inject } from '@angular/core';

import { PageBase } from '../page-base';
import { ReleaseBody } from './release-body';
import { SiteContent } from '../../content/site-content';
import { formatDate } from '../../i18n/format-date';
import { parseReleaseNotes } from '../../content/release-notes';

/**
 * What changed per release.
 *
 * Baked in at build time for the same reason as the downloads: no request
 * leaves the visitor's browser to read it.
 *
 * The body is markdown - it is written in the application's `CHANGELOG.md` and
 * published to the GitHub release - and this page used to print it as text
 * with `white-space: pre-line`. That kept the bytes honest and the page
 * unreadable: `**bold**`, `- `, `### Downloads` and whole pipe tables on
 * screen, every 80-column wrap rendered as a line break, and ten separate
 * changes in one block (enigma2_player-ryy). It is parsed into blocks now and
 * rendered as elements - still no HTML from the API, still nothing fetched.
 */
@Component({
  selector: 'site-changelog',
  imports: [ReleaseBody],
  template: `
    <main class="page">
      <h1>{{ copy().title }}</h1>
      <p>{{ copy().intro }}</p>

      @if (entries().length === 0) {
        <p>{{ copy().empty }}</p>
      } @else {
        @for (entry of entries(); track entry.tag) {
          <article class="release">
            <h2 class="release__title">
              <span class="release__version">{{ entry.title }}</span>
              @if (entry.date) {
                <span class="release__date muted">{{ entry.date }}</span>
              }
              @if (entry.prerelease) {
                <span class="release__badge">{{ copy().prerelease }}</span>
              }
            </h2>
            <site-release-body [blocks]="entry.blocks" />
          </article>
        }
      }
    </main>
  `,
  styleUrls: ['../page.css', './changelog.css'],
})
export class Changelog extends PageBase {
  private readonly releases = inject(SiteContent).notes;

  /**
   * The releases, each with its heading ready and its body parsed.
   *
   * A computed and not a method per release: the parse runs once per release
   * per language change instead of on every change detection pass, and the
   * template stays a list of fields.
   */
  protected readonly entries = computed(() =>
    this.releases().map((release) => ({
      tag: release.tag,
      title: release.name || release.tag,
      date: formatDate(release.publishedAt, this.lang()),
      prerelease: release.prerelease,
      blocks: parseReleaseNotes(release.body),
    })),
  );

  protected readonly copy = this.translate.group({
    title: 'nav.changelog',
    intro: 'changelog.intro',
    empty: 'changelog.empty',
    prerelease: 'changelog.prerelease',
  });
}
