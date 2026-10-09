import { DOCUMENT, inject, Injectable } from '@angular/core';

import { Lang } from './locales';

/**
 * Writes the active language onto the document element.
 *
 * `<html lang>` is not decoration: WCAG 2.2 success criterion 3.1.1 requires
 * the page's language to be machine-readable, and a screen reader picks its
 * voice from it. The Astro site served `/fr` with `lang="de"`, so French text
 * came out with German pronunciation - unintelligible rather than merely
 * untidy (enigma2_player_source-w83).
 *
 * Set through [DOCUMENT] rather than `document` directly so it also runs while
 * the pages are being prerendered, where there is no browser global. That is
 * the only place it matters for a static site: the attribute has to be in the
 * emitted HTML, not applied by a script after the fact - a crawler and an
 * assistive technology both read the file.
 */
@Injectable({ providedIn: 'root' })
export class PageLanguage {
  private readonly document = inject(DOCUMENT);

  set(lang: Lang): void {
    this.document.documentElement.lang = lang;
  }
}
