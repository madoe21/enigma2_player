import { DOCUMENT, Injectable, inject, signal } from '@angular/core';

import { Lang, defaultLang } from './locales';

/**
 * Writes the active language onto the document element, and tells the shell
 * which language it is.
 *
 * `<html lang>` is not decoration: WCAG 2.2 success criterion 3.1.1 requires
 * the page's language to be machine-readable, and a screen reader picks its
 * voice from it. The Astro site served `/fr` with `lang="de"`, so French text
 * came out with German pronunciation - unintelligible rather than merely
 * untidy (enigma2_player-w83).
 *
 * Set through [DOCUMENT] rather than `document` directly so it also runs while
 * the pages are being prerendered, where there is no browser global. That is
 * the only place it matters for a static site: the attribute has to be in the
 * emitted HTML, not applied by a script after the fact - a crawler and an
 * assistive technology both read the file.
 *
 * The [lang] signal exists because the shell needs the same answer and must
 * not guess it. Pieces outside the routed page - the cookie dialog, the footer
 * - are rendered by the shell, which has no route of its own; reading the URL
 * to find out would be exactly the guess that mislabelled `/fr`. The page
 * knows its language from its route data and publishes it here.
 */
@Injectable({ providedIn: 'root' })
export class PageLanguage {
  private readonly document = inject(DOCUMENT);

  private readonly active = signal<Lang>(defaultLang);

  /** The language of the page currently rendered. */
  readonly lang = this.active.asReadonly();

  set(lang: Lang): void {
    this.document.documentElement.lang = lang;
    this.active.set(lang);
  }
}
