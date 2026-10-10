import { Injectable, computed, inject } from '@angular/core';

import { Translate } from '../content/translate';
import { Lang } from '../i18n/locales';
import { PageLanguage } from '../i18n/page-language';
import { legalLocales } from './legal-locales';
import { pageRoutes, pathOf } from '../app.routes';

/** A link to a legal text: where it goes and what it is called. */
export interface LegalLink {
  readonly id: 'imprint' | 'privacy' | 'cookies';
  readonly href: string;
  readonly label: string;
}

/**
 * The three legal links, resolved for the page currently being rendered.
 *
 * In one place because two surfaces need the same answer - the footer on every
 * page, and the cookie dialog, which has to point at the policy it is asking
 * about. Two independent copies of "where is the imprint" is how one of them
 * ends up pointing at a page that was renamed.
 *
 * The labels come from `ui.ts`, NOT from `legal-copy.ts`, and that is a
 * payload decision rather than a style one: the footer is in the shell, so
 * whatever it imports is in the initial bundle. Importing the legal copy for
 * three words pulled the full imprint, privacy policy and cookie policy - in
 * two languages - into the first request of every page. Measured: the start
 * page needed 398 KiB with it, and the texts belong in the lazily loaded
 * legal page where only a reader of them pays for them (enigma2_player-9v1).
 *
 * A page in a language without its own legal text (es, fr, it) links to the
 * English version, which is the honest fallback: the texts exist in German and
 * English on purpose, and sending a French reader to an unchecked machine
 * translation of a privacy policy would be worse.
 */
@Injectable({ providedIn: 'root' })
export class LegalLinks {
  private readonly pageLanguage = inject(PageLanguage);
  private readonly translate = inject(Translate);

  readonly links = computed<readonly LegalLink[]>(() => {
    const lang = this.pageLanguage.lang();
    const target = this.targetLang(lang);
    return (['imprint', 'privacy', 'cookies'] as const).map((id) => ({
      id,
      href: this.hrefOf(id, target),
      // The label in the page's own language even when the text itself is
      // English: a French visitor reads "Mentions légales" and lands on the
      // English imprint, which is the gap this site admits to.
      label: this.translate.of(`legal.${id}`, lang),
    }));
  });

  /** The cookie policy on its own - the dialog links to exactly this one. */
  readonly cookiePolicy = computed<LegalLink>(() =>
    this.links().find((link) => link.id === 'cookies')!,
  );

  private targetLang(lang: Lang): Lang {
    return (legalLocales as readonly string[]).includes(lang) ? lang : 'en';
  }

  private hrefOf(id: LegalLink['id'], lang: Lang): string {
    const page = pageRoutes.find((candidate) => candidate.id === id);
    if (!page) {
      // A link to a page that no longer exists is a defect, and a silent
      // fallback to the start page would hide it until someone clicked.
      throw new Error(`no route defined for legal page "${id}"`);
    }
    return pathOf(page, lang);
  }
}
