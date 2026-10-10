import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { Lang, locales, localePath } from './locales';
import { Translate } from '../content/translate';
import { UiKey } from '../content/ui';

/** What one page wants in the document head. */
export interface PageMetaInput {
  /** The page's own name, already translated. The site name is appended. */
  readonly title: string;
  /** One sentence for a search result and a shared link. */
  readonly description?: string;
  /** The page's site path, for the canonical URL and the language alternates. */
  readonly path: string;
  readonly lang: Lang;
  /** Where this page exists in other languages, for hreflang. */
  readonly alternates?: readonly { readonly lang: Lang; readonly path: string }[];
}

/** Where the site is published; needed for absolute URLs in the head. */
const SITE_ORIGIN = 'https://madoe21.github.io';
const BASE_PATH = '/enigma2_player';

/** Open Graph wants a locale, not a language. */
const OG_LOCALE: Record<Lang, string> = {
  de: 'de_DE',
  en: 'en_US',
  es: 'es_ES',
  fr: 'fr_FR',
  it: 'it_IT',
};

/**
 * Writes the document head for the page being rendered.
 *
 * This exists because the Angular scaffold gives every page the same `<title>`
 * from `index.html` - all 66 of them were called "site". A title is not
 * decoration: it is the first thing a screen reader announces on load and the
 * only thing that distinguishes two open tabs (WCAG 2.4.2), and it is what a
 * search result shows (`enigma2_player-9v1`). The Astro layout did all of this
 * per page, and losing it in the port would have been a quiet regression.
 *
 * Canonical, hreflang and Open Graph come along because they are the same
 * knowledge - which page this is, in which language, and where its siblings
 * are - and splitting that across two places is how they drift apart.
 */
@Injectable({ providedIn: 'root' })
export class PageMeta {
  private readonly title = inject(Title);

  /**
   * The last head written: the full title and the language.
   *
   * Published so the announcer can react to it rather than poll `Title`, which
   * is not reactive. It also fixes the ordering: an announcement that follows
   * this signal necessarily names the title that was just set, instead of
   * racing the page that sets it.
   */
  readonly current = signal<{ readonly title: string; readonly lang: Lang } | null>(null);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly translate = inject(Translate);

  /** Sets the head for a page. Called by every page through `PageBase`. */
  set(input: PageMetaInput): void {
    const siteName = this.translate.of('site.title', input.lang);
    const description = input.description ?? this.translate.of('site.tagline' as UiKey, input.lang);
    const full = input.title === siteName ? siteName : `${input.title} — ${siteName}`;
    const canonical = this.absolute(input.path);

    this.title.setTitle(full);
    this.current.set({ title: full, lang: input.lang });
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    // Open Graph and Twitter: what a shared link looks like. Same values as
    // the title and description rather than a second set to keep in step.
    for (const [attribute, name, content] of [
      ['property', 'og:type', 'website'],
      ['property', 'og:site_name', siteName],
      ['property', 'og:title', full],
      ['property', 'og:description', description],
      ['property', 'og:url', canonical],
      ['property', 'og:image', this.absolute('og.svg')],
      ['property', 'og:locale', OG_LOCALE[input.lang]],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', full],
      ['name', 'twitter:description', description],
      ['name', 'twitter:image', this.absolute('og.svg')],
    ] as const) {
      this.meta.updateTag({ [attribute]: name, content } as Record<string, string>);
    }

    this.setLink('canonical', canonical);
    this.setAlternates(input);
  }

  /**
   * `rel="alternate" hreflang` for every language this page exists in, plus
   * `x-default`.
   *
   * Without it, five language trees of the same content look to a search
   * engine like five competing pages rather than one page in five languages -
   * and the one it picks is not the one a reader wanted.
   */
  private setAlternates(input: PageMetaInput): void {
    for (const existing of Array.from(
      this.document.head.querySelectorAll('link[rel="alternate"]'),
    )) {
      existing.remove();
    }
    const alternates =
      input.alternates ?? locales.map((lang) => ({ lang, path: localePath('', lang) }));
    for (const alternate of alternates) {
      this.appendLink('alternate', this.absolute(alternate.path), alternate.lang);
    }
    const fallback = alternates.find((alternate) => alternate.lang === 'de') ?? alternates[0];
    if (fallback) {
      this.appendLink('alternate', this.absolute(fallback.path), 'x-default');
    }
  }

  /** The absolute URL of a site path, base path included. */
  private absolute(path: string): string {
    const clean = path.replace(/^\/+/, '');
    return `${SITE_ORIGIN}${BASE_PATH}/${clean}`;
  }

  private setLink(rel: string, href: string): void {
    const existing = this.document.head.querySelector(`link[rel="${rel}"]`);
    if (existing) {
      existing.setAttribute('href', href);
      return;
    }
    this.appendLink(rel, href);
  }

  private appendLink(rel: string, href: string, hreflang?: string): void {
    const link = this.document.createElement('link');
    link.setAttribute('rel', rel);
    link.setAttribute('href', href);
    if (hreflang) {
      link.setAttribute('hreflang', hreflang);
    }
    this.document.head.appendChild(link);
  }
}
