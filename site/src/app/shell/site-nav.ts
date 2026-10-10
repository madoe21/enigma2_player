import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';

import { Translate } from '../content/translate';
import { Lang, locales, localePath } from '../i18n/locales';
import { PageLanguage } from '../i18n/page-language';
import { languagesOf, pageOfPath, pageRoutes, pathOf } from '../app.routes';
import { UiKey } from '../content/ui';

/** One entry in the main navigation. */
interface NavItem {
  readonly id: string;
  readonly href: string;
  readonly label: string;
}

/**
 * The main navigation and the language switcher.
 *
 * Built from the route definitions rather than from its own list, so a page
 * that exists is linked and a link that exists leads somewhere. The Astro
 * version iterated its own `sections` array, which is why a section could be
 * in the nav and 404 - it kept a second list of "sections that have a real
 * page" to work around exactly that.
 *
 * `routerLinkActive` sets `aria-current="page"`, which is what tells a screen
 * reader which entry is the current one; a bold font alone says it only to
 * people who can see it (WCAG 1.3.1).
 */
@Component({
  selector: 'site-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="nav" [attr.aria-label]="copy().mainNav">
      <a class="nav__brand" [routerLink]="home()">{{ copy().title }}</a>
      <ul class="nav__links">
        @for (item of items(); track item.id) {
          <li>
            <a
              [routerLink]="item.href"
              routerLinkActive
              ariaCurrentWhenActive="page"
              [routerLinkActiveOptions]="{ exact: true }"
            >
              {{ item.label }}
            </a>
          </li>
        }
      </ul>
      <ul class="nav__langs" [attr.aria-label]="copy().languageNav">
        @for (option of languages(); track option.lang) {
          <li>
            <a
              [routerLink]="option.href"
              [attr.aria-current]="option.lang === current() ? 'true' : null"
              [attr.lang]="option.lang"
              [attr.hreflang]="option.lang"
            >
              {{ option.name }}
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styleUrl: './site-nav.css',
})
export class SiteNav {
  private readonly translate = inject(Translate);
  private readonly pageLanguage = inject(PageLanguage);
  private readonly router = inject(Router);

  /**
   * The path currently shown, so the language switcher can stay on this page.
   *
   * From the router rather than from `location`, so it is also right while the
   * pages are prerendered - where there is no browser URL at all.
   */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly current = this.pageLanguage.lang;

  protected readonly copy = this.translate.group({
    title: 'site.title',
    mainNav: 'nav.main',
    languageNav: 'nav.languages',
  });

  protected readonly home = computed(() => localePath('', this.current()));

  /**
   * Every page except the landing page, in the order the definitions list
   * them - the order the old site showed and the order a returning visitor
   * expects to find things in.
   */
  protected readonly items = computed<readonly NavItem[]>(() => {
    const lang = this.current();
    // The landing page first and by name, the way the Astro nav had it. The
    // brand link goes to the same place, but "Start" is the entry a visitor
    // looks for in a list of links - and the comparison against the old build
    // is what noticed it had gone missing.
    const home: NavItem = {
      id: 'landing',
      href: localePath('', lang),
      label: this.translate.of('nav.home', lang),
    };
    return [
      home,
      ...pageRoutes
        .filter((page) => page.id !== 'landing' && (page.languages ?? locales).includes(lang))
        .filter((page) => page.navKey !== undefined)
        .map((page) => ({
          id: page.id,
          href: pathOf(page, lang),
          label: this.translate.of(page.navKey as UiKey, lang),
        })),
    ];
  });

  /**
   * The language switcher, pointing at the same page in the other language.
   *
   * Staying on the page matters: a visitor on the FAQ who switches to English
   * wants the English FAQ, not the start page. Where a page does not exist in
   * the other language - the legal texts - the switcher falls back to that
   * language's landing page rather than offering a dead link.
   */
  protected readonly languages = computed(() => {
    const page = pageOfPath(this.url().split('?')[0].split('#')[0]);
    return locales.map((lang) => ({
      lang,
      name: LANGUAGE_NAMES[lang],
      href: page && languagesOf(page).includes(lang) ? pathOf(page, lang) : localePath('', lang),
    }));
  });
}

/**
 * The languages in their own names.
 *
 * "Deutsch", not "German": a language switcher is read by someone looking for
 * their own language, and they recognise its own name.
 */
const LANGUAGE_NAMES: Record<Lang, string> = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
};
