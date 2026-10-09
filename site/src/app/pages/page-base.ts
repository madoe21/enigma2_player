import { Signal, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Translate } from '../content/translate';
import { Lang, defaultLang, langFromSegment } from '../i18n/locales';
import { PageLanguage } from '../i18n/page-language';

/**
 * What every content page needs: its language, and its strings.
 *
 * A base class rather than twelve copies of the same four lines. The one piece
 * of behaviour it carries is the one that must not be forgotten: publishing the
 * page's language, which sets `<html lang>` and is what a screen reader picks
 * its voice from. Forgetting it on a single page is exactly the defect the old
 * site shipped on `/fr` and `/it` (enigma2_player-w83), and a page that cannot
 * forget it is better than a review that has to notice.
 *
 * The language comes from the route's own data, never from the URL: the route
 * tree knows which language it built, and guessing is what caused that defect.
 */
export abstract class PageBase {
  /** Protected, not private: a page that needs more of its route data - which
   * of two shop views, which of three legal texts - reads it from here rather
   * than injecting a second ActivatedRoute. */
  protected readonly route = inject(ActivatedRoute);

  private readonly pageLanguage = inject(PageLanguage);

  protected readonly translate = inject(Translate);

  /** The language this route was declared for. */
  readonly lang: Signal<Lang> = computed(() =>
    langFromSegment(this.route.snapshot.data['lang'] ?? defaultLang),
  );

  constructor() {
    this.pageLanguage.set(this.lang());
  }
}
