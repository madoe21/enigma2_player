import { Injectable, computed, inject } from '@angular/core';

import { PageLanguage } from '../i18n/page-language';
import { Lang } from '../i18n/locales';
import { pageRoutes, pathOf } from '../app.routes';
import { LEGAL_COPY, LegalLang, isLegalLang } from './legal-copy';

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
 * page and the cookie dialog, which has to point at the policy it is asking
 * about. Two independent copies of "where is the imprint" is how one of them
 * ends up pointing at a page that was renamed.
 *
 * A page in a language without its own legal text (es, fr, it) links to the
 * English version, which is the honest fallback: the texts exist in German and
 * English on purpose, and sending a French reader to an unchecked machine
 * translation of a privacy policy would be worse than sending them to English.
 */
@Injectable({ providedIn: 'root' })
export class LegalLinks {
  private readonly pageLanguage = inject(PageLanguage);

  readonly links = computed<readonly LegalLink[]>(() => {
    const lang = this.pageLanguage.lang();
    const target = this.targetLang(lang);
    const labels = LEGAL_COPY[target].links;
    return (['imprint', 'privacy', 'cookies'] as const).map((id) => ({
      id,
      href: this.hrefOf(id, target),
      label: labels[id],
    }));
  });

  /** The cookie policy on its own - the dialog links to exactly this one. */
  readonly cookiePolicy = computed<LegalLink>(
    () => this.links().find((link) => link.id === 'cookies')!,
  );

  private targetLang(lang: Lang): LegalLang {
    return isLegalLang(lang) ? lang : 'en';
  }

  private hrefOf(id: LegalLink['id'], lang: LegalLang): string {
    const page = pageRoutes.find((candidate) => candidate.id === id);
    if (!page) {
      // A link to a page that no longer exists is a defect, and a silent
      // fallback to the start page would hide it until someone clicks.
      throw new Error(`no route defined for legal page "${id}"`);
    }
    return pathOf(page, lang);
  }
}
