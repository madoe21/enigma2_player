import { Injectable, Signal, computed, inject } from '@angular/core';

import { Lang, defaultLang } from '../i18n/locales';
import { PageLanguage } from '../i18n/page-language';
import { UiKey, ui } from './ui';

/**
 * Looks up a UI string for the page's language, falling back to German.
 *
 * The fallback is the Astro site's behaviour and it is kept deliberately: the
 * five dictionaries are not equally complete, and a missing key has to render
 * *something* a reader can act on rather than an empty element or a raw key.
 * `es`, `fr` and `it` are machine translations awaiting a native speaker
 * (`enigma2_player-4dx`), so the gaps are known and tracked rather than
 * guessed at here.
 */
@Injectable({ providedIn: 'root' })
export class Translate {
  private readonly pageLanguage = inject(PageLanguage);

  /** The language strings are currently resolved in. */
  readonly lang = this.pageLanguage.lang;

  /** One string, reactive to the page's language. */
  t(key: UiKey): Signal<string> {
    return computed(() => this.of(key, this.pageLanguage.lang()));
  }

  /** One string, for code that already knows the language. */
  of(key: UiKey, lang: Lang = this.pageLanguage.lang()): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  }

  /**
   * Several strings at once, as a plain object keyed the way a template wants.
   *
   * A template reads `copy().title`, not `t('a.b.c')()` eleven times: one
   * computed per page keeps the template legible and re-evaluates the whole
   * group when the language changes, which is the only time any of it changes.
   */
  group<K extends string>(keys: Readonly<Record<K, UiKey>>): Signal<Record<K, string>> {
    return computed(() => {
      const lang = this.pageLanguage.lang();
      const out = {} as Record<K, string>;
      for (const [name, key] of Object.entries(keys) as [K, UiKey][]) {
        out[name] = this.of(key, lang);
      }
      return out;
    });
  }
}
