import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Injectable, afterNextRender, effect, inject, signal } from '@angular/core';

import { Translate } from '../content/translate';
import { PageMeta } from './page-meta';

/**
 * Says out loud what just changed: the page, and the language.
 *
 * A single-page application replaces the document without a page load, so a
 * screen reader is told nothing: the URL changed, the content changed, and the
 * last thing NVDA announced is still the link that was activated. That is the
 * defect this fixes, and it is the one the bead names (enigma2_player-iaa,
 * WCAG 4.1.3 status messages).
 *
 * Two announcements, deliberately different:
 *  - the page, with its title, so it is clear *which* page arrived;
 *  - the language, in the language it switched to, because "Sprache
 *    gewechselt: Deutsch" read with an English voice is the joke that tells
 *    the user it did not work.
 *
 * Nothing is announced for the first render. The browser announces a page load
 * on its own, and talking over it is worse than staying quiet.
 */
@Injectable({ providedIn: 'root' })
export class RouteAnnouncer {
  private readonly announcer = inject(LiveAnnouncer);
  private readonly translate = inject(Translate);
  private readonly pageMeta = inject(PageMeta);

  private readonly ready = signal(false);
  private lastLang: string | null = null;
  private lastTitle: string | null = null;

  constructor() {
    // Only in the browser, and only after the first paint: during prerender
    // there is nobody to tell, and an announcement baked into a live region
    // is text a screen reader may read at load, out of context.
    afterNextRender(() => this.ready.set(true));

    effect(() => {
      const head = this.pageMeta.current();
      if (head === null) {
        return;
      }
      const { lang, title } = head;
      // Two reasons to record without announcing: the page is being
      // prerendered (nobody to tell), or this is the first head we have seen
      // (the browser announces a page load itself, and "language changed" on
      // arrival is simply wrong - which is what the test caught).
      if (!this.ready() || this.lastLang === null) {
        this.lastLang = lang;
        this.lastTitle = title;
        return;
      }
      if (lang !== this.lastLang) {
        this.lastLang = lang;
        this.lastTitle = title;
        // Assertive: the visitor just asked for this, and it is short.
        this.announcer.announce(this.translate.of('a11y.languageChanged', lang), 'assertive');
        return;
      }
      if (title !== this.lastTitle) {
        this.lastTitle = title;
        this.announcer.announce(
          `${this.translate.of('a11y.pageChanged', lang)} ${title}`,
          'polite',
        );
      }
    });
  }
}
