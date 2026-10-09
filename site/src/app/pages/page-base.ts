import { Signal, computed, effect, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Translate } from '../content/translate';
import { Lang, defaultLang, langFromSegment } from '../i18n/locales';
import { PageLanguage } from '../i18n/page-language';
import { PageMeta } from '../i18n/page-meta';
import { UiKey } from '../content/ui';
import { languagesOf, pageOfPath, pageRoutes, pathOf } from '../app.routes';

/**
 * What every content page needs: its language, its strings, and its head.
 *
 * A base class rather than twelve copies of the same lines, and the two things
 * it carries are the two that must not be forgotten on any single page:
 *
 *  - the page's language, which sets `<html lang>` and is what a screen reader
 *    picks its voice from. Forgetting it on one page is the defect the old site
 *    shipped on every prefixed language (enigma2_player-w83), and a page that
 *    cannot forget it beats a review that has to notice.
 *  - the document title. The scaffold gave all 66 pages the same one, which is
 *    the first thing a screen reader reads and the only thing that tells two
 *    tabs apart (WCAG 2.4.2).
 *
 * The language comes from the route's own data, never from the URL: the route
 * tree knows which language it built, and guessing is what caused that defect.
 */
export abstract class PageBase {
  /**
   * Protected, not private: a page that needs more of its route data - which
   * of two shop views, which of three legal texts - reads it from here rather
   * than injecting a second `ActivatedRoute`.
   */
  protected readonly route = inject(ActivatedRoute);

  private readonly pageLanguage = inject(PageLanguage);
  private readonly pageMeta = inject(PageMeta);

  protected readonly translate = inject(Translate);

  /** The language this route was declared for. */
  readonly lang: Signal<Lang> = computed(() =>
    langFromSegment(this.route.snapshot.data['lang'] ?? defaultLang),
  );

  constructor() {
    // In an effect, not inline: a base constructor runs BEFORE the subclass's
    // field initialisers, so `titleKey()` on a page that derives its title
    // from its own state (the shop's two views) would read a field that does
    // not exist yet. An effect runs after construction and before the page is
    // serialised, which is what prerendering needs.
    effect(() => {
      const lang = this.lang();
      this.pageLanguage.set(lang);
      this.applyMeta(lang);
    });
  }

  /**
   * The UI key of this page's own title.
   *
   * Overridden where a page's heading is not its nav label - the shop pages
   * have two views behind one component, and the legal pages carry their title
   * in their own content.
   */
  protected titleKey(): UiKey | null {
    const page = this.currentPage();
    return page?.navKey ?? null;
  }

  /** The UI key of a sentence for a search result, or null for the default. */
  protected descriptionKey(): UiKey | null {
    return null;
  }

  /**
   * The page's title as text, for a page whose title is not a UI key.
   *
   * The legal texts carry their own titles in `legal-copy.ts`, because they
   * exist in two languages where everything else exists in five. Returning a
   * string here beats inventing UI keys that duplicate them.
   */
  protected titleText(): string | null {
    return null;
  }

  private applyMeta(lang: Lang): void {
    const page = this.currentPage();
    const titleKey = this.titleKey();
    const descriptionKey = this.descriptionKey();
    const text = this.titleText();
    this.pageMeta.set({
      lang,
      title:
        text ??
        (titleKey ? this.translate.of(titleKey, lang) : this.translate.of('site.title', lang)),
      description: descriptionKey ? this.translate.of(descriptionKey, lang) : undefined,
      path: page ? pathOf(page, lang) : '/',
      alternates: page
        ? languagesOf(page).map((other) => ({ lang: other, path: pathOf(page, other) }))
        : undefined,
    });
  }

  /**
   * Which page definition is being rendered.
   *
   * From the route's own path rather than from a field each page would have to
   * set: one more thing per page is one more thing to get wrong, and the route
   * already knows.
   */
  private currentPage() {
    // `?? []` because a test may hand in a minimal route stub. The fallback is
    // the landing definition, which means a wrong-but-harmless canonical URL
    // in a test rather than a crash in a constructor - and in the real app
    // the field is always there.
    const segments = (this.route.snapshot.pathFromRoot ?? [])
      .flatMap((entry) => entry.url.map((segment) => segment.path))
      .join('/');
    return pageOfPath(`/${segments}`) ?? pageRoutes.find((page) => page.id === 'landing');
  }
}
